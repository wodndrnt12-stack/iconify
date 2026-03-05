---
name: java-coding-standards
description: "Spring Boot 서비스를 위한 Java 코딩 표준: 명명, 불변성, Optional 사용, 스트림, 예외, 제네릭, 프로젝트 레이아웃."
origin: ECC
---

# Java 코딩 표준

Spring Boot 서비스에서 가독성 있고 유지보수 가능한 Java (17+) 코드를 위한 표준.

## 활성화 시점

- Spring Boot 프로젝트에서 Java 코드를 작성하거나 리뷰할 때
- 명명, 불변성, 예외 처리 관례를 적용할 때
- 레코드, 봉인 클래스, 패턴 매칭 (Java 17+) 작업 시
- Optional, 스트림, 제네릭 사용 리뷰 시
- 패키지 및 프로젝트 레이아웃 구성 시

## 핵심 원칙

- 영리함보다 명확성을 우선
- 기본적으로 불변; 공유 가변 상태 최소화
- 의미 있는 예외로 빠르게 실패
- 일관된 명명 및 패키지 구조

## 명명

```java
// ✅ 클래스/레코드: PascalCase
public class MarketService {}
public record Money(BigDecimal amount, Currency currency) {}

// ✅ 메서드/필드: camelCase
private final MarketRepository marketRepository;
public Market findBySlug(String slug) {}

// ✅ 상수: UPPER_SNAKE_CASE
private static final int MAX_PAGE_SIZE = 100;
```

## 불변성

```java
// ✅ 레코드와 final 필드를 선호
public record MarketDto(Long id, String name, MarketStatus status) {}

public class Market {
  private final Long id;
  private final String name;
  // getter만, setter 없음
}
```

## Optional 사용

```java
// ✅ find* 메서드에서 Optional 반환
Optional<Market> market = marketRepository.findBySlug(slug);

// ✅ get() 대신 Map/flatMap 사용
return market
    .map(MarketResponse::from)
    .orElseThrow(() -> new EntityNotFoundException("Market not found"));
```

## 스트림 모범 사례

```java
// ✅ 변환에 스트림 사용, 파이프라인을 짧게 유지
List<String> names = markets.stream()
    .map(Market::name)
    .filter(Objects::nonNull)
    .toList();

// ❌ 복잡한 중첩 스트림은 피함; 명확성을 위해 루프를 선호
```

## 예외

- 도메인 오류에는 비검사 예외 사용; 기술적 예외는 컨텍스트와 함께 래핑
- 도메인별 예외 생성 (예: `MarketNotFoundException`)
- 중앙에서 재던지기/로깅하지 않는 한 광범위한 `catch (Exception ex)` 지양

```java
throw new MarketNotFoundException(slug);
```

## 제네릭과 타입 안전성

- 원시 타입 지양; 제네릭 파라미터 선언
- 재사용 가능한 유틸리티에는 경계 제네릭 선호

```java
public <T extends Identifiable> Map<Long, T> indexById(Collection<T> items) { ... }
```

## 프로젝트 구조 (Maven/Gradle)

```
src/main/java/com/example/app/
  config/
  controller/
  service/
  repository/
  domain/
  dto/
  util/
src/main/resources/
  application.yml
src/test/java/... (main 반영)
```

## 포맷팅과 스타일

- 2 또는 4 스페이스 일관되게 사용 (프로젝트 표준)
- 파일당 하나의 public 최상위 타입
- 메서드를 짧고 집중적으로 유지; 도우미 메서드 추출
- 멤버 순서: 상수, 필드, 생성자, public 메서드, protected, private

## 피해야 할 코드 스멜

- 긴 파라미터 목록 → DTO/빌더 사용
- 깊은 중첩 → 조기 반환
- 매직 넘버 → 명명된 상수
- 정적 가변 상태 → 의존성 주입 선호
- 빈 catch 블록 → 로깅 후 처리 또는 재던지기

## 로깅

```java
private static final Logger log = LoggerFactory.getLogger(MarketService.class);
log.info("fetch_market slug={}", slug);
log.error("failed_fetch_market slug={}", slug, ex);
```

## Null 처리

- 불가피한 경우에만 `@Nullable` 허용; 그렇지 않으면 `@NonNull` 사용
- 입력에 Bean Validation (`@NotNull`, `@NotBlank`) 사용

## 테스트 기대치

- JUnit 5 + AssertJ로 유창한 어서션
- Mockito로 목킹; 가능한 경우 부분 목킹 지양
- 결정론적 테스트; 숨겨진 sleep 없음

**기억**: 코드를 의도적이고, 타입이 지정되고, 관찰 가능하게 유지합니다. 필요한 경우가 아니면 마이크로 최적화보다 유지보수성을 위해 최적화합니다.
