---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript 보안

> 이 파일은 [common/security.md](../common/security.md)를 TypeScript/JavaScript 특화 내용으로 확장한다.

## 시크릿 관리

```typescript
// 절대 금지: 하드코딩된 시크릿
const apiKey = "sk-proj-xxxxx"

// 항상 사용: 환경 변수
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## 에이전트 지원

- 포괄적인 보안 감사를 위해 **security-reviewer** 스킬 사용
