---
name: jpa-patterns
description: Spring Boot에서 엔티티 설계, 관계, 쿼리 최적화, 트랜잭션, 감사, 인덱싱, 페이지네이션, 풀링을 위한 JPA/Hibernate 패턴.
origin: ECC
---

# JPA/Hibernate 패턴

Spring Boot에서 데이터 모델링, 리포지토리, 성능 튜닝에 사용합니다.

## 활성화 시점

- JPA 엔티티 및 테이블 매핑 설계 시
- 관계 정의 시 (@OneToMany, @ManyToOne, @ManyToMany)
- 쿼리 최적화 시 (N+1 방지, 페치 전략, 프로젝션)
- 트랜잭션, 감사, 소프트 삭제 구성 시
- 페이지네이션, 정렬, 커스텀 리포지토리 메서드 설정 시
- 커넥션 풀링 (HikariCP) 또는 2차 캐싱 튜닝 시

## 엔티티 설계

```java
@Entity
@Table(name = "markets", indexes = {
  @Index(name = "idx_markets_slug", columnList = "slug", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
public class MarketEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(nullable = false, unique = true, length = 120)
  private String slug;

  @Enumerated(EnumType.STRING)
  private MarketStatus status = MarketStatus.ACTIVE;

  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
}
```

감사 활성화:
```java
@Configuration
@EnableJpaAuditing
class JpaConfig {}
```

## 관계와 N+1 방지

```java
@OneToMany(mappedBy = "market", cascade = CascadeType.ALL, orphanRemoval = true)
private List<PositionEntity> positions = new ArrayList<>();
```

- 기본적으로 지연 로딩 사용; 필요 시 쿼리에서 `JOIN FETCH` 사용
- 컬렉션에 `EAGER` 지양; 읽기 경로에 DTO 프로젝션 사용

```java
@Query("select m from MarketEntity m left join fetch m.positions where m.id = :id")
Optional<MarketEntity> findWithPositions(@Param("id") Long id);
```

## 리포지토리 패턴

```java
public interface MarketRepository extends JpaRepository<MarketEntity, Long> {
  Optional<MarketEntity> findBySlug(String slug);

  @Query("select m from MarketEntity m where m.status = :status")
  Page<MarketEntity> findByStatus(@Param("status") MarketStatus status, Pageable pageable);
}
```

- 경량 쿼리에 프로젝션 사용:
```java
public interface MarketSummary {
  Long getId();
  String getName();
  MarketStatus getStatus();
}
Page<MarketSummary> findAllBy(Pageable pageable);
```

## 트랜잭션

- 서비스 메서드에 `@Transactional` 어노테이션 적용
- 읽기 경로 최적화를 위해 `@Transactional(readOnly = true)` 사용
- 전파를 신중하게 선택; 오래 실행되는 트랜잭션 지양

```java
@Transactional
public Market updateStatus(Long id, MarketStatus status) {
  MarketEntity entity = repo.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Market"));
  entity.setStatus(status);
  return Market.from(entity);
}
```

## 페이지네이션

```java
PageRequest page = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
Page<MarketEntity> markets = repo.findByStatus(MarketStatus.ACTIVE, page);
```

커서 유사 페이지네이션의 경우, 순서와 함께 JPQL에 `id > :lastId` 포함.

## 인덱싱과 성능

- 일반적인 필터에 인덱스 추가 (`status`, `slug`, 외래 키)
- 쿼리 패턴과 일치하는 복합 인덱스 사용 (`status, created_at`)
- `select *` 지양; 필요한 컬럼만 프로젝션
- `saveAll`과 `hibernate.jdbc.batch_size`로 일괄 쓰기

## 커넥션 풀링 (HikariCP)

권장 속성:
```
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.validation-timeout=5000
```

PostgreSQL LOB 처리의 경우 추가:
```
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
```

## 캐싱

- 1차 캐시는 EntityManager당; 트랜잭션 간 엔티티 유지 지양
- 읽기 빈번한 엔티티의 경우 2차 캐시를 신중하게 고려; 제거 전략 검증

## 마이그레이션

- Flyway 또는 Liquibase 사용; 프로덕션에서 Hibernate auto DDL 절대 의존 금지
- 마이그레이션을 멱등적이고 추가적으로 유지; 계획 없이 컬럼 삭제 지양

## 데이터 접근 테스트

- 프로덕션과 동일하게 Testcontainers와 함께 `@DataJpaTest` 선호
- 로그로 SQL 효율성 확인: `logging.level.org.hibernate.SQL=DEBUG` 및 파라미터 값을 위해 `logging.level.org.hibernate.orm.jdbc.bind=TRACE` 설정

**기억**: 엔티티를 간결하게, 쿼리를 의도적으로, 트랜잭션을 짧게 유지합니다. 페치 전략과 프로젝션으로 N+1을 방지하고, 읽기/쓰기 경로에 맞게 인덱스를 설정합니다.
