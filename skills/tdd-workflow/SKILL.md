---
name: tdd-workflow
description: 새 기능 작성, 버그 수정, 코드 리팩토링 시 이 skill을 사용합니다. 단위, 통합, E2E 테스트를 포함한 80%+ 커버리지로 테스트 주도 개발을 적용합니다.
origin: ECC
---

# 테스트 주도 개발 워크플로우

이 skill은 모든 코드 개발이 포괄적인 테스트 커버리지를 갖춘 TDD 원칙을 따르도록 보장합니다.

## 활성화 시점

- 새 기능 또는 기능 작성 시
- 버그 또는 이슈 수정 시
- 기존 코드 리팩토링 시
- API 엔드포인트 추가 시
- 새 컴포넌트 생성 시

## 핵심 원칙

### 1. 코드보다 테스트 먼저
항상 테스트를 먼저 작성하고, 그 다음 테스트를 통과하기 위한 코드를 구현합니다.

### 2. 커버리지 요구사항
- 최소 80% 커버리지 (단위 + 통합 + E2E)
- 모든 엣지 케이스 포함
- 오류 시나리오 테스트됨
- 경계 조건 검증됨

### 3. 테스트 유형

#### 단위 테스트
- 개별 함수 및 유틸리티
- 컴포넌트 로직
- 순수 함수
- 헬퍼 및 유틸리티

#### 통합 테스트
- API 엔드포인트
- 데이터베이스 작업
- 서비스 상호 작용
- 외부 API 호출

#### E2E 테스트 (Playwright)
- 중요한 사용자 흐름
- 완전한 워크플로우
- 브라우저 자동화
- UI 상호 작용

## TDD 워크플로우 단계

### 1단계: 사용자 여정 작성
```
[역할]로서, [혜택]을 위해 [행동]하고 싶습니다.

예시:
사용자로서, 정확한 키워드 없이도 관련 마켓을 찾을 수 있도록
시맨틱하게 마켓을 검색하고 싶습니다.
```

### 2단계: 테스트 케이스 생성
각 사용자 여정에 대해 포괄적인 테스트 케이스 생성:

```typescript
describe('Semantic Search', () => {
  it('returns relevant markets for query', async () => {
    // Test implementation
  })

  it('handles empty query gracefully', async () => {
    // Test edge case
  })

  it('falls back to substring search when Redis unavailable', async () => {
    // Test fallback behavior
  })

  it('sorts results by similarity score', async () => {
    // Test sorting logic
  })
})
```

### 3단계: 테스트 실행 (실패해야 함)
```bash
npm test
# Tests should fail - we haven't implemented yet
```

### 4단계: 코드 구현
테스트를 통과하기 위한 최소한의 코드 작성:

```typescript
// Implementation guided by tests
export async function searchMarkets(query: string) {
  // Implementation here
}
```

### 5단계: 테스트 다시 실행
```bash
npm test
# Tests should now pass
```

### 6단계: 리팩토링
테스트를 통과된 상태로 유지하면서 코드 품질 개선:
- 중복 제거
- 명명 개선
- 성능 최적화
- 가독성 향상

### 7단계: 커버리지 확인
```bash
npm run test:coverage
# Verify 80%+ coverage achieved
```

## 테스트 패턴

### 단위 테스트 패턴 (Jest/Vitest)
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### API 통합 테스트 패턴
```typescript
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/markets', () => {
  it('returns markets successfully', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('validates query parameters', async () => {
    const request = new NextRequest('http://localhost/api/markets?limit=invalid')
    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it('handles database errors gracefully', async () => {
    // Mock database failure
    const request = new NextRequest('http://localhost/api/markets')
    // Test error handling
  })
})
```

### E2E 테스트 패턴 (Playwright)
```typescript
import { test, expect } from '@playwright/test'

test('user can search and filter markets', async ({ page }) => {
  // Navigate to markets page
  await page.goto('/')
  await page.click('a[href="/markets"]')

  // Verify page loaded
  await expect(page.locator('h1')).toContainText('Markets')

  // Search for markets
  await page.fill('input[placeholder="Search markets"]', 'election')

  // Wait for debounce and results
  await page.waitForTimeout(600)

  // Verify search results displayed
  const results = page.locator('[data-testid="market-card"]')
  await expect(results).toHaveCount(5, { timeout: 5000 })

  // Verify results contain search term
  const firstResult = results.first()
  await expect(firstResult).toContainText('election', { ignoreCase: true })

  // Filter by status
  await page.click('button:has-text("Active")')

  // Verify filtered results
  await expect(results).toHaveCount(3)
})

test('user can create a new market', async ({ page }) => {
  // Login first
  await page.goto('/creator-dashboard')

  // Fill market creation form
  await page.fill('input[name="name"]', 'Test Market')
  await page.fill('textarea[name="description"]', 'Test description')
  await page.fill('input[name="endDate"]', '2025-12-31')

  // Submit form
  await page.click('button[type="submit"]')

  // Verify success message
  await expect(page.locator('text=Market created successfully')).toBeVisible()

  // Verify redirect to market page
  await expect(page).toHaveURL(/\/markets\/test-market/)
})
```

## 테스트 파일 구조

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # 단위 테스트
│   │   └── Button.stories.tsx       # Storybook
│   └── MarketCard/
│       ├── MarketCard.tsx
│       └── MarketCard.test.tsx
├── app/
│   └── api/
│       └── markets/
│           ├── route.ts
│           └── route.test.ts         # 통합 테스트
└── e2e/
    ├── markets.spec.ts               # E2E 테스트
    ├── trading.spec.ts
    └── auth.spec.ts
```

## 외부 서비스 모의화

### Supabase 모의
```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [{ id: 1, name: 'Test Market' }],
          error: null
        }))
      }))
    }))
  }
}))
```

### Redis 모의
```typescript
jest.mock('@/lib/redis', () => ({
  searchMarketsByVector: jest.fn(() => Promise.resolve([
    { slug: 'test-market', similarity_score: 0.95 }
  ])),
  checkRedisHealth: jest.fn(() => Promise.resolve({ connected: true }))
}))
```

### OpenAI 모의
```typescript
jest.mock('@/lib/openai', () => ({
  generateEmbedding: jest.fn(() => Promise.resolve(
    new Array(1536).fill(0.1) // Mock 1536-dim embedding
  ))
}))
```

## 테스트 커버리지 확인

### 커버리지 보고서 실행
```bash
npm run test:coverage
```

### 커버리지 임계값
```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 피해야 할 일반적인 테스트 실수

### ❌ 잘못됨: 구현 세부사항 테스트
```typescript
// 내부 상태를 테스트하지 말 것
expect(component.state.count).toBe(5)
```

### ✅ 올바름: 사용자가 볼 수 있는 동작 테스트
```typescript
// 사용자가 보는 것을 테스트
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### ❌ 잘못됨: 깨지기 쉬운 선택자
```typescript
// 쉽게 깨짐
await page.click('.css-class-xyz')
```

### ✅ 올바름: 시맨틱 선택자
```typescript
// 변경에 강함
await page.click('button:has-text("Submit")')
await page.click('[data-testid="submit-button"]')
```

### ❌ 잘못됨: 테스트 격리 없음
```typescript
// 테스트가 서로 의존함
test('creates user', () => { /* ... */ })
test('updates same user', () => { /* depends on previous test */ })
```

### ✅ 올바름: 독립적인 테스트
```typescript
// 각 테스트가 자체 데이터를 설정
test('creates user', () => {
  const user = createTestUser()
  // Test logic
})

test('updates user', () => {
  const user = createTestUser()
  // Update logic
})
```

## 지속적 테스트

### 개발 중 감시 모드
```bash
npm test -- --watch
# 파일 변경 시 테스트 자동 실행
```

### 커밋 전 훅
```bash
# 모든 커밋 전 실행
npm test && npm run lint
```

### CI/CD 통합
```yaml
# GitHub Actions
- name: Run Tests
  run: npm test -- --coverage
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 모범 사례

1. **테스트 먼저 작성** - 항상 TDD
2. **테스트당 하나의 어서션** - 단일 동작에 집중
3. **설명적인 테스트 이름** - 테스트 대상 설명
4. **Arrange-Act-Assert** - 명확한 테스트 구조
5. **외부 의존성 모의화** - 단위 테스트 격리
6. **엣지 케이스 테스트** - Null, undefined, 빈값, 큰값
7. **오류 경로 테스트** - 행복 경로만이 아닌
8. **테스트를 빠르게 유지** - 단위 테스트 < 50ms씩
9. **테스트 후 정리** - 부작용 없음
10. **커버리지 보고서 검토** - 격차 식별

## 성공 지표

- 80%+ 코드 커버리지 달성
- 모든 테스트 통과 (녹색)
- 건너뛰거나 비활성화된 테스트 없음
- 빠른 테스트 실행 (단위 테스트 < 30초)
- E2E 테스트가 중요한 사용자 흐름 커버
- 테스트가 프로덕션 전 버그 포착

---

**기억하세요**: 테스트는 선택 사항이 아닙니다. 자신감 있는 리팩토링, 빠른 개발, 프로덕션 안정성을 가능하게 하는 안전망입니다.
