---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift 코딩 스타일

> 이 파일은 [common/coding-style.md](../common/coding-style.md)를 Swift 특화 내용으로 확장한다.

## 포맷팅

- 자동 포맷에는 **SwiftFormat**, 스타일 강제에는 **SwiftLint**
- `swift-format`은 대안으로 Xcode 16+에 번들 포함됨

## 불변성

- `var`보다 `let` 선호 — 모든 것을 `let`으로 정의하고 컴파일러가 요구할 때만 `var`로 변경
- 기본적으로 값 의미론을 가진 `struct` 사용; 동일성 또는 참조 의미론이 필요한 경우에만 `class` 사용

## 명명 규칙

[Apple API 디자인 지침](https://www.swift.org/documentation/api-design-guidelines/)을 따른다:

- 사용 시점의 명확성 — 불필요한 단어 생략
- 타입이 아닌 역할로 메서드와 프로퍼티 이름 지정
- 전역 상수보다 `static let` 상수 사용

## 오류 처리

타입 throws (Swift 6+)와 패턴 매칭 사용:

```swift
func load(id: String) throws(LoadError) -> Item {
    guard let data = try? read(from: path) else {
        throw .fileNotFound(id)
    }
    return try decode(data)
}
```

## 동시성

Swift 6 엄격 동시성 검사 활성화. 선호 사항:

- 격리 경계를 넘는 데이터에는 `Sendable` 값 타입
- 공유 가변 상태에는 Actor
- 구조화되지 않은 `Task {}` 대신 구조화된 동시성 (`async let`, `TaskGroup`)
