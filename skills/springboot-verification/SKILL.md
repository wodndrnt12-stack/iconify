---
name: springboot-verification
description: "Spring Boot 프로젝트를 위한 검증 루프: 빌드, 정적 분석, 커버리지 포함 테스트, 보안 스캔, 릴리스 또는 PR 전 diff 리뷰."
origin: ECC
---

# Spring Boot 검증 루프

PR 전, 주요 변경 후, 배포 전에 실행합니다.

## 활성화 시점

- Spring Boot 서비스에 대한 풀 리퀘스트 열기 전
- 주요 리팩토링 또는 의존성 업그레이드 후
- 스테이징 또는 프로덕션 배포 전 검증
- 전체 빌드 → 린트 → 테스트 → 보안 스캔 파이프라인 실행
- 테스트 커버리지가 임계값을 충족하는지 검증

## Phase 1: 빌드

```bash
mvn -T 4 clean verify -DskipTests
# 또는
./gradlew clean assemble -x test
```

빌드가 실패하면 중지하고 수정합니다.

## Phase 2: 정적 분석

Maven (일반 플러그인):
```bash
mvn -T 4 spotbugs:check pmd:check checkstyle:check
```

Gradle (구성된 경우):
```bash
./gradlew checkstyleMain pmdMain spotbugsMain
```

## Phase 3: 테스트 + 커버리지

```bash
mvn -T 4 test
mvn jacoco:report   # verify 80%+ coverage
# 또는
./gradlew test jacocoTestReport
```

보고서:
- 총 테스트 수, 통과/실패
- 커버리지 % (라인/브랜치)

### 단위 테스트

모의 의존성으로 서비스 로직을 격리하여 테스트:

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  @Mock private UserRepository userRepository;
  @InjectMocks private UserService userService;

  @Test
  void createUser_validInput_returnsUser() {
    var dto = new CreateUserDto("Alice", "alice@example.com");
    var expected = new User(1L, "Alice", "alice@example.com");
    when(userRepository.save(any(User.class))).thenReturn(expected);

    var result = userService.create(dto);

    assertThat(result.name()).isEqualTo("Alice");
    verify(userRepository).save(any(User.class));
  }

  @Test
  void createUser_duplicateEmail_throwsException() {
    var dto = new CreateUserDto("Alice", "existing@example.com");
    when(userRepository.existsByEmail(dto.email())).thenReturn(true);

    assertThatThrownBy(() -> userService.create(dto))
        .isInstanceOf(DuplicateEmailException.class);
  }
}
```

### Testcontainers를 사용한 통합 테스트

H2 대신 실제 데이터베이스로 테스트:

```java
@SpringBootTest
@Testcontainers
class UserRepositoryIntegrationTest {

  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
      .withDatabaseName("testdb");

  @DynamicPropertySource
  static void configureProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
  }

  @Autowired private UserRepository userRepository;

  @Test
  void findByEmail_existingUser_returnsUser() {
    userRepository.save(new User("Alice", "alice@example.com"));

    var found = userRepository.findByEmail("alice@example.com");

    assertThat(found).isPresent();
    assertThat(found.get().getName()).isEqualTo("Alice");
  }
}
```

### MockMvc를 사용한 API 테스트

전체 Spring 컨텍스트로 컨트롤러 계층 테스트:

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

  @Autowired private MockMvc mockMvc;
  @MockBean private UserService userService;

  @Test
  void createUser_validInput_returns201() throws Exception {
    var user = new UserDto(1L, "Alice", "alice@example.com");
    when(userService.create(any())).thenReturn(user);

    mockMvc.perform(post("/api/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"name": "Alice", "email": "alice@example.com"}
                """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.name").value("Alice"));
  }

  @Test
  void createUser_invalidEmail_returns400() throws Exception {
    mockMvc.perform(post("/api/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"name": "Alice", "email": "not-an-email"}
                """))
        .andExpect(status().isBadRequest());
  }
}
```

## Phase 4: 보안 스캔

```bash
# Dependency CVEs
mvn org.owasp:dependency-check-maven:check
# 또는
./gradlew dependencyCheckAnalyze

# Secrets in source
grep -rn "password\s*=\s*\"" src/ --include="*.java" --include="*.yml" --include="*.properties"
grep -rn "sk-\|api_key\|secret" src/ --include="*.java" --include="*.yml"

# Secrets (git history)
git secrets --scan  # if configured
```

### 일반적인 보안 발견 사항

```
# Check for System.out.println (use logger instead)
grep -rn "System\.out\.print" src/main/ --include="*.java"

# Check for raw exception messages in responses
grep -rn "e\.getMessage()" src/main/ --include="*.java"

# Check for wildcard CORS
grep -rn "allowedOrigins.*\*" src/main/ --include="*.java"
```

## Phase 5: 린트/포맷 (선택적 게이트)

```bash
mvn spotless:apply   # if using Spotless plugin
./gradlew spotlessApply
```

## Phase 6: Diff 리뷰

```bash
git diff --stat
git diff
```

체크리스트:
- 남은 디버그 로그 없음 (`System.out`, 가드 없는 `log.debug`)
- 의미 있는 오류 및 HTTP 상태
- 필요한 곳에 트랜잭션 및 유효성 검사 존재
- 구성 변경 사항 문서화됨

## 출력 템플릿

```
검증 보고서
===================
빌드:     [통과/실패]
정적 분석: [통과/실패] (spotbugs/pmd/checkstyle)
테스트:   [통과/실패] (X/Y 통과, Z% 커버리지)
보안:     [통과/실패] (CVE 발견: N건)
Diff:     [X개 파일 변경]

전체:     [준비됨 / 준비 안 됨]

수정할 이슈:
1. ...
2. ...
```

## 연속 모드

- 중요한 변경 후 또는 긴 세션에서 30~60분마다 단계 재실행
- 빠른 피드백을 위한 짧은 루프 유지: `mvn -T 4 test` + spotbugs

**기억하세요**: 빠른 피드백이 늦은 놀라움보다 낫습니다. 게이트를 엄격하게 유지하세요 — 프로덕션 시스템에서는 경고를 결함으로 취급하세요.
