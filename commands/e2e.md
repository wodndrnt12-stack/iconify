---
description: Playwright로 E2E 테스트를 생성하고 실행합니다. 테스트 여정을 만들고, 테스트를 실행하고, 스크린샷/비디오/트레이스를 캡처하고, 아티팩트를 업로드합니다.
---

# E2E 명령

이 명령은 **e2e-runner** 에이전트를 호출하여 Playwright를 사용한 E2E 테스트를 생성, 유지 및 실행합니다.

## 이 명령이 하는 일

1. **테스트 여정 생성** - 사용자 플로우에 대한 Playwright 테스트 생성
2. **E2E 테스트 실행** - 여러 브라우저에서 테스트 실행
3. **아티팩트 캡처** - 실패 시 스크린샷, 비디오, 트레이스 캡처
4. **결과 업로드** - HTML 보고서 및 JUnit XML
5. **불안정한 테스트 식별** - 불안정한 테스트 격리

## 사용 시기

다음 경우에 `/e2e`를 사용합니다:
- 중요한 사용자 여정 테스트 (로그인, 거래, 결제)
- 다단계 플로우의 종단 간 작동 확인
- UI 상호작용 및 탐색 테스트
- 프론트엔드와 백엔드 간 통합 검증
- 프로덕션 배포 준비

## 동작 방식

e2e-runner 에이전트가 수행할 작업:

1. **사용자 플로우 분석** 및 테스트 시나리오 식별
2. Page Object Model 패턴을 사용한 **Playwright 테스트 생성**
3. 여러 브라우저(Chrome, Firefox, Safari)에서 **테스트 실행**
4. 스크린샷, 비디오, 트레이스로 **실패 캡처**
5. 결과 및 아티팩트가 포함된 **보고서 생성**
6. **불안정한 테스트 식별** 및 수정 권장

## 사용 예시

```
사용자: /e2e 시장 검색 및 조회 플로우 테스트

에이전트 (e2e-runner):
# E2E 테스트 생성: 시장 검색 및 조회 플로우

## 식별된 테스트 시나리오

**사용자 여정:** 시장 검색 → 결과 조회 → 시장 클릭 → 상세 조회

**테스트 커버리지:**
1. 시장 페이지 탐색
2. 시맨틱 검색 수행
3. 검색 결과 확인
4. 첫 번째 결과 클릭
5. 시장 상세 페이지 로드 확인
6. 차트 렌더링 확인

## 생성된 테스트 코드

```typescript
// tests/e2e/markets/search-and-view.spec.ts
import { test, expect } from '@playwright/test'
import { MarketsPage } from '../../pages/MarketsPage'
import { MarketDetailsPage } from '../../pages/MarketDetailsPage'

test.describe('Market Search and View Flow', () => {
  test('user can search markets and view details', async ({ page }) => {
    // 1. Navigate to markets page
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Verify page loaded
    await expect(page).toHaveTitle(/Markets/)
    await expect(page.locator('h1')).toContainText('Markets')

    // 2. Perform semantic search
    await marketsPage.searchMarkets('election')

    // Wait for API response
    await page.waitForResponse(resp =>
      resp.url().includes('/api/markets/search') && resp.status() === 200
    )

    // 3. Verify search results
    const marketCards = marketsPage.marketCards
    await expect(marketCards.first()).toBeVisible()
    const resultCount = await marketCards.count()
    expect(resultCount).toBeGreaterThan(0)

    // Take screenshot of search results
    await page.screenshot({ path: 'artifacts/search-results.png' })

    // 4. Click on first result
    const firstMarketTitle = await marketCards.first().textContent()
    await marketCards.first().click()

    // 5. Verify market details page loads
    await expect(page).toHaveURL(/\/markets\/[a-z0-9-]+/)

    const detailsPage = new MarketDetailsPage(page)
    await expect(detailsPage.marketName).toBeVisible()
    await expect(detailsPage.marketDescription).toBeVisible()

    // 6. Verify chart renders
    await expect(detailsPage.priceChart).toBeVisible()

    // Verify market name matches
    const detailsTitle = await detailsPage.marketName.textContent()
    expect(detailsTitle?.toLowerCase()).toContain(
      firstMarketTitle?.toLowerCase().substring(0, 20) || ''
    )

    // Take screenshot of market details
    await page.screenshot({ path: 'artifacts/market-details.png' })
  })

  test('search with no results shows empty state', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Search for non-existent market
    await marketsPage.searchMarkets('xyznonexistentmarket123456')

    // Verify empty state
    await expect(page.locator('[data-testid="no-results"]')).toBeVisible()
    await expect(page.locator('[data-testid="no-results"]')).toContainText(
      /no.*results|no.*markets/i
    )

    const marketCount = await marketsPage.marketCards.count()
    expect(marketCount).toBe(0)
  })

  test('can clear search and see all markets again', async ({ page }) => {
    const marketsPage = new MarketsPage(page)
    await marketsPage.goto()

    // Initial market count
    const initialCount = await marketsPage.marketCards.count()

    // Perform search
    await marketsPage.searchMarkets('trump')
    await page.waitForLoadState('networkidle')

    // Verify filtered results
    const filteredCount = await marketsPage.marketCards.count()
    expect(filteredCount).toBeLessThan(initialCount)

    // Clear search
    await marketsPage.searchInput.clear()
    await page.waitForLoadState('networkidle')

    // Verify all markets shown again
    const finalCount = await marketsPage.marketCards.count()
    expect(finalCount).toBe(initialCount)
  })
})
```

## 테스트 실행

```bash
# Run the generated test
npx playwright test tests/e2e/markets/search-and-view.spec.ts

Running 3 tests using 3 workers

  ✓  [chromium] › search-and-view.spec.ts:5:3 › user can search markets and view details (4.2s)
  ✓  [chromium] › search-and-view.spec.ts:52:3 › search with no results shows empty state (1.8s)
  ✓  [chromium] › search-and-view.spec.ts:67:3 › can clear search and see all markets again (2.9s)

  3 passed (9.1s)

Artifacts generated:
- artifacts/search-results.png
- artifacts/market-details.png
- playwright-report/index.html
```

## 테스트 보고서

```
╔══════════════════════════════════════════════════════════════╗
║                    E2E 테스트 결과                           ║
╠══════════════════════════════════════════════════════════════╣
║ 상태:     ✅ 모든 테스트 통과                                ║
║ 전체:      3개 테스트                                        ║
║ 통과:     3 (100%)                                           ║
║ 실패:     0                                                  ║
║ 불안정:   0                                                  ║
║ 소요시간: 9.1s                                               ║
╚══════════════════════════════════════════════════════════════╝

아티팩트:
스크린샷: 2개 파일
비디오: 0개 파일 (실패 시에만)
트레이스: 0개 파일 (실패 시에만)
HTML 보고서: playwright-report/index.html

보고서 보기: npx playwright show-report
```

✅ E2E 테스트 스위트가 CI/CD 통합 준비 완료!
```

## 테스트 아티팩트

테스트 실행 시 다음 아티팩트가 캡처됩니다:

**모든 테스트에서:**
- 타임라인 및 결과가 포함된 HTML 보고서
- CI 통합을 위한 JUnit XML

**실패 시에만:**
- 실패 상태의 스크린샷
- 테스트 비디오 녹화
- 디버깅용 트레이스 파일 (단계별 재생)
- 네트워크 로그
- 콘솔 로그

## 아티팩트 보기

```bash
# 브라우저에서 HTML 보고서 보기
npx playwright show-report

# 특정 트레이스 파일 보기
npx playwright show-trace artifacts/trace-abc123.zip

# 스크린샷은 artifacts/ 디렉터리에 저장됨
open artifacts/search-results.png
```

## 불안정한 테스트 감지

테스트가 간헐적으로 실패하는 경우:

```
불안정한 테스트 감지: tests/e2e/markets/trade.spec.ts

10회 실행 중 7회 통과 (통과율 70%)

일반적인 실패:
"Timeout waiting for element '[data-testid="confirm-btn"]'"

권장 수정 사항:
1. 명시적 대기 추가: await page.waitForSelector('[data-testid="confirm-btn"]')
2. 타임아웃 증가: { timeout: 10000 }
3. 컴포넌트의 레이스 컨디션 확인
4. 애니메이션으로 인해 요소가 숨겨지지 않는지 확인

격리 권장: 수정될 때까지 test.fixme()로 표시
```

## 브라우저 설정

기본적으로 여러 브라우저에서 테스트가 실행됩니다:
- ✅ Chromium (데스크톱 Chrome)
- ✅ Firefox (데스크톱)
- ✅ WebKit (데스크톱 Safari)
- ✅ 모바일 Chrome (선택 사항)

브라우저 조정을 위해 `playwright.config.ts`에서 설정합니다.

## CI/CD 통합

CI 파이프라인에 추가합니다:

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npx playwright test

- name: Upload artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## PMX 특화 핵심 플로우

PMX의 경우 다음 E2E 테스트를 우선합니다:

**중요 (항상 통과해야 함):**
1. 사용자가 지갑을 연결할 수 있음
2. 사용자가 시장을 탐색할 수 있음
3. 사용자가 시장을 검색할 수 있음 (시맨틱 검색)
4. 사용자가 시장 상세 정보를 볼 수 있음
5. 사용자가 거래를 할 수 있음 (테스트 자금 사용)
6. 시장이 올바르게 정산됨
7. 사용자가 자금을 출금할 수 있음

**중요:**
1. 시장 생성 플로우
2. 사용자 프로필 업데이트
3. 실시간 가격 업데이트
4. 차트 렌더링
5. 시장 필터링 및 정렬
6. 모바일 반응형 레이아웃

## 모범 사례

**권장:**
- ✅ 유지 관리를 위해 Page Object Model 사용
- ✅ 셀렉터에 data-testid 속성 사용
- ✅ 임의의 타임아웃이 아닌 API 응답 대기
- ✅ 종단 간 핵심 사용자 여정 테스트
- ✅ main으로 병합 전 테스트 실행
- ✅ 테스트 실패 시 아티팩트 검토

**비권장:**
- ❌ 불안정한 셀렉터 사용 (CSS 클래스는 변경될 수 있음)
- ❌ 구현 세부 사항 테스트
- ❌ 프로덕션에서 테스트 실행
- ❌ 불안정한 테스트 무시
- ❌ 실패 시 아티팩트 검토 건너뛰기
- ❌ E2E로 모든 엣지 케이스 테스트 (단위 테스트 사용)

## 중요 사항

**PMX 필수 사항:**
- 실제 돈이 포함된 E2E 테스트는 반드시 테스트넷/스테이징에서만 실행해야 합니다
- 프로덕션에서 거래 테스트 실행 금지
- 금융 테스트에 `test.skip(process.env.NODE_ENV === 'production')` 설정
- 소액의 테스트 자금이 있는 테스트 지갑만 사용

## 다른 명령과의 통합

- `/plan`을 사용하여 테스트할 핵심 여정 식별
- `/tdd`를 사용하여 단위 테스트 실행 (더 빠르고 세분화됨)
- `/e2e`를 사용하여 통합 및 사용자 여정 테스트
- `/code-review`를 사용하여 테스트 품질 검증

## 관련 에이전트

이 명령은 다음 위치의 `e2e-runner` 에이전트를 호출합니다:
`~/.claude/agents/e2e-runner.md`

## 빠른 명령

```bash
# 모든 E2E 테스트 실행
npx playwright test

# 특정 테스트 파일 실행
npx playwright test tests/e2e/markets/search.spec.ts

# 헤드 모드로 실행 (브라우저 표시)
npx playwright test --headed

# 테스트 디버그
npx playwright test --debug

# 테스트 코드 생성
npx playwright codegen http://localhost:3000

# 보고서 보기
npx playwright show-report
```
