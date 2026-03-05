---
name: deployment-patterns
description: 배포 워크플로우, CI/CD 파이프라인 패턴, Docker 컨테이너화, 헬스 체크, 롤백 전략, 웹 애플리케이션 프로덕션 배포 준비 체크리스트.
origin: ECC
---

# 배포 패턴

프로덕션 배포 워크플로우 및 CI/CD 모범 사례.

## 활성화 시점

- CI/CD 파이프라인 구성 시
- 애플리케이션 Docker화 시
- 배포 전략 계획 시 (블루-그린, 카나리, 롤링)
- 헬스 체크 및 레디니스 프로브 구현 시
- 프로덕션 릴리스 준비 시
- 환경별 설정 구성 시

## 배포 전략

### 롤링 배포 (기본값)

인스턴스를 점진적으로 교체 — 롤아웃 중 구버전과 신버전이 동시에 실행됨.

```
Instance 1: v1 → v2  (update first)
Instance 2: v1        (still running v1)
Instance 3: v1        (still running v1)

Instance 1: v2
Instance 2: v1 → v2  (update second)
Instance 3: v1

Instance 1: v2
Instance 2: v2
Instance 3: v1 → v2  (update last)
```

**장점:** 무중단 배포, 점진적 롤아웃
**단점:** 두 버전이 동시 실행 — 하위 호환성 변경 필요
**사용 시점:** 일반 배포, 하위 호환 변경

### 블루-그린 배포

동일한 환경 두 개를 운영. 트래픽을 원자적으로 전환.

```
Blue  (v1) ← traffic
Green (v2)   idle, running new version

# After verification:
Blue  (v1)   idle (becomes standby)
Green (v2) ← traffic
```

**장점:** 즉시 롤백 가능 (blue로 재전환), 깔끔한 전환
**단점:** 배포 중 2배 인프라 필요
**사용 시점:** 중요 서비스, 장애 허용 불가 서비스

### 카나리 배포

신버전으로 소량의 트래픽만 먼저 라우팅.

```
v1: 95% of traffic
v2:  5% of traffic  (canary)

# If metrics look good:
v1: 50% of traffic
v2: 50% of traffic

# Final:
v2: 100% of traffic
```

**장점:** 전체 롤아웃 전에 실제 트래픽으로 문제 감지
**단점:** 트래픽 분할 인프라 및 모니터링 필요
**사용 시점:** 고트래픽 서비스, 위험한 변경, 피처 플래그

## Docker

### 멀티 스테이지 Dockerfile (Node.js)

```dockerfile
# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --production=false

# Stage 2: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --production

# Stage 3: Production image
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### 멀티 스테이지 Dockerfile (Go)

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

FROM alpine:3.19 AS runner
RUN apk --no-cache add ca-certificates
RUN adduser -D -u 1001 appuser
USER appuser

COPY --from=builder /server /server

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["/server"]
```

### 멀티 스테이지 Dockerfile (Python/Django)

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

FROM python:3.12-slim AS runner
WORKDIR /app

RUN useradd -r -u 1001 appuser
USER appuser

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/')" || exit 1
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

### Docker 모범 사례

```
# 권장 사항
- 특정 버전 태그 사용 (node:22-alpine, node:latest 금지)
- 멀티 스테이지 빌드로 이미지 크기 최소화
- 루트가 아닌 사용자로 실행
- 의존성 파일 먼저 복사 (레이어 캐싱)
- .dockerignore로 node_modules, .git, tests 제외
- HEALTHCHECK 명령 추가
- docker-compose 또는 k8s에서 리소스 제한 설정

# 금지 사항
- 루트로 실행
- :latest 태그 사용
- 한 번의 COPY 레이어로 전체 레포 복사
- 프로덕션 이미지에 개발 의존성 설치
- 이미지에 시크릿 저장 (환경 변수 또는 시크릿 매니저 사용)
```

## CI/CD 파이프라인

### GitHub Actions (표준 파이프라인)

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        run: |
          # Platform-specific deployment command
          # Railway: railway up
          # Vercel: vercel --prod
          # K8s: kubectl set image deployment/app app=ghcr.io/${{ github.repository }}:${{ github.sha }}
          echo "Deploying ${{ github.sha }}"
```

### 파이프라인 단계

```
PR 생성:
  lint → typecheck → 단위 테스트 → 통합 테스트 → 프리뷰 배포

main 병합:
  lint → typecheck → 단위 테스트 → 통합 테스트 → 이미지 빌드 → 스테이징 배포 → 스모크 테스트 → 프로덕션 배포
```

## 헬스 체크

### 헬스 체크 엔드포인트

```typescript
// 단순 헬스 체크
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 상세 헬스 체크 (내부 모니터링용)
app.get("/health/detailed", async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    externalApi: await checkExternalApi(),
  };

  const allHealthy = Object.values(checks).every(c => c.status === "ok");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "unknown",
    uptime: process.uptime(),
    checks,
  });
});

async function checkDatabase(): Promise<HealthCheck> {
  try {
    await db.query("SELECT 1");
    return { status: "ok", latency_ms: 2 };
  } catch (err) {
    return { status: "error", message: "Database unreachable" };
  }
}
```

### Kubernetes 프로브

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
  failureThreshold: 2

startupProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 30    # 30 * 5s = 최대 150초 시작 시간
```

## 환경 설정

### 12팩터 앱 패턴

```bash
# 모든 설정은 환경 변수로 — 코드에 절대 넣지 말 것
DATABASE_URL=postgres://user:pass@host:5432/db
REDIS_URL=redis://host:6379/0
API_KEY=${API_KEY}           # 시크릿 매니저로 주입
LOG_LEVEL=info
PORT=3000

# 환경별 동작
NODE_ENV=production          # 또는 staging, development
APP_ENV=production           # 명시적 앱 환경
```

### 설정 유효성 검사

```typescript
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

// 시작 시 검증 — 설정이 잘못되면 즉시 실패
export const env = envSchema.parse(process.env);
```

## 롤백 전략

### 즉시 롤백

```bash
# Docker/Kubernetes: 이전 이미지로 복원
kubectl rollout undo deployment/app

# Vercel: 이전 배포 승격
vercel rollback

# Railway: 이전 커밋으로 재배포
railway up --commit <previous-sha>

# 데이터베이스: 마이그레이션 롤백 (되돌릴 수 있는 경우)
npx prisma migrate resolve --rolled-back <migration-name>
```

### 롤백 체크리스트

- [ ] 이전 이미지/아티팩트가 태그와 함께 사용 가능한지 확인
- [ ] 데이터베이스 마이그레이션이 하위 호환 (파괴적 변경 없음)
- [ ] 피처 플래그로 새 기능을 배포 없이 비활성화 가능
- [ ] 에러율 급증 시 모니터링 알림 구성
- [ ] 프로덕션 릴리스 전 스테이징에서 롤백 테스트 완료

## 프로덕션 배포 준비 체크리스트

모든 프로덕션 배포 전 확인:

### 애플리케이션
- [ ] 모든 테스트 통과 (단위, 통합, E2E)
- [ ] 코드 또는 설정 파일에 하드코딩된 시크릿 없음
- [ ] 에러 처리가 모든 엣지 케이스 커버
- [ ] 로깅이 구조화(JSON)되어 있고 PII 포함 안 함
- [ ] 헬스 체크 엔드포인트가 의미 있는 상태 반환

### 인프라
- [ ] Docker 이미지가 재현 가능하게 빌드 (버전 고정)
- [ ] 환경 변수 문서화 및 시작 시 검증
- [ ] 리소스 제한 설정 (CPU, 메모리)
- [ ] 수평 스케일링 구성 (최소/최대 인스턴스)
- [ ] 모든 엔드포인트에 SSL/TLS 활성화

### 모니터링
- [ ] 애플리케이션 메트릭 노출 (요청률, 지연시간, 에러)
- [ ] 에러율 임계값 초과 시 알림 구성
- [ ] 로그 집계 구성 (구조화 로그, 검색 가능)
- [ ] 헬스 엔드포인트 업타임 모니터링

### 보안
- [ ] 의존성 CVE 스캔 완료
- [ ] CORS가 허용 출처만으로 구성
- [ ] 공개 엔드포인트에 속도 제한 활성화
- [ ] 인증 및 인가 검증 완료
- [ ] 보안 헤더 설정 (CSP, HSTS, X-Frame-Options)

### 운영
- [ ] 롤백 계획 문서화 및 테스트 완료
- [ ] 프로덕션 규모 데이터로 데이터베이스 마이그레이션 테스트
- [ ] 일반적인 장애 시나리오 런북 작성
- [ ] 온콜 로테이션 및 에스컬레이션 경로 정의
