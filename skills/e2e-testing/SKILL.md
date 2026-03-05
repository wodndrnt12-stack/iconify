---
name: e2e-testing
description: Playwright E2E 테스트 패턴, Page Object Model, 설정, CI/CD 통합, 아티팩트 관리, 불안정한 테스트 전략.
origin: ECC
---

# E2E 테스트 패턴

안정적이고 빠르며 유지보수 가능한 E2E 테스트 스위트 구축을 위한 포괄적인 Playwright 패턴.

## 테스트 파일 구조

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── logout.spec.ts
│   │   └── register.spec.ts
│   ├── features/
│   │   ├── browse.spec.ts
│   │   ├── search.spec.ts
│   │   └── create.spec.ts
│   └── api/
│       └── endpoints.spec.ts
├── fixtures/
│   ├── auth.ts
│   └── data.ts
└── playwright.config.ts
```

## Page Object Model (POM)

```typescript
import { Page, Locator } from '@playwright/test'

export class ItemsPage {
  readonly page: Page
  readonly searchInput: Locator
  readonly itemCards: Locator
  readonly createButton: Locator

  constructor(page: Page) {
    this.page = page
    this.searchInput = page.locator('[data-testid="search-input"]')
    this.itemCards = page.locator('[data-testid="item-card"]')
    this.createButton = page.locator('[data-testid="create-btn"]')
  }

  async goto() {
    await this.page.goto('/items')
    await this.page.waitForLoadState('networkidle')
  }

  async search(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForResponse(resp => resp.url().includes('/api/search'))
    await this.page.waitForLoadState('networkidle')
  }

  async getItemCount() {
    return await this.itemCards.count()
  }
}
```

## 테스트 구조

```typescript
import { test, expect } from '@playwright/test'
import { ItemsPage } from '../../pages/ItemsPage'

test.describe('아이템 검색', () => {
  let itemsPage: ItemsPage

  test.beforeEach(async ({ page }) => {
    itemsPage = new ItemsPage(page)
    await itemsPage.goto()
  })

  test('키워드로 검색해야 함', async ({ page }) => {
    await itemsPage.search('test')

    const count = await itemsPage.getItemCount()
    expect(count).toBeGreaterThan(0)

    await expect(itemsPage.itemCards.first()).toContainText(/test/i)
    await page.screenshot({ path: 'artifacts/search-results.png' })
  })

  test('결과 없음을 처리해야 함', async ({ page }) => {
    await itemsPage.search('xyznonexistent123')

    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    expect(await itemsPage.getItemCount()).toBe(0)
  })
})
```

## Playwright 설정

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    ['json', { outputFile: 'playwright-results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

## 불안정한 테스트 패턴

### 격리

```typescript
test('불안정: 복잡한 검색', async ({ page }) => {
  test.fixme(true, '불안정 - Issue #123')
  // 테스트 코드...
})

test('조건부 건너뜀', async ({ page }) => {
  test.skip(process.env.CI, 'CI에서 불안정 - Issue #123')
  // 테스트 코드...
})
```

### 불안정성 식별

```bash
npx playwright test tests/search.spec.ts --repeat-each=10
npx playwright test tests/search.spec.ts --retries=3
```

### 일반적인 원인 및 해결책

**경쟁 조건:**
```typescript
// 나쁨: 요소가 준비됐다고 가정
await page.click('[data-testid="button"]')

// 좋음: 자동 대기 로케이터
await page.locator('[data-testid="button"]').click()
```

**네트워크 타이밍:**
```typescript
// 나쁨: 임의의 타임아웃
await page.waitForTimeout(5000)

// 좋음: 특정 조건 대기
await page.waitForResponse(resp => resp.url().includes('/api/data'))
```

**애니메이션 타이밍:**
```typescript
// 나쁨: 애니메이션 중 클릭
await page.click('[data-testid="menu-item"]')

// 좋음: 안정화 대기
await page.locator('[data-testid="menu-item"]').waitFor({ state: 'visible' })
await page.waitForLoadState('networkidle')
await page.locator('[data-testid="menu-item"]').click()
```

## 아티팩트 관리

### 스크린샷

```typescript
await page.screenshot({ path: 'artifacts/after-login.png' })
await page.screenshot({ path: 'artifacts/full-page.png', fullPage: true })
await page.locator('[data-testid="chart"]').screenshot({ path: 'artifacts/chart.png' })
```

### 트레이스

```typescript
await browser.startTracing(page, {
  path: 'artifacts/trace.json',
  screenshots: true,
  snapshots: true,
})
// ... 테스트 액션 ...
await browser.stopTracing()
```

### 비디오

```typescript
// playwright.config.ts에서
use: {
  video: 'retain-on-failure',
  videosPath: 'artifacts/videos/'
}
```

## CI/CD 통합

```yaml
# .github/workflows/e2e.yml
name: E2E 테스트
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: ${{ vars.STAGING_URL }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 테스트 리포트 템플릿

```markdown
# E2E 테스트 리포트

**날짜:** YYYY-MM-DD HH:MM
**소요 시간:** Xm Ys
**상태:** 통과 / 실패

## 요약
- 전체: X | 통과: Y (Z%) | 실패: A | 불안정: B | 건너뜀: C

## 실패한 테스트

### test-name
**파일:** `tests/e2e/feature.spec.ts:45`
**오류:** 요소가 표시될 것으로 예상
**스크린샷:** artifacts/failed.png
**권장 수정:** [설명]

## 아티팩트
- HTML 리포트: playwright-report/index.html
- 스크린샷: artifacts/*.png
- 비디오: artifacts/videos/*.webm
- 트레이스: artifacts/*.zip
```

## 지갑 / Web3 테스트

```typescript
test('지갑 연결', async ({ page, context }) => {
  // 지갑 프로바이더 모킹
  await context.addInitScript(() => {
    window.ethereum = {
      isMetaMask: true,
      request: async ({ method }) => {
        if (method === 'eth_requestAccounts')
          return ['0x1234567890123456789012345678901234567890']
        if (method === 'eth_chainId') return '0x1'
      }
    }
  })

  await page.goto('/')
  await page.locator('[data-testid="connect-wallet"]').click()
  await expect(page.locator('[data-testid="wallet-address"]')).toContainText('0x1234')
})
```

## 금융 / 중요 플로우 테스트

```typescript
test('거래 실행', async ({ page }) => {
  // 프로덕션 건너뜀 -- 실제 돈
  test.skip(process.env.NODE_ENV === 'production', '프로덕션에서 건너뜀')

  await page.goto('/markets/test-market')
  await page.locator('[data-testid="position-yes"]').click()
  await page.locator('[data-testid="trade-amount"]').fill('1.0')

  // 미리보기 확인
  const preview = page.locator('[data-testid="trade-preview"]')
  await expect(preview).toContainText('1.0')

  // 확인 및 블록체인 대기
  await page.locator('[data-testid="confirm-trade"]').click()
  await page.waitForResponse(
    resp => resp.url().includes('/api/trade') && resp.status() === 200,
    { timeout: 30000 }
  )

  await expect(page.locator('[data-testid="trade-success"]')).toBeVisible()
})
```
