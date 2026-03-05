---
name: security-review
description: 인증 추가, 사용자 입력 처리, 시크릿 작업, API 엔드포인트 생성, 또는 결제/민감한 기능 구현 시 이 스킬을 사용하세요. 포괄적인 보안 체크리스트와 패턴을 제공합니다.
origin: ECC
---

# 보안 검토 스킬

이 스킬은 모든 코드가 보안 모범 사례를 따르고 잠재적 취약점을 식별하도록 보장합니다.

## 활성화 시점

- 인증 또는 권한 부여 구현
- 사용자 입력 또는 파일 업로드 처리
- 새 API 엔드포인트 생성
- 시크릿 또는 자격증명 작업
- 결제 기능 구현
- 민감한 데이터 저장 또는 전송
- 서드파티 API 통합

## 보안 체크리스트

### 1. 시크릿 관리

#### 절대 하지 말 것
```typescript
const apiKey = "sk-proj-xxxxx"  // 하드코딩된 시크릿
const dbPassword = "password123" // 소스 코드에 포함
```

#### 항상 할 것
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

// 시크릿 존재 확인
if (!apiKey) {
  throw new Error('OPENAI_API_KEY가 설정되지 않음')
}
```

#### 검증 단계
- [ ] 하드코딩된 API 키, 토큰, 비밀번호 없음
- [ ] 모든 시크릿이 환경 변수에 있음
- [ ] `.env.local`이 .gitignore에 포함됨
- [ ] git 이력에 시크릿 없음
- [ ] 프로덕션 시크릿이 호스팅 플랫폼에 있음 (Vercel, Railway)

### 2. 입력 유효성 검사

#### 항상 사용자 입력 유효성 검사하기
```typescript
import { z } from 'zod'

// 유효성 검사 스키마 정의
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

// 처리 전 유효성 검사
export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

#### 파일 업로드 유효성 검사
```typescript
function validateFileUpload(file: File) {
  // 크기 확인 (5MB 최대)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('파일이 너무 큼 (최대 5MB)')
  }

  // 타입 확인
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('잘못된 파일 타입')
  }

  // 확장자 확인
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) {
    throw new Error('잘못된 파일 확장자')
  }

  return true
}
```

#### 검증 단계
- [ ] 모든 사용자 입력이 스키마로 유효성 검사됨
- [ ] 파일 업로드가 제한됨 (크기, 타입, 확장자)
- [ ] 쿼리에서 사용자 입력을 직접 사용하지 않음
- [ ] 화이트리스트 유효성 검사 (블랙리스트 아님)
- [ ] 오류 메시지가 민감한 정보를 노출하지 않음

### 3. SQL 인젝션 방지

#### SQL 연결 절대 금지
```typescript
// 위험 - SQL 인젝션 취약점
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query)
```

#### 항상 매개변수화된 쿼리 사용
```typescript
// 안전 - 매개변수화된 쿼리
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', userEmail)

// 또는 원시 SQL 사용 시
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
)
```

#### 검증 단계
- [ ] 모든 데이터베이스 쿼리가 매개변수화된 쿼리 사용
- [ ] SQL에서 문자열 연결 없음
- [ ] ORM/쿼리 빌더가 올바르게 사용됨
- [ ] Supabase 쿼리가 올바르게 살균됨

### 4. 인증 및 권한 부여

#### JWT 토큰 처리
```typescript
// 잘못됨: localStorage (XSS에 취약)
localStorage.setItem('token', token)

// 올바름: httpOnly 쿠키
res.setHeader('Set-Cookie',
  `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

#### 권한 부여 확인
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  // 항상 먼저 권한 부여 확인
  const requester = await db.users.findUnique({
    where: { id: requesterId }
  })

  if (requester.role !== 'admin') {
    return NextResponse.json(
      { error: '권한 없음' },
      { status: 403 }
    )
  }

  // 삭제 진행
  await db.users.delete({ where: { id: userId } })
}
```

#### 행 수준 보안 (Supabase)
```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 볼 수 있음
CREATE POLICY "사용자 자신의 데이터 조회"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 자신의 데이터만 수정할 수 있음
CREATE POLICY "사용자 자신의 데이터 수정"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

#### 검증 단계
- [ ] 토큰이 httpOnly 쿠키에 저장됨 (localStorage 아님)
- [ ] 민감한 작업 전 권한 부여 확인
- [ ] Supabase에서 행 수준 보안 활성화됨
- [ ] 역할 기반 접근 제어 구현됨
- [ ] 세션 관리가 안전함

### 5. XSS 방지

#### HTML 살균
```typescript
import DOMPurify from 'isomorphic-dompurify'

// 항상 사용자 제공 HTML 살균
function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

#### Content Security Policy
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

#### 검증 단계
- [ ] 사용자 제공 HTML이 살균됨
- [ ] CSP 헤더가 설정됨
- [ ] 유효성 검사되지 않은 동적 콘텐츠 렌더링 없음
- [ ] React의 내장 XSS 보호 사용됨

### 6. CSRF 방어

#### CSRF 토큰
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')

  if (!csrf.verify(token)) {
    return NextResponse.json(
      { error: '잘못된 CSRF 토큰' },
      { status: 403 }
    )
  }

  // 요청 처리
}
```

#### SameSite 쿠키
```typescript
res.setHeader('Set-Cookie',
  `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

#### 검증 단계
- [ ] 상태 변경 작업에 CSRF 토큰
- [ ] 모든 쿠키에 SameSite=Strict
- [ ] 이중 제출 쿠키 패턴 구현됨

### 7. 속도 제한

#### API 속도 제한
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 윈도우당 100 요청
  message: '너무 많은 요청'
})

// 라우트에 적용
app.use('/api/', limiter)
```

#### 비용이 많이 드는 작업
```typescript
// 검색에 대한 공격적인 속도 제한
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 분당 10 요청
  message: '너무 많은 검색 요청'
})

app.use('/api/search', searchLimiter)
```

#### 검증 단계
- [ ] 모든 API 엔드포인트에 속도 제한
- [ ] 비용이 많이 드는 작업에 더 엄격한 제한
- [ ] IP 기반 속도 제한
- [ ] 사용자 기반 속도 제한 (인증된)

### 8. 민감한 데이터 노출

#### 로깅
```typescript
// 잘못됨: 민감한 데이터 로깅
console.log('사용자 로그인:', { email, password })
console.log('결제:', { cardNumber, cvv })

// 올바름: 민감한 데이터 편집
console.log('사용자 로그인:', { email, userId })
console.log('결제:', { last4: card.last4, userId })
```

#### 오류 메시지
```typescript
// 잘못됨: 내부 세부사항 노출
catch (error) {
  return NextResponse.json(
    { error: error.message, stack: error.stack },
    { status: 500 }
  )
}

// 올바름: 일반적인 오류 메시지
catch (error) {
  console.error('내부 오류:', error)
  return NextResponse.json(
    { error: '오류가 발생했습니다. 다시 시도해주세요.' },
    { status: 500 }
  )
}
```

#### 검증 단계
- [ ] 로그에 비밀번호, 토큰, 시크릿 없음
- [ ] 사용자에게 오류 메시지가 일반적임
- [ ] 상세 오류는 서버 로그에만
- [ ] 사용자에게 스택 트레이스 노출 없음

### 9. 블록체인 보안 (Solana)

#### 지갑 확인
```typescript
import { verify } from '@solana/web3.js'

async function verifyWalletOwnership(
  publicKey: string,
  signature: string,
  message: string
) {
  try {
    const isValid = verify(
      Buffer.from(message),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64')
    )
    return isValid
  } catch (error) {
    return false
  }
}
```

#### 거래 확인
```typescript
async function verifyTransaction(transaction: Transaction) {
  // 수신자 확인
  if (transaction.to !== expectedRecipient) {
    throw new Error('잘못된 수신자')
  }

  // 금액 확인
  if (transaction.amount > maxAmount) {
    throw new Error('금액이 한도를 초과함')
  }

  // 사용자에게 충분한 잔액이 있는지 확인
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('잔액 부족')
  }

  return true
}
```

#### 검증 단계
- [ ] 지갑 서명 확인됨
- [ ] 거래 세부사항 유효성 검사됨
- [ ] 거래 전 잔액 확인
- [ ] 맹목적인 거래 서명 없음

### 10. 의존성 보안

#### 정기 업데이트
```bash
# 취약점 확인
npm audit

# 자동으로 수정 가능한 문제 수정
npm audit fix

# 의존성 업데이트
npm update

# 오래된 패키지 확인
npm outdated
```

#### 잠금 파일
```bash
# 항상 잠금 파일 커밋
git add package-lock.json

# 재현 가능한 빌드를 위해 CI/CD에서 사용
npm ci  # npm install 대신
```

#### 검증 단계
- [ ] 의존성 최신 상태
- [ ] 알려진 취약점 없음 (npm audit 통과)
- [ ] 잠금 파일 커밋됨
- [ ] GitHub에 Dependabot 활성화됨
- [ ] 정기적인 보안 업데이트

## 보안 테스트

### 자동화된 보안 테스트
```typescript
// 인증 테스트
test('인증 필요', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

// 권한 부여 테스트
test('관리자 역할 필요', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

// 입력 유효성 검사 테스트
test('잘못된 입력 거부', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

// 속도 제한 테스트
test('속도 제한 적용', async () => {
  const requests = Array(101).fill(null).map(() =>
    fetch('/api/endpoint')
  )

  const responses = await Promise.all(requests)
  const tooManyRequests = responses.filter(r => r.status === 429)

  expect(tooManyRequests.length).toBeGreaterThan(0)
})
```

## 배포 전 보안 체크리스트

모든 프로덕션 배포 전:

- [ ] **시크릿**: 하드코딩된 시크릿 없음, 모두 환경 변수에
- [ ] **입력 유효성 검사**: 모든 사용자 입력 유효성 검사됨
- [ ] **SQL 인젝션**: 모든 쿼리 매개변수화됨
- [ ] **XSS**: 사용자 콘텐츠 살균됨
- [ ] **CSRF**: 방어 활성화됨
- [ ] **인증**: 올바른 토큰 처리
- [ ] **권한 부여**: 역할 확인 적용됨
- [ ] **속도 제한**: 모든 엔드포인트에 활성화됨
- [ ] **HTTPS**: 프로덕션에서 강제됨
- [ ] **보안 헤더**: CSP, X-Frame-Options 설정됨
- [ ] **오류 처리**: 오류에 민감한 데이터 없음
- [ ] **로깅**: 민감한 데이터 로그되지 않음
- [ ] **의존성**: 최신 상태, 취약점 없음
- [ ] **행 수준 보안**: Supabase에서 활성화됨
- [ ] **CORS**: 올바르게 설정됨
- [ ] **파일 업로드**: 유효성 검사됨 (크기, 타입)
- [ ] **지갑 서명**: 확인됨 (블록체인인 경우)

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js 보안](https://nextjs.org/docs/security)
- [Supabase 보안](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)

---

**기억하세요**: 보안은 선택 사항이 아닙니다. 하나의 취약점이 전체 플랫폼을 위협할 수 있습니다. 의심스럽다면 보수적으로 판단하세요.
