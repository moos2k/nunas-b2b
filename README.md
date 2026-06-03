# nunas-b2b

화장품 수출업을 위한 B2B 발주 웹사이트.

해외 바이어(기존 고객)가 상품 조회 → 발주서 제출 → 견적 확정까지 온라인으로 처리할 수 있도록 이메일·메신저 수작업을 디지털화합니다.

## 기술 스택

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage)
- **Deploy:** Vercel

## 개발 로드맵

- [x] Phase 0 — 첫 배포 (Next.js 프로젝트 생성 + Vercel 배포)
- [ ] Phase 1 — 상품 카탈로그 (상품 목록·상세 + 관리자 등록)
- [ ] Phase 2 — 인증/계정 (관리자·고객 로그인, 역할 구분)
- [ ] Phase 3 — 발주 (발주서 제출 + 상태 관리)
- [ ] Phase 4 — 문의 (고객 문의 + 관리자 답변)
- [ ] Phase 5 — 다국어·마무리 (영어/인도네시아어, SEO)

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기.
