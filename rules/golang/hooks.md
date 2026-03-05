---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go 훅

> 이 파일은 [common/hooks.md](../common/hooks.md)를 Go 특화 내용으로 확장한다.

## PostToolUse 훅

`~/.claude/settings.json`에서 설정:

- **gofmt/goimports**: 편집 후 `.go` 파일 자동 포맷
- **go vet**: `.go` 파일 편집 후 정적 분석 실행
- **staticcheck**: 수정된 패키지에 대해 확장 정적 검사 실행
