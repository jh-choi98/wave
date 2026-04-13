# Phase 0: Docs Update

## 사전 준비

먼저 아래 문서들을 반드시 읽고 프로젝트의 전체 아키텍처와 설계 의도를 완전히 이해하라:

- `/docs/prd.md`
- `/docs/flow.md`
- `/docs/data-schema.md`
- `/docs/code-architecture.md`
- `/docs/adr.md`
- `/docs/testing.md`

## 작업 내용

이번 MVP 구현에서 확정된 추가 기술 결정들을 문서에 반영한다. 기존 내용을 수정하되 전체 구조는 유지하라.

### 1. `/docs/adr.md` — ADR 3개 추가

**ADR-015: Mock Bible Data for Development**

- Decision: 개발 단계에서는 scripture.api.bible 대신 mock/static JSON으로 구현. `lib/bible/client.ts`를 인터페이스로 추상화해서 나중에 실제 API로 교체 가능하게 한다.
- Why: API 키 발급 및 한국어 번역 존재 여부가 미검증. mock으로 전체 흐름을 먼저 완성하고, 실제 API 연동은 별도 task로 분리.
- Trade-off: 실 데이터 없이 개발하므로 API 응답 구조가 다를 수 있음. 인터페이스 추상화로 리스크 최소화.

**ADR-016: PostHog/Sentry Deferred**

- Decision: PostHog과 Sentry는 MVP task에서 제외. 핵심 기능(로그인→본문→묵상→기록) 완성 후 별도 task로 추가.
- Why: phase 수가 늘어나면 실행 시간과 실패 확률 증가. observability는 핵심 기능 동작 확인 후에 붙여도 늦지 않음.

**ADR-017: Runtime-Only Env Validation**

- Decision: 환경변수 검증은 런타임에만 수행. 빌드 타임에는 체크하지 않음.
- Why: CI/CD와 phase별 AC 검증(`npm run build`, `npm test`)이 실제 DB/OAuth 크레덴셜 없이도 통과해야 함. 런타임 시작 시에만 필수 변수를 체크하고, 없으면 즉시 에러.

### 2. `/docs/code-architecture.md` — 변경 반영

- **Stack 섹션**: PostHog, Sentry를 제거하고 "deferred to separate task"로 표시.
- **root layout.tsx 설명**: PostHog/Sentry 초기화 제거. Pretendard + HTML lang="ko"만 남김.
- **Environment Variables 섹션**: PostHog/Sentry 관련 변수 제거.
  - 제거 대상: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `SENTRY_DSN`
- **Bible Data Flow 섹션**: mock 전략 반영. "scripture.api.bible" 대신 "BibleClient interface + MockBibleClient (dev) / ApiBibleClient (prod)" 구조로 업데이트.

### 3. `/docs/data-schema.md` — mock 데이터 명시

- bible_cache 테이블 설명에 추가: "MVP 단계에서는 mock 데이터를 사용하므로 이 테이블에 직접 seed 데이터를 삽입할 수 있다. 실제 API 연동 시 cache-first 패턴으로 전환."

## Acceptance Criteria

```bash
# 문서 파일들이 존재하고 변경되었는지 확인
test -f docs/adr.md && test -f docs/code-architecture.md && test -f docs/data-schema.md && echo "PASS" || echo "FAIL"
```

## AC 검증 방법

위 AC 커맨드를 실행하라. 모두 통과하면 `/tasks/0-mvp/index.json`의 phase 0 status를 `"completed"`로 변경하라.
수정 3회 이상 시도해도 실패하면 status를 `"error"`로 변경하고, 에러 내용을 index.json의 해당 phase에 `"error_message"` 필드로 기록하라.

## 주의사항

- 기존 ADR 번호(001~014)를 변경하지 마라.
- 기존 문서 구조와 마크다운 포맷을 유지하라.
- 코드를 작성하지 마라. 이 phase는 문서 업데이트만 수행한다.
