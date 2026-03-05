---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript 훅

> 이 파일은 [common/hooks.md](../common/hooks.md)를 TypeScript/JavaScript 특화 내용으로 확장한다.

## PostToolUse 훅

`~/.claude/settings.json`에서 설정:

- **Prettier**: 편집 후 JS/TS 파일 자동 포맷
- **TypeScript 검사**: `.ts`/`.tsx` 파일 편집 후 `tsc` 실행
- **console.log 경고**: 편집된 파일의 `console.log`에 대해 경고

## Stop 훅

- **console.log 감사**: 세션 종료 전 수정된 모든 파일의 `console.log` 확인
