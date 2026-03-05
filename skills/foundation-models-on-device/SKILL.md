---
name: foundation-models-on-device
description: 온디바이스 LLM을 위한 Apple FoundationModels 프레임워크 — iOS 26+에서 텍스트 생성, @Generable을 사용한 가이드 생성, 도구 호출, 스냅샷 스트리밍.
---

# FoundationModels: 온디바이스 LLM (iOS 26)

FoundationModels 프레임워크를 사용하여 Apple의 온디바이스 언어 모델을 앱에 통합하기 위한 패턴. 텍스트 생성, `@Generable`을 사용한 구조화된 출력, 커스텀 도구 호출, 스냅샷 스트리밍을 다루며 — 모두 프라이버시와 오프라인 지원을 위해 온디바이스에서 실행됩니다.

## 활성화 시점

- Apple Intelligence 온디바이스를 사용한 AI 기능 구축
- 클라우드 의존 없이 텍스트 생성 또는 요약
- 자연어 입력에서 구조화된 데이터 추출
- 도메인별 AI 액션을 위한 커스텀 도구 호출 구현
- 실시간 UI 업데이트를 위한 구조화된 응답 스트리밍
- 프라이버시 보존 AI 필요 (데이터가 디바이스 밖으로 나가지 않음)

## 핵심 패턴 — 가용성 확인

세션 생성 전 항상 모델 가용성 확인:

```swift
struct GenerativeView: View {
    private var model = SystemLanguageModel.default

    var body: some View {
        switch model.availability {
        case .available:
            ContentView()
        case .unavailable(.deviceNotEligible):
            Text("이 디바이스는 Apple Intelligence를 지원하지 않습니다")
        case .unavailable(.appleIntelligenceNotEnabled):
            Text("설정에서 Apple Intelligence를 활성화하세요")
        case .unavailable(.modelNotReady):
            Text("모델을 다운로드 중이거나 준비되지 않았습니다")
        case .unavailable(let other):
            Text("모델 사용 불가: \(other)")
        }
    }
}
```

## 핵심 패턴 — 기본 세션

```swift
// 단일 회전: 매번 새 세션 생성
let session = LanguageModelSession()
let response = try await session.respond(to: "파리를 방문하기 좋은 달은 언제인가요?")
print(response.content)

// 다중 회전: 대화 컨텍스트를 위해 세션 재사용
let session = LanguageModelSession(instructions: """
    당신은 요리 도우미입니다.
    재료를 기반으로 레시피 제안을 제공하세요.
    제안은 간결하고 실용적으로 유지하세요.
    """)

let first = try await session.respond(to: "닭고기와 쌀이 있습니다")
let followUp = try await session.respond(to: "채식 옵션은 어떤가요?")
```

instructions를 위한 핵심 포인트:
- 모델의 역할 정의 ("당신은 멘토입니다")
- 해야 할 일 지정 ("캘린더 이벤트 추출을 도와주세요")
- 스타일 선호도 설정 ("최대한 간결하게 응답하세요")
- 안전 조치 추가 ("위험한 요청에 대해 '도움을 드릴 수 없습니다'로 응답하세요")

## 핵심 패턴 — @Generable을 사용한 가이드 생성

원시 문자열 대신 구조화된 Swift 타입 생성:

### 1. Generable 타입 정의

```swift
@Generable(description: "고양이에 대한 기본 프로필 정보")
struct CatProfile {
    var name: String

    @Guide(description: "고양이의 나이", .range(0...20))
    var age: Int

    @Guide(description: "고양이의 성격에 대한 한 문장 프로필")
    var profile: String
}
```

### 2. 구조화된 출력 요청

```swift
let response = try await session.respond(
    to: "귀여운 구조 고양이를 생성해주세요",
    generating: CatProfile.self
)

// 구조화된 필드에 직접 접근
print("이름: \(response.content.name)")
print("나이: \(response.content.age)")
print("프로필: \(response.content.profile)")
```

### 지원되는 @Guide 제약 조건

- `.range(0...20)` — 숫자 범위
- `.count(3)` — 배열 요소 개수
- `description:` — 생성을 위한 의미론적 가이드

## 핵심 패턴 — 도구 호출

도메인별 작업을 위해 모델이 커스텀 코드를 호출하도록:

### 1. 도구 정의

```swift
struct RecipeSearchTool: Tool {
    let name = "recipe_search"
    let description = "주어진 검색어와 일치하는 레시피를 검색하고 결과 목록을 반환합니다."

    @Generable
    struct Arguments {
        var searchTerm: String
        var numberOfResults: Int
    }

    func call(arguments: Arguments) async throws -> ToolOutput {
        let recipes = await searchRecipes(
            term: arguments.searchTerm,
            limit: arguments.numberOfResults
        )
        return .string(recipes.map { "- \($0.name): \($0.description)" }.joined(separator: "\n"))
    }
}
```

### 2. 도구와 함께 세션 생성

```swift
let session = LanguageModelSession(tools: [RecipeSearchTool()])
let response = try await session.respond(to: "파스타 레시피를 찾아주세요")
```

### 3. 도구 오류 처리

```swift
do {
    let answer = try await session.respond(to: "토마토 수프 레시피를 찾아주세요.")
} catch let error as LanguageModelSession.ToolCallError {
    print(error.tool.name)
    if case .databaseIsEmpty = error.underlyingError as? RecipeSearchToolError {
        // 특정 도구 오류 처리
    }
}
```

## 핵심 패턴 — 스냅샷 스트리밍

`PartiallyGenerated` 타입을 사용하여 실시간 UI를 위한 구조화된 응답 스트리밍:

```swift
@Generable
struct TripIdeas {
    @Guide(description: "다가오는 여행 아이디어")
    var ideas: [String]
}

let stream = session.streamResponse(
    to: "흥미로운 여행 아이디어는 무엇인가요?",
    generating: TripIdeas.self
)

for try await partial in stream {
    // partial: TripIdeas.PartiallyGenerated (모든 프로퍼티가 Optional)
    print(partial)
}
```

### SwiftUI 통합

```swift
@State private var partialResult: TripIdeas.PartiallyGenerated?
@State private var errorMessage: String?

var body: some View {
    List {
        ForEach(partialResult?.ideas ?? [], id: \.self) { idea in
            Text(idea)
        }
    }
    .overlay {
        if let errorMessage { Text(errorMessage).foregroundStyle(.red) }
    }
    .task {
        do {
            let stream = session.streamResponse(to: prompt, generating: TripIdeas.self)
            for try await partial in stream {
                partialResult = partial
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
```

## 주요 설계 결정

| 결정 | 근거 |
|------|------|
| 온디바이스 실행 | 프라이버시 — 데이터가 디바이스 밖으로 나가지 않음; 오프라인 작동 |
| 4,096 토큰 제한 | 온디바이스 모델 제약; 여러 세션에 걸쳐 대용량 데이터 청크 분할 |
| 스냅샷 스트리밍 (델타 아님) | 구조화된 출력 친화적; 각 스냅샷은 완전한 부분 상태 |
| `@Generable` 매크로 | 구조화된 생성의 컴파일 타임 안전성; `PartiallyGenerated` 타입 자동 생성 |
| 세션당 단일 요청 | `isResponding`이 동시 요청 방지; 필요한 경우 여러 세션 생성 |
| `response.content` (`.output` 아님) | 올바른 API — 항상 `.content` 프로퍼티로 결과 접근 |

## 모범 사례

- **항상 `model.availability` 확인** — 세션 생성 전 모든 비가용 케이스 처리
- **`instructions` 사용** — 모델 동작 안내 — 프롬프트보다 우선순위 높음
- **새 요청 전 `isResponding` 확인** — 세션은 한 번에 하나의 요청만 처리
- **결과 접근에 `response.content` 사용** — `.output` 아님
- **대용량 입력을 청크로 분할** — 4,096 토큰 제한은 instructions + 프롬프트 + 출력 합산
- **구조화된 출력에 `@Generable` 사용** — 원시 문자열 파싱보다 강한 보장
- **`GenerationOptions(temperature:)` 사용** — 창의성 조정 (높을수록 더 창의적)
- **Instruments로 모니터링** — Xcode Instruments를 사용하여 요청 성능 프로파일링

## 피해야 할 안티패턴

- `model.availability` 확인 없이 세션 생성
- 4,096 토큰 컨텍스트 창을 초과하는 입력 전송
- 단일 세션에서 동시 요청 시도
- 응답 데이터 접근에 `.content` 대신 `.output` 사용
- `@Generable` 구조화된 출력이 작동할 때 원시 문자열 응답 파싱
- 단일 프롬프트에 복잡한 다단계 로직 구축 — 여러 집중된 프롬프트로 분리
- 모델이 항상 사용 가능하다고 가정 — 디바이스 적합성 및 설정이 다를 수 있음

## 사용 시기

- 개인정보 보호가 중요한 앱을 위한 온디바이스 텍스트 생성
- 사용자 입력에서 구조화된 데이터 추출 (양식, 자연어 명령)
- 오프라인에서 작동해야 하는 AI 보조 기능
- 생성된 콘텐츠를 점진적으로 보여주는 스트리밍 UI
- 도구 호출을 통한 도메인별 AI 액션 (검색, 계산, 조회)
