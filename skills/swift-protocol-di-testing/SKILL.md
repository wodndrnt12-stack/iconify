---
name: swift-protocol-di-testing
description: 테스트 가능한 Swift 코드를 위한 프로토콜 기반 의존성 주입 — 집중된 프로토콜과 Swift Testing을 사용하여 파일 시스템, 네트워크, 외부 API를 모의 구현.
origin: ECC
---

# 테스트를 위한 Swift 프로토콜 기반 의존성 주입

외부 의존성(파일 시스템, 네트워크, iCloud)을 작고 집중된 프로토콜 뒤에 추상화하여 Swift 코드를 테스트 가능하게 만드는 패턴. I/O 없이 결정론적 테스트를 가능하게 합니다.

## 활성화 시점

- 파일 시스템, 네트워크, 또는 외부 API에 접근하는 Swift 코드 작성 시
- 실제 장애를 유발하지 않고 오류 처리 경로를 테스트해야 할 때
- 여러 환경(앱, 테스트, SwiftUI 미리보기)에서 작동하는 모듈 구축 시
- Swift 동시성(액터, Sendable)으로 테스트 가능한 아키텍처 설계 시

## 핵심 패턴

### 1. 작고 집중된 프로토콜 정의

각 프로토콜은 정확히 하나의 외부 관심사를 처리합니다.

```swift
// 파일 시스템 접근
public protocol FileSystemProviding: Sendable {
    func containerURL(for purpose: Purpose) -> URL?
}

// 파일 읽기/쓰기 작업
public protocol FileAccessorProviding: Sendable {
    func read(from url: URL) throws -> Data
    func write(_ data: Data, to url: URL) throws
    func fileExists(at url: URL) -> Bool
}

// 북마크 저장소 (예: 샌드박스 앱용)
public protocol BookmarkStorageProviding: Sendable {
    func saveBookmark(_ data: Data, for key: String) throws
    func loadBookmark(for key: String) throws -> Data?
}
```

### 2. 기본 (프로덕션) 구현 생성

```swift
public struct DefaultFileSystemProvider: FileSystemProviding {
    public init() {}

    public func containerURL(for purpose: Purpose) -> URL? {
        FileManager.default.url(forUbiquityContainerIdentifier: nil)
    }
}

public struct DefaultFileAccessor: FileAccessorProviding {
    public init() {}

    public func read(from url: URL) throws -> Data {
        try Data(contentsOf: url)
    }

    public func write(_ data: Data, to url: URL) throws {
        try data.write(to: url, options: .atomic)
    }

    public func fileExists(at url: URL) -> Bool {
        FileManager.default.fileExists(atPath: url.path)
    }
}
```

### 3. 테스트용 모의 구현 생성

```swift
public final class MockFileAccessor: FileAccessorProviding, @unchecked Sendable {
    public var files: [URL: Data] = [:]
    public var readError: Error?
    public var writeError: Error?

    public init() {}

    public func read(from url: URL) throws -> Data {
        if let error = readError { throw error }
        guard let data = files[url] else {
            throw CocoaError(.fileReadNoSuchFile)
        }
        return data
    }

    public func write(_ data: Data, to url: URL) throws {
        if let error = writeError { throw error }
        files[url] = data
    }

    public func fileExists(at url: URL) -> Bool {
        files[url] != nil
    }
}
```

### 4. 기본 매개변수로 의존성 주입

프로덕션 코드는 기본값 사용; 테스트는 모의 구현 주입.

```swift
public actor SyncManager {
    private let fileSystem: FileSystemProviding
    private let fileAccessor: FileAccessorProviding

    public init(
        fileSystem: FileSystemProviding = DefaultFileSystemProvider(),
        fileAccessor: FileAccessorProviding = DefaultFileAccessor()
    ) {
        self.fileSystem = fileSystem
        self.fileAccessor = fileAccessor
    }

    public func sync() async throws {
        guard let containerURL = fileSystem.containerURL(for: .sync) else {
            throw SyncError.containerNotAvailable
        }
        let data = try fileAccessor.read(
            from: containerURL.appendingPathComponent("data.json")
        )
        // Process data...
    }
}
```

### 5. Swift Testing으로 테스트 작성

```swift
import Testing

@Test("컨테이너 없음 상황에서 Sync manager 처리")
func testMissingContainer() async {
    let mockFileSystem = MockFileSystemProvider(containerURL: nil)
    let manager = SyncManager(fileSystem: mockFileSystem)

    await #expect(throws: SyncError.containerNotAvailable) {
        try await manager.sync()
    }
}

@Test("Sync manager가 데이터를 올바르게 읽음")
func testReadData() async throws {
    let mockFileAccessor = MockFileAccessor()
    mockFileAccessor.files[testURL] = testData

    let manager = SyncManager(fileAccessor: mockFileAccessor)
    let result = try await manager.loadData()

    #expect(result == expectedData)
}

@Test("Sync manager가 읽기 오류를 정상적으로 처리")
func testReadError() async {
    let mockFileAccessor = MockFileAccessor()
    mockFileAccessor.readError = CocoaError(.fileReadCorruptFile)

    let manager = SyncManager(fileAccessor: mockFileAccessor)

    await #expect(throws: SyncError.self) {
        try await manager.sync()
    }
}
```

## 모범 사례

- **단일 책임**: 각 프로토콜은 하나의 관심사만 처리해야 합니다 — 많은 메서드를 가진 "신" 프로토콜 만들지 않기
- **Sendable 준수**: 액터 경계를 넘어 프로토콜이 사용될 때 필요
- **기본 매개변수**: 프로덕션 코드는 실제 구현을 기본값으로 사용; 테스트만 모의 구현 지정 필요
- **오류 시뮬레이션**: 실패 경로 테스트를 위한 구성 가능한 오류 속성으로 모의 구현 설계
- **경계만 모의화**: 외부 의존성(파일 시스템, 네트워크, API)만 모의화, 내부 타입은 아님

## 피해야 할 안티패턴

- 모든 외부 접근을 다루는 하나의 큰 프로토콜 만들기
- 외부 의존성이 없는 내부 타입 모의화
- 적절한 의존성 주입 대신 `#if DEBUG` 조건 사용
- 액터와 함께 사용할 때 `Sendable` 준수 잊기
- 과도한 설계: 타입에 외부 의존성이 없으면 프로토콜 불필요

## 사용 시점

- 파일 시스템, 네트워크, 또는 외부 API에 접근하는 Swift 코드
- 실제 환경에서 유발하기 어려운 오류 처리 경로 테스트
- 앱, 테스트, SwiftUI 미리보기 컨텍스트에서 작동해야 하는 모듈 구축
- 테스트 가능한 아키텍처가 필요한 Swift 동시성(액터, 구조화된 동시성)을 사용하는 앱
