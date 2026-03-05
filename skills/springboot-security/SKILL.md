---
name: springboot-security
description: Java Spring Boot 서비스의 인증/인가, 유효성 검사, CSRF, 시크릿, 헤더, 속도 제한, 의존성 보안을 위한 Spring Security 모범 사례.
origin: ECC
---

# Spring Boot 보안 리뷰

인증 추가, 입력 처리, 엔드포인트 생성, 시크릿 처리 시 사용합니다.

## 활성화 시점

- 인증 추가 시 (JWT, OAuth2, 세션 기반)
- 인가 구현 시 (@PreAuthorize, 역할 기반 접근)
- 사용자 입력 유효성 검사 시 (Bean Validation, 커스텀 유효성 검사기)
- CORS, CSRF, 또는 보안 헤더 구성 시
- 시크릿 관리 시 (Vault, 환경 변수)
- 속도 제한 또는 무차별 대입 공격 방어 추가 시
- CVE 의존성 스캔 시

## 인증

- 취소 목록이 있는 무상태 JWT 또는 불투명 토큰 선호
- 세션에는 `httpOnly`, `Secure`, `SameSite=Strict` 쿠키 사용
- `OncePerRequestFilter` 또는 리소스 서버로 토큰 유효성 검사

```java
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwtService;

  public JwtAuthFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain chain) throws ServletException, IOException {
    String header = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (header != null && header.startsWith("Bearer ")) {
      String token = header.substring(7);
      Authentication auth = jwtService.authenticate(token);
      SecurityContextHolder.getContext().setAuthentication(auth);
    }
    chain.doFilter(request, response);
  }
}
```

## 인가

- 메서드 보안 활성화: `@EnableMethodSecurity`
- `@PreAuthorize("hasRole('ADMIN')")` 또는 `@PreAuthorize("@authz.canEdit(#id)")` 사용
- 기본적으로 거부; 필요한 범위만 노출

```java
@RestController
@RequestMapping("/api/admin")
public class AdminController {

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/users")
  public List<UserDto> listUsers() {
    return userService.findAll();
  }

  @PreAuthorize("@authz.isOwner(#id, authentication)")
  @DeleteMapping("/users/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
```

## 입력 유효성 검사

- 컨트롤러에서 `@Valid`와 함께 Bean Validation 사용
- DTO에 제약 조건 적용: `@NotBlank`, `@Email`, `@Size`, 커스텀 유효성 검사기
- 렌더링 전에 허용 목록으로 HTML 정리

```java
// 나쁨: 유효성 검사 없음
@PostMapping("/users")
public User createUser(@RequestBody UserDto dto) {
  return userService.create(dto);
}

// 좋음: 유효성 검사된 DTO
public record CreateUserDto(
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Email String email,
    @NotNull @Min(0) @Max(150) Integer age
) {}

@PostMapping("/users")
public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserDto dto) {
  return ResponseEntity.status(HttpStatus.CREATED)
      .body(userService.create(dto));
}
```

## SQL 인젝션 방지

- Spring Data 리포지토리 또는 매개변수화된 쿼리 사용
- 네이티브 쿼리의 경우 `:param` 바인딩 사용; 절대 문자열 연결 금지

```java
// 나쁨: 네이티브 쿼리에서 문자열 연결
@Query(value = "SELECT * FROM users WHERE name = '" + name + "'", nativeQuery = true)

// 좋음: 매개변수화된 네이티브 쿼리
@Query(value = "SELECT * FROM users WHERE name = :name", nativeQuery = true)
List<User> findByName(@Param("name") String name);

// 좋음: Spring Data 파생 쿼리 (자동 매개변수화)
List<User> findByEmailAndActiveTrue(String email);
```

## 비밀번호 인코딩

- 항상 BCrypt 또는 Argon2로 비밀번호 해시 — 평문 저장 금지
- 수동 해싱이 아닌 `PasswordEncoder` 빈 사용

```java
@Bean
public PasswordEncoder passwordEncoder() {
  return new BCryptPasswordEncoder(12); // cost factor 12
}

// 서비스에서
public User register(CreateUserDto dto) {
  String hashedPassword = passwordEncoder.encode(dto.password());
  return userRepository.save(new User(dto.email(), hashedPassword));
}
```

## CSRF 보호

- 브라우저 세션 앱의 경우 CSRF 활성화 유지; 폼/헤더에 토큰 포함
- Bearer 토큰을 사용하는 순수 API의 경우 CSRF 비활성화하고 무상태 인증 사용

```java
http
  .csrf(csrf -> csrf.disable())
  .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
```

## 시크릿 관리

- 소스에 시크릿 없음; 환경 변수 또는 vault에서 로드
- `application.yml`에 자격증명 없이 플레이스홀더 사용
- 토큰 및 DB 자격증명 정기 교체

```yaml
# 나쁨: application.yml에 하드코딩
spring:
  datasource:
    password: mySecretPassword123

# 좋음: 환경 변수 플레이스홀더
spring:
  datasource:
    password: ${DB_PASSWORD}

# 좋음: Spring Cloud Vault 통합
spring:
  cloud:
    vault:
      uri: https://vault.example.com
      token: ${VAULT_TOKEN}
```

## 보안 헤더

```java
http
  .headers(headers -> headers
    .contentSecurityPolicy(csp -> csp
      .policyDirectives("default-src 'self'"))
    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
    .xssProtection(Customizer.withDefaults())
    .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER)));
```

## CORS 구성

- 컨트롤러별이 아닌 보안 필터 수준에서 CORS 구성
- 허용된 오리진 제한 — 프로덕션에서 `*` 절대 사용 금지

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
  CorsConfiguration config = new CorsConfiguration();
  config.setAllowedOrigins(List.of("https://app.example.com"));
  config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
  config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
  config.setAllowCredentials(true);
  config.setMaxAge(3600L);

  UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/api/**", config);
  return source;
}

// SecurityFilterChain에서:
http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
```

## 속도 제한

- 비용이 많이 드는 엔드포인트에 Bucket4j 또는 게이트웨이 수준 제한 적용
- 급증 시 로그 기록 및 알림 발송; 재시도 힌트와 함께 429 반환

```java
// Using Bucket4j for per-endpoint rate limiting
@Component
public class RateLimitFilter extends OncePerRequestFilter {
  private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

  private Bucket createBucket() {
    return Bucket.builder()
        .addLimit(Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1))))
        .build();
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
      FilterChain chain) throws ServletException, IOException {
    String clientIp = request.getRemoteAddr();
    Bucket bucket = buckets.computeIfAbsent(clientIp, k -> createBucket());

    if (bucket.tryConsume(1)) {
      chain.doFilter(request, response);
    } else {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      response.getWriter().write("{\"error\": \"Rate limit exceeded\"}");
    }
  }
}
```

## 의존성 보안

- CI에서 OWASP Dependency Check / Snyk 실행
- Spring Boot 및 Spring Security를 지원되는 버전으로 유지
- 알려진 CVE에 대해 빌드 실패

## 로깅 및 PII

- 시크릿, 토큰, 비밀번호, 전체 PAN 데이터 로그 기록 금지
- 민감한 필드 편집; 구조화된 JSON 로깅 사용

## 파일 업로드

- 크기, 콘텐츠 유형, 확장자 유효성 검사
- 웹 루트 외부에 저장; 필요한 경우 스캔

## 출시 전 체크리스트

- [ ] 인증 토큰이 올바르게 유효성 검사되고 만료됨
- [ ] 모든 민감한 경로에 인가 가드 적용
- [ ] 모든 입력이 유효성 검사 및 정리됨
- [ ] 문자열 연결 SQL 없음
- [ ] 앱 유형에 맞는 CSRF 자세
- [ ] 시크릿 외부화됨; 커밋되지 않음
- [ ] 보안 헤더 구성됨
- [ ] API에 속도 제한 적용
- [ ] 의존성 스캔 및 최신 상태
- [ ] 로그에 민감한 데이터 없음

**기억하세요**: 기본적으로 거부, 입력 유효성 검사, 최소 권한, 구성 우선 보안.
