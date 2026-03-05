---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript 코딩 스타일

> 이 파일은 [common/coding-style.md](../common/coding-style.md)를 TypeScript/JavaScript 특화 내용으로 확장한다.

## 불변성

불변 업데이트를 위해 스프레드 연산자 사용:

```typescript
// 잘못된 예: 변경
function updateUser(user, name) {
  user.name = name  // 변경!
  return user
}

// 올바른 예: 불변성
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## 오류 처리

try-catch와 함께 async/await 사용:

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('Detailed user-friendly message')
}
```

## 입력 유효성 검사

스키마 기반 유효성 검사를 위해 Zod 사용:

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## Console.log

- 프로덕션 코드에 `console.log` 구문 사용 금지
- 대신 적절한 로깅 라이브러리 사용
- 자동 감지는 훅 참조
