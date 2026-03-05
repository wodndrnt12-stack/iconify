---
name: swift-actor-persistence
description: 액터를 사용한 Swift의 스레드 안전 데이터 영속화 — 설계 단계에서 데이터 레이스를 제거하는 파일 백업 저장소를 갖춘 인메모리 캐시.
origin: ECC
---

# 스레드 안전 영속화를 위한 Swift 액터

Swift 액터를 사용한 스레드 안전 데이터 영속화 계층 구축 패턴. 인메모리 캐싱과 파일 백업 저장소를 결합하여 컴파일 시점에 데이터 레이스를 제거합니다.

## 활성화 시점

- Swift 5.5+에서 데이터 영속화 계층 구축 시
- 공유 가변 상태에 대한 스레드 안전 접근이 필요할 때
- 수동 동기화(락, DispatchQueue)를 제거하고 싶을 때
- 로컬 저장소가 있는 오프라인 우선 앱 구축 시

## 핵심 패턴

### 액터 기반 리포지토리

액터 모델은 직렬화된 접근을 보장합니다 — 데이터 레이스 없음, 컴파일러가 강제 적용.

```swift
public actor LocalRepository<T: Codable & Identifiable> where T.ID == String {
    private var cache: [String: T] = [:]
    private let fileURL: URL

    public init(directory: URL = .documentsDirectory, filename: String = "data.json") {
        self.fileURL = directory.appendingPathComponent(filename)
        // Synchronous load during init (actor isolation not yet active)
        self.cache = Self.loadSynchronously(from: fileURL)
    }

    // MARK: - Public API

    public func save(_ item: T) throws {
        cache[item.id] = item
        try persistToFile()
    }

    public func delete(_ id: String) throws {
        cache[id] = nil
        try persistToFile()
    }

    public func find(by id: String) -> T? {
        cache[id]
    }

    public func loadAll() -> [T] {
        Array(cache.values)
    }

    // MARK: - Private

    private func persistToFile() throws {
        let data = try JSONEncoder().encode(Array(cache.values))
        try data.write(to: fileURL, options: .atomic)
    }

    private static func loadSynchronously(from url: URL) -> [String: T] {
        guard let data = try? Data(contentsOf: url),
              let items = try? JSONDecoder().decode([T].self, from: data) else {
            return [:]
        }
        return Dictionary(uniqueKeysWithValues: items.map { ($0.id, $0) })
    }
}
```

### 사용법

액터 격리로 인해 모든 호출이 자동으로 비동기화됩니다:

```swift
let repository = LocalRepository<Question>()

// 읽기 — 인메모리 캐시에서 빠른 O(1) 조회
let question = await repository.find(by: "q-001")
let allQuestions = await repository.loadAll()

// 쓰기 — 캐시를 업데이트하고 파일에 원자적으로 영속화
try await repository.save(newQuestion)
try await repository.delete("q-001")
```

### @Observable ViewModel과 결합

```swift
@Observable
final class QuestionListViewModel {
    private(set) var questions: [Question] = []
    private let repository: LocalRepository<Question>

    init(repository: LocalRepository<Question> = LocalRepository()) {
        self.repository = repository
    }

    func load() async {
        questions = await repository.loadAll()
    }

    func add(_ question: Question) async throws {
        try await repository.save(question)
        questions = await repository.loadAll()
    }
}
```

## 주요 설계 결정

| 결정 | 근거 |
|----------|-----------|
| 액터 (클래스 + 락 대신) | 컴파일러가 강제하는 스레드 안전성, 수동 동기화 불필요 |
| 인메모리 캐시 + 파일 영속화 | 캐시에서 빠른 읽기, 디스크에 내구성 있는 쓰기 |
| 동기적 init 로딩 | 비동기 초기화 복잡성 방지 |
| ID로 키가 지정된 딕셔너리 | 식별자로 O(1) 조회 |
| `Codable & Identifiable`에 대한 제네릭 | 모든 모델 유형에서 재사용 가능 |
| 원자적 파일 쓰기 (`.atomic`) | 충돌 시 부분 쓰기 방지 |

## 모범 사례

- **`Sendable` 유형 사용** — 액터 경계를 넘는 모든 데이터에 적용
- **액터의 공개 API를 최소한으로 유지** — 영속화 세부사항이 아닌 도메인 작업만 노출
- **`.atomic` 쓰기 사용** — 앱이 쓰기 중간에 충돌할 경우 데이터 손상 방지
- **`init`에서 동기적으로 로드** — 비동기 초기화는 로컬 파일에 대한 최소한의 이점으로 복잡성 추가
- **`@Observable` ViewModel과 결합** — 반응형 UI 업데이트

## 피해야 할 안티패턴

- 새 Swift 동시성 코드에서 액터 대신 `DispatchQueue` 또는 `NSLock` 사용
- 내부 캐시 딕셔너리를 외부 호출자에게 노출
- 유효성 검사 없이 파일 URL을 구성 가능하게 만들기
- 모든 액터 메서드 호출이 `await`임을 잊기 — 호출자는 비동기 컨텍스트를 처리해야 함
- 액터 격리를 우회하기 위해 `nonisolated` 사용 (목적을 무력화함)

## 사용 시점

- iOS/macOS 앱의 로컬 데이터 저장소 (사용자 데이터, 설정, 캐시된 콘텐츠)
- 나중에 서버와 동기화하는 오프라인 우선 아키텍처
- 앱의 여러 부분이 동시에 접근하는 공유 가변 상태
- 현대 Swift 동시성으로 레거시 `DispatchQueue` 기반 스레드 안전성 교체
