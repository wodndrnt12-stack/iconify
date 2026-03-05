---
name: swiftui-patterns
description: SwiftUI 아키텍처 패턴, @Observable을 사용한 상태 관리, 뷰 구성, 내비게이션, 성능 최적화, 현대적인 iOS/macOS UI 모범 사례.
---

# SwiftUI 패턴

Apple 플랫폼에서 선언적이고 성능 좋은 사용자 인터페이스를 구축하기 위한 현대적인 SwiftUI 패턴. Observation 프레임워크, 뷰 구성, 타입 안전 내비게이션, 성능 최적화를 다룹니다.

## 활성화 시점

- SwiftUI 뷰 구축 및 상태 관리 시 (`@State`, `@Observable`, `@Binding`)
- `NavigationStack`으로 내비게이션 흐름 설계 시
- 뷰 모델 및 데이터 흐름 구조화 시
- 목록 및 복잡한 레이아웃의 렌더링 성능 최적화 시
- SwiftUI에서 환경 값 및 의존성 주입 사용 시

## 상태 관리

### 프로퍼티 래퍼 선택

가장 단순한 래퍼를 선택:

| 래퍼 | 사용 사례 |
|---------|----------|
| `@State` | 뷰 로컬 값 타입 (토글, 폼 필드, 시트 표시) |
| `@Binding` | 부모의 `@State`에 대한 양방향 참조 |
| `@Observable` 클래스 + `@State` | 여러 프로퍼티를 가진 소유된 모델 |
| `@Observable` 클래스 (래퍼 없음) | 부모에서 전달된 읽기 전용 참조 |
| `@Bindable` | `@Observable` 프로퍼티에 대한 양방향 바인딩 |
| `@Environment` | `.environment()`를 통해 주입된 공유 의존성 |

### @Observable ViewModel

`ObservableObject` 대신 `@Observable` 사용 — 프로퍼티 수준 변경을 추적하므로 SwiftUI는 변경된 프로퍼티를 읽는 뷰만 재렌더링합니다:

```swift
@Observable
final class ItemListViewModel {
    private(set) var items: [Item] = []
    private(set) var isLoading = false
    var searchText = ""

    private let repository: any ItemRepository

    init(repository: any ItemRepository = DefaultItemRepository()) {
        self.repository = repository
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        items = (try? await repository.fetchAll()) ?? []
    }
}
```

### ViewModel을 사용하는 뷰

```swift
struct ItemListView: View {
    @State private var viewModel: ItemListViewModel

    init(viewModel: ItemListViewModel = ItemListViewModel()) {
        _viewModel = State(initialValue: viewModel)
    }

    var body: some View {
        List(viewModel.items) { item in
            ItemRow(item: item)
        }
        .searchable(text: $viewModel.searchText)
        .overlay { if viewModel.isLoading { ProgressView() } }
        .task { await viewModel.load() }
    }
}
```

### 환경 주입

`@EnvironmentObject` 대신 `@Environment` 사용:

```swift
// 주입
ContentView()
    .environment(authManager)

// 사용
struct ProfileView: View {
    @Environment(AuthManager.self) private var auth

    var body: some View {
        Text(auth.currentUser?.name ?? "게스트")
    }
}
```

## 뷰 구성

### 무효화를 제한하기 위해 하위 뷰 추출

뷰를 작고 집중된 구조체로 분리합니다. 상태가 변경되면 해당 상태를 읽는 하위 뷰만 재렌더링됩니다:

```swift
struct OrderView: View {
    @State private var viewModel = OrderViewModel()

    var body: some View {
        VStack {
            OrderHeader(title: viewModel.title)
            OrderItemList(items: viewModel.items)
            OrderTotal(total: viewModel.total)
        }
    }
}
```

### 재사용 가능한 스타일링을 위한 ViewModifier

```swift
struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(.regularMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardModifier())
    }
}
```

## 내비게이션

### 타입 안전 NavigationStack

프로그래밍 방식의 타입 안전 라우팅을 위해 `NavigationPath`와 함께 `NavigationStack` 사용:

```swift
@Observable
final class Router {
    var path = NavigationPath()

    func navigate(to destination: Destination) {
        path.append(destination)
    }

    func popToRoot() {
        path = NavigationPath()
    }
}

enum Destination: Hashable {
    case detail(Item.ID)
    case settings
    case profile(User.ID)
}

struct RootView: View {
    @State private var router = Router()

    var body: some View {
        NavigationStack(path: $router.path) {
            HomeView()
                .navigationDestination(for: Destination.self) { dest in
                    switch dest {
                    case .detail(let id): ItemDetailView(itemID: id)
                    case .settings: SettingsView()
                    case .profile(let id): ProfileView(userID: id)
                    }
                }
        }
        .environment(router)
    }
}
```

## 성능

### 대용량 컬렉션에 지연 컨테이너 사용

`LazyVStack`과 `LazyHStack`은 보일 때만 뷰를 생성합니다:

```swift
ScrollView {
    LazyVStack(spacing: 8) {
        ForEach(items) { item in
            ItemRow(item: item)
        }
    }
}
```

### 안정적인 식별자

`ForEach`에서 항상 안정적이고 고유한 ID 사용 — 배열 인덱스 사용 피하기:

```swift
// Identifiable 준수 또는 명시적 id 사용
ForEach(items, id: \.stableID) { item in
    ItemRow(item: item)
}
```

### body에서 비용이 많이 드는 작업 피하기

- `body` 안에서 I/O, 네트워크 호출, 무거운 계산 절대 수행 금지
- 비동기 작업에는 `.task {}` 사용 — 뷰가 사라질 때 자동으로 취소됨
- 스크롤 뷰에서 `.sensoryFeedback()`과 `.geometryGroup()`을 신중하게 사용
- 목록에서 `.shadow()`, `.blur()`, `.mask()`를 최소화 — 오프스크린 렌더링을 트리거함

### Equatable 준수

비용이 많이 드는 body를 가진 뷰의 경우 `Equatable`을 준수하여 불필요한 재렌더링을 건너뜁니다:

```swift
struct ExpensiveChartView: View, Equatable {
    let dataPoints: [DataPoint] // DataPoint는 Equatable을 준수해야 함

    static func == (lhs: Self, rhs: Self) -> Bool {
        lhs.dataPoints == rhs.dataPoints
    }

    var body: some View {
        // Complex chart rendering
    }
}
```

## 미리보기

빠른 반복을 위해 인라인 모의 데이터와 함께 `#Preview` 매크로 사용:

```swift
#Preview("빈 상태") {
    ItemListView(viewModel: ItemListViewModel(repository: EmptyMockRepository()))
}

#Preview("로드됨") {
    ItemListView(viewModel: ItemListViewModel(repository: PopulatedMockRepository()))
}
```

## 피해야 할 안티패턴

- 새 코드에서 `ObservableObject` / `@Published` / `@StateObject` / `@EnvironmentObject` 사용 — `@Observable`로 마이그레이션
- `body` 또는 `init`에 비동기 작업 직접 넣기 — `.task {}` 또는 명시적 로드 메서드 사용
- 데이터를 소유하지 않는 자식 뷰 내부에서 `@State`로 뷰 모델 생성 — 부모에서 전달
- `AnyView` 타입 지우기 사용 — 조건부 뷰에는 `@ViewBuilder` 또는 `Group` 선호
- 액터와 데이터를 주고받을 때 `Sendable` 요구사항 무시

## 참고 자료

액터 기반 영속화 패턴은 skill: `swift-actor-persistence`를 참조하세요.
Swift Testing과 함께하는 프로토콜 기반 DI 및 테스트는 skill: `swift-protocol-di-testing`을 참조하세요.
