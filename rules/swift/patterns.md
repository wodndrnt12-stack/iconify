---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift 패턴

> 이 파일은 [common/patterns.md](../common/patterns.md)를 Swift 특화 내용으로 확장한다.

## 프로토콜 지향 설계

작고 집중된 프로토콜 정의. 공유 기본값에는 프로토콜 확장 사용:

```swift
protocol Repository: Sendable {
    associatedtype Item: Identifiable & Sendable
    func find(by id: Item.ID) async throws -> Item?
    func save(_ item: Item) async throws
}
```

## 값 타입

- 데이터 전송 객체와 모델에는 구조체 사용
- 별개의 상태 모델링에는 연관 값을 가진 열거형 사용:

```swift
enum LoadState<T: Sendable>: Sendable {
    case idle
    case loading
    case loaded(T)
    case failed(Error)
}
```

## Actor 패턴

잠금이나 디스패치 큐 대신 공유 가변 상태에 Actor 사용:

```swift
actor Cache<Key: Hashable & Sendable, Value: Sendable> {
    private var storage: [Key: Value] = [:]

    func get(_ key: Key) -> Value? { storage[key] }
    func set(_ key: Key, value: Value) { storage[key] = value }
}
```

## 의존성 주입

기본 파라미터로 프로토콜 주입 — 프로덕션은 기본값 사용, 테스트는 모의 객체 주입:

```swift
struct UserService {
    private let repository: any UserRepository

    init(repository: any UserRepository = DefaultUserRepository()) {
        self.repository = repository
    }
}
```

## 참조

Actor 기반 영속성 패턴은 스킬: `swift-actor-persistence`를 참조.
프로토콜 기반 DI와 테스트는 스킬: `swift-protocol-di-testing`를 참조.
