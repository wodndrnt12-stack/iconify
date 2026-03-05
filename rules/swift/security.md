---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift 보안

> 이 파일은 [common/security.md](../common/security.md)를 Swift 특화 내용으로 확장한다.

## 시크릿 관리

- 민감한 데이터(토큰, 비밀번호, 키)에는 **Keychain Services** 사용 — `UserDefaults` 절대 사용 금지
- 빌드 타임 시크릿에는 환경 변수 또는 `.xcconfig` 파일 사용
- 소스에 시크릿 하드코딩 금지 — 디컴파일 도구로 쉽게 추출됨

```swift
let apiKey = ProcessInfo.processInfo.environment["API_KEY"]
guard let apiKey, !apiKey.isEmpty else {
    fatalError("API_KEY not configured")
}
```

## 전송 보안

- App Transport Security (ATS)는 기본적으로 강제됨 — 비활성화 금지
- 중요 엔드포인트에 인증서 피닝 사용
- 모든 서버 인증서 유효성 검사

## 입력 유효성 검사

- 인젝션 방지를 위해 표시 전 모든 사용자 입력 살균 처리
- 강제 언래핑 대신 유효성 검사와 함께 `URL(string:)` 사용
- 처리 전 외부 소스의 데이터 유효성 검사 (API, 딥 링크, 페이스트보드)
