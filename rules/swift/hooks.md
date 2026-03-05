---
paths:
  - "**/*.swift"
  - "**/Package.swift"
---
# Swift 훅

> 이 파일은 [common/hooks.md](../common/hooks.md)를 Swift 특화 내용으로 확장한다.

## PostToolUse 훅

`~/.claude/settings.json`에서 설정:

- **SwiftFormat**: 편집 후 `.swift` 파일 자동 포맷
- **SwiftLint**: `.swift` 파일 편집 후 린트 검사 실행
- **swift build**: 편집 후 수정된 패키지 타입 검사

## 경고

프로덕션 코드에서 `print()` 구문 감지 — 대신 `os.Logger` 또는 구조화된 로깅 사용.
