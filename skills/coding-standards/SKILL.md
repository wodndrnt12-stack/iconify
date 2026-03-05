---
name: coding-standards
description: TypeScript, JavaScript, React, Node.js 개발을 위한 범용 코딩 표준, 모범 사례 및 패턴.
origin: ECC
---

# 코딩 표준 및 모범 사례

모든 프로젝트에 적용 가능한 범용 코딩 표준.

## 활성화 조건

- 새 프로젝트 또는 모듈 시작 시
- 코드 품질과 유지보수성 검토 시
- 관례에 맞게 기존 코드 리팩터링 시
- 네이밍, 포매팅, 구조적 일관성 적용 시
- 린팅, 포매팅, 타입 체크 규칙 설정 시
- 새 기여자에게 코딩 관례 소개 시

## 코드 품질 원칙

### 1. 가독성 우선
- 코드는 작성보다 읽히는 시간이 더 많다
- 명확한 변수명과 함수명
- 주석보다 자기 설명적 코드 선호
- 일관된 포매팅

### 2. KISS (Keep It Simple, Stupid)
- 동작하는 가장 단순한 해법
- 과잉 설계 지양
- 조기 최적화 금지
- 이해하기 쉬운 코드 > 영리한 코드

### 3. DRY (Don't Repeat Yourself)
- 공통 로직을 함수로 추출
- 재사용 가능한 컴포넌트 생성
- 모듈 간 유틸리티 공유
- 복사-붙여넣기 프로그래밍 지양

### 4. YAGNI (You Aren't Gonna Need It)
- 필요하기 전에 기능을 만들지 않는다
- 추측성 일반화 지양
- 필요할 때만 복잡성 추가
- 단순하게 시작, 필요 시 리팩터링

## TypeScript/JavaScript 표준

### 변수 네이밍

```typescript
// ✅ GOOD: 설명적인 이름
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

// ❌ BAD: 불명확한 이름
const q = 'election'
const flag = true
const x = 1000
```

### 함수 네이밍

```typescript
// ✅ GOOD: 동사-명사 패턴
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

// ❌ BAD: 불명확하거나 명사만 사용
async function market(id: string) { }
function similarity(a, b) { }
function email(e) { }
```

### 불변성 패턴 (중요)

```typescript
// ✅ ALWAYS use spread operator
const updatedUser = {
  ...user,
  name: 'New Name'
}

const updatedArray = [...items, newItem]

// ❌ NEVER mutate directly
user.name = 'New Name'  // BAD
items.push(newItem)     // BAD
```

### 에러 처리

```typescript
// ✅ GOOD: 포괄적인 에러 처리
async function fetchData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}

// ❌ BAD: 에러 처리 없음
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
```

### Async/Await 모범 사례

```typescript
// ✅ GOOD: 가능하면 병렬 실행
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

// ❌ BAD: 불필요한 순차 실행
const users = await fetchUsers()
const markets = await fetchMarkets()
const stats = await fetchStats()
```

### 타입 안전성

```typescript
// ✅ GOOD: 적절한 타입
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> {
  // Implementation
}

// ❌ BAD: 'any' 사용
function getMarket(id: any): Promise<any> {
  // Implementation
}
```

## React 모범 사례

### 컴포넌트 구조

```typescript
// ✅ GOOD: 타입이 있는 함수형 컴포넌트
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// ❌ BAD: 타입 없음, 불명확한 구조
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

### 커스텀 훅

```typescript
// ✅ GOOD: 재사용 가능한 커스텀 훅
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// 사용법
const debouncedQuery = useDebounce(searchQuery, 500)
```

### 상태 관리

```typescript
// ✅ GOOD: 올바른 상태 업데이트
const [count, setCount] = useState(0)

// 이전 상태에 기반한 상태 업데이트 시 함수형 업데이트 사용
setCount(prev => prev + 1)

// ❌ BAD: 직접 상태 참조
setCount(count + 1)  // 비동기 시나리오에서 stale 값 문제 발생 가능
```

### 조건부 렌더링

```typescript
// ✅ GOOD: 명확한 조건부 렌더링
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ BAD: 삼항 연산자 지옥
{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

## API 설계 표준

### REST API 관례

```
GET    /api/markets              # 전체 마켓 목록
GET    /api/markets/:id          # 특정 마켓 조회
POST   /api/markets              # 새 마켓 생성
PUT    /api/markets/:id          # 마켓 전체 업데이트
PATCH  /api/markets/:id          # 마켓 부분 업데이트
DELETE /api/markets/:id          # 마켓 삭제

# 필터링을 위한 쿼리 파라미터
GET /api/markets?status=active&limit=10&offset=0
```

### 응답 형식

```typescript
// ✅ GOOD: 일관된 응답 구조
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// 성공 응답
return NextResponse.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 }
})

// 에러 응답
return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })
```

### 입력 유효성 검사

```typescript
import { z } from 'zod'

// ✅ GOOD: 스키마 유효성 검사
const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
})

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const validated = CreateMarketSchema.parse(body)
    // validated 데이터로 처리 진행
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}
```

## 파일 구성

### 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── markets/           # 마켓 페이지
│   └── (auth)/           # 인증 페이지 (라우트 그룹)
├── components/            # React 컴포넌트
│   ├── ui/               # 범용 UI 컴포넌트
│   ├── forms/            # 폼 컴포넌트
│   └── layouts/          # 레이아웃 컴포넌트
├── hooks/                # 커스텀 React 훅
├── lib/                  # 유틸리티 및 설정
│   ├── api/             # API 클라이언트
│   ├── utils/           # 헬퍼 함수
│   └── constants/       # 상수
├── types/                # TypeScript 타입
└── styles/              # 글로벌 스타일
```

### 파일 네이밍

```
components/Button.tsx          # 컴포넌트는 PascalCase
hooks/useAuth.ts              # 'use' 접두사가 붙은 camelCase
lib/formatDate.ts             # 유틸리티는 camelCase
types/market.types.ts         # .types 접미사가 붙은 camelCase
```

## 주석 및 문서화

### 주석 작성 시점

```typescript
// ✅ GOOD: 무엇이 아닌 왜를 설명
// 장애 발생 시 API 과부하를 방지하기 위해 지수 백오프 사용
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// 대용량 배열의 성능을 위해 의도적으로 뮤테이션 사용
items.push(newItem)

// ❌ BAD: 당연한 내용 설명
// 카운터를 1 증가
count++

// 이름을 사용자 이름으로 설정
name = user.name
```

### 공개 API용 JSDoc

```typescript
/**
 * 의미적 유사성으로 마켓을 검색합니다.
 *
 * @param query - 자연어 검색 쿼리
 * @param limit - 최대 결과 수 (기본값: 10)
 * @returns 유사도 점수 순으로 정렬된 마켓 배열
 * @throws {Error} OpenAI API 실패 또는 Redis 사용 불가 시
 *
 * @example
 * ```typescript
 * const results = await searchMarkets('election', 5)
 * console.log(results[0].name) // "Trump vs Biden"
 * ```
 */
export async function searchMarkets(
  query: string,
  limit: number = 10
): Promise<Market[]> {
  // Implementation
}
```

## 성능 모범 사례

### 메모이제이션

```typescript
import { useMemo, useCallback } from 'react'

// ✅ GOOD: 비용이 큰 연산 메모이제이션
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// ✅ GOOD: 콜백 메모이제이션
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])
```

### 지연 로딩

```typescript
import { lazy, Suspense } from 'react'

// ✅ GOOD: 무거운 컴포넌트 지연 로딩
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### 데이터베이스 쿼리

```typescript
// ✅ GOOD: 필요한 컬럼만 선택
const { data } = await supabase
  .from('markets')
  .select('id, name, status')
  .limit(10)

// ❌ BAD: 전체 선택
const { data } = await supabase
  .from('markets')
  .select('*')
```

## 테스트 표준

### 테스트 구조 (AAA 패턴)

```typescript
test('유사도를 정확하게 계산한다', () => {
  // Arrange (준비)
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act (실행)
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert (검증)
  expect(similarity).toBe(0)
})
```

### 테스트 네이밍

```typescript
// ✅ GOOD: 설명적인 테스트 이름
test('쿼리에 맞는 마켓이 없으면 빈 배열을 반환한다', () => { })
test('OpenAI API 키가 없으면 에러를 던진다', () => { })
test('Redis 사용 불가 시 부분 문자열 검색으로 폴백한다', () => { })

// ❌ BAD: 애매한 테스트 이름
test('works', () => { })
test('test search', () => { })
```

## 코드 냄새 탐지

다음 안티패턴에 주의:

### 1. 긴 함수
```typescript
// ❌ BAD: 50줄 초과 함수
function processMarketData() {
  // 100줄의 코드
}

// ✅ GOOD: 더 작은 함수로 분리
function processMarketData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}
```

### 2. 깊은 중첩
```typescript
// ❌ BAD: 5단계 이상의 중첩
if (user) {
  if (user.isAdmin) {
    if (market) {
      if (market.isActive) {
        if (hasPermission) {
          // 무언가 처리
        }
      }
    }
  }
}

// ✅ GOOD: 조기 반환
if (!user) return
if (!user.isAdmin) return
if (!market) return
if (!market.isActive) return
if (!hasPermission) return

// 무언가 처리
```

### 3. 매직 넘버
```typescript
// ❌ BAD: 설명 없는 숫자
if (retryCount > 3) { }
setTimeout(callback, 500)

// ✅ GOOD: 명명된 상수
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)
```

**기억**: 코드 품질은 협상 불가능합니다. 명확하고 유지보수 가능한 코드가 빠른 개발과 자신감 있는 리팩터링을 가능하게 합니다.
