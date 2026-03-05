---
name: swift-concurrency-6-2
description: Swift 6.2 접근하기 쉬운 동시성 — 기본적으로 단일 스레드, 명시적 백그라운드 오프로딩을 위한 @concurrent, MainActor 타입의 격리된 준수.
---

# Swift 6.2 접근하기 쉬운 동시성

코드가 기본적으로 단일 스레드로 실행되고 동시성이 명시적으로 도입되는 Swift 6.2 동시성 모델 채택 패턴. 성능을 희생하지 않고 일반적인 데이터 레이스 오류를 제거합니다.

## 활성화 시점

- Swift 5.x 또는 6.0/6.1 프로젝트를 Swift 6.2로 마이그레이션 시
- 데이터 레이스 안전성 컴파일러 오류 해결 시
- MainActor 기반 앱 아키텍처 설계 시
- CPU 집약적 작업을 백그라운드 스레드로 오프로딩 시
- MainActor 격리 타입에 프로토콜 준수 구현 시
- Xcode 26에서 Approachable Concurrency 빌드 설정 활성화 시

## 핵심 문제: 암묵적 백그라운드 오프로딩

Swift 6.1 이하에서는 비동기 함수가 백그라운드 스레드로 암묵적으로 오프로딩될 수 있어 겉보기에 안전한 코드에서도 데이터 레이스 오류가 발생했습니다:

```swift
// Swift 6.1: ERROR
@MainActor
final class StickerModel {
    let photoProcessor = PhotoProcessor()

    func extractSticker(_ item: PhotosPickerItem) async throws -> Sticker? {
        guard let data = try await item.loadTransferable(type: Data.self) else { return nil }

        // Error: Sending 'self.photoProcessor' risks causing data races
        return await photoProcessor.extractSticker(data: data, with: item.itemIdentifier)
    }
}
```

Swift 6.2는 이를 수정합니다: 비동기 함수는 기본적으로 호출 액터에 유지됩니다.

```swift
// Swift 6.2: OK — async가 MainActor에 유지되므로 데이터 레이스 없음
@MainActor
final class StickerModel {
    let photoProcessor = PhotoProcessor()

    func extractSticker(_ item: PhotosPickerItem) async throws -> Sticker? {
        guard let data = try await item.loadTransferable(type: Data.self) else { return nil }
        return await photoProcessor.extractSticker(data: data, with: item.itemIdentifier)
    }
}
```

## 핵심 패턴 — 격리된 준수

MainActor 타입이 이제 비격리 프로토콜을 안전하게 준수할 수 있습니다:

```swift
protocol Exportable {
    func export()
}

// Swift 6.1: ERROR — main actor 격리 코드로 교차됨
// Swift 6.2: OK — 격리된 준수 사용
extension StickerModel: @MainActor Exportable {
    func export() {
        photoProcessor.exportAsPNG()
    }
}
```

컴파일러는 준수가 main actor에서만 사용되도록 보장합니다:

```swift
// OK — ImageExporter도 @MainActor
@MainActor
struct ImageExporter {
    var items: [any Exportable]

    mutating func add(_ item: StickerModel) {
        items.append(item)  // Safe: same actor isolation
    }
}

// ERROR — 비격리 컨텍스트는 MainActor 준수를 사용할 수 없음
nonisolated struct ImageExporter {
    var items: [any Exportable]

    mutating func add(_ item: StickerModel) {
        items.append(item)  // Error: Main actor-isolated conformance cannot be used here
    }
}
```

## 핵심 패턴 — 전역 및 정적 변수

전역/정적 상태를 MainActor로 보호:

```swift
// Swift 6.1: ERROR — non-Sendable 타입에 공유 가변 상태가 있을 수 있음
final class StickerLibrary {
    static let shared: StickerLibrary = .init()  // Error
}

// 수정: @MainActor로 어노테이션
@MainActor
final class StickerLibrary {
    static let shared: StickerLibrary = .init()  // OK
}
```

### MainActor 기본 추론 모드

Swift 6.2는 MainActor가 기본으로 추론되는 모드를 도입합니다 — 수동 어노테이션 불필요:

```swift
// MainActor 기본 추론 활성화 시:
final class StickerLibrary {
    static let shared: StickerLibrary = .init()  // 암묵적으로 @MainActor
}

final class StickerModel {
    let photoProcessor: PhotoProcessor
    var selection: [PhotosPickerItem]  // 암묵적으로 @MainActor
}

extension StickerModel: Exportable {  // 암묵적으로 @MainActor 준수
    func export() {
        photoProcessor.exportAsPNG()
    }
}
```

이 모드는 옵트인이며 앱, 스크립트, 기타 실행 가능한 대상에 권장됩니다.

## 핵심 패턴 — 백그라운드 작업을 위한 @concurrent

실제 병렬처리가 필요할 때 `@concurrent`로 명시적으로 오프로딩:

> **중요:** 이 예시는 Approachable Concurrency 빌드 설정이 필요합니다 — SE-0466 (MainActor 기본 격리)과 SE-0461 (NonisolatedNonsendingByDefault). 이를 활성화하면 `extractSticker`가 호출자의 액터에 유지되어 가변 상태 접근이 안전해집니다. **이 설정 없이는 이 코드에 데이터 레이스가 있습니다** — 컴파일러가 표시합니다.

```swift
nonisolated final class PhotoProcessor {
    private var cachedStickers: [String: Sticker] = [:]

    func extractSticker(data: Data, with id: String) async -> Sticker {
        if let sticker = cachedStickers[id] {
            return sticker
        }

        let sticker = await Self.extractSubject(from: data)
        cachedStickers[id] = sticker
        return sticker
    }

    // 비용이 많이 드는 작업을 동시 스레드 풀로 오프로딩
    @concurrent
    static func extractSubject(from data: Data) async -> Sticker { /* ... */ }
}

// 호출자는 await 필요
let processor = PhotoProcessor()
processedPhotos[item.id] = await processor.extractSticker(data: data, with: item.id)
```

`@concurrent` 사용법:
1. 포함하는 타입을 `nonisolated`로 표시
2. 함수에 `@concurrent` 추가
3. 아직 비동기가 아니면 `async` 추가
4. 호출 사이트에 `await` 추가

## 주요 설계 결정

| 결정 | 근거 |
|----------|-----------|
| 기본적으로 단일 스레드 | 가장 자연스러운 코드는 데이터 레이스가 없음; 동시성은 옵트인 |
| Async가 호출 액터에 유지 | 데이터 레이스 오류를 유발한 암묵적 오프로딩 제거 |
| 격리된 준수 | MainActor 타입이 안전하지 않은 우회 없이 프로토콜 준수 가능 |
| `@concurrent` 명시적 옵트인 | 백그라운드 실행은 우연이 아닌 의도적인 성능 선택 |
| MainActor 기본 추론 | 앱 대상에서 `@MainActor` 어노테이션 보일러플레이트 감소 |
| 옵트인 채택 | 비파괴적 마이그레이션 경로 — 기능을 점진적으로 활성화 |

## 마이그레이션 단계

1. **Xcode에서 활성화**: 빌드 설정의 Swift 컴파일러 > 동시성 섹션
2. **SPM에서 활성화**: 패키지 매니페스트에서 `SwiftSettings` API 사용
3. **마이그레이션 도구 사용**: swift.org/migration을 통한 자동 코드 변경
4. **MainActor 기본값으로 시작**: 앱 대상에 추론 모드 활성화
5. **필요한 곳에 `@concurrent` 추가**: 먼저 프로파일링, 그 다음 핫 패스 오프로딩
6. **철저하게 테스트**: 데이터 레이스 문제가 컴파일 시점 오류가 됨

## 모범 사례

- **MainActor에서 시작** — 먼저 단일 스레드 코드 작성, 나중에 최적화
- **CPU 집약적 작업에만 `@concurrent` 사용** — 이미지 처리, 압축, 복잡한 계산
- **앱 대상에 MainActor 추론 모드 활성화** — 대부분 단일 스레드인 앱 대상에
- **오프로딩 전 프로파일링** — Instruments로 실제 병목 지점 찾기
- **MainActor로 전역 변수 보호** — 전역/정적 가변 상태에 액터 격리 필요
- **`nonisolated` 우회 대신 격리된 준수 사용** — `@Sendable` 래퍼 불필요
- **점진적으로 마이그레이션** — 빌드 설정에서 기능을 하나씩 활성화

## 피해야 할 안티패턴

- 모든 비동기 함수에 `@concurrent` 적용 (대부분 백그라운드 실행 불필요)
- 격리를 이해하지 않고 컴파일러 오류를 억제하기 위해 `nonisolated` 사용
- 액터가 동일한 안전성을 제공할 때 레거시 `DispatchQueue` 패턴 유지
- Foundation Models 동시성 관련 코드에서 `model.availability` 확인 건너뛰기
- 컴파일러와 싸우기 — 데이터 레이스를 보고한다면 코드에 실제 동시성 문제가 있는 것
- 모든 비동기 코드가 백그라운드에서 실행된다고 가정 (Swift 6.2 기본값: 호출 액터에 유지)

## 사용 시점

- 모든 새 Swift 6.2+ 프로젝트 (Approachable Concurrency가 권장 기본값)
- Swift 5.x 또는 6.0/6.1 동시성에서 기존 앱 마이그레이션
- Xcode 26 채택 중 데이터 레이스 안전성 컴파일러 오류 해결
- MainActor 중심 앱 아키텍처 구축 (대부분의 UI 앱)
- 성능 최적화 — 특정 무거운 계산을 백그라운드로 오프로딩
