# CLAUDE.md

디어메모리(Ujin Photo) 웨딩 스냅 업무용 정적 웹 페이지 저장소입니다. 빌드 도구·패키지 매니저 없이 HTML 파일 3개로 구성됩니다.

## 파일 구성

| 파일 | 용도 |
| --- | --- |
| `index.html` | 작가님 촬영 안내 페이지 (순수 HTML/CSS, 스크립트 없음) |
| `wedding_snap_contract.html` | 고객용 본식스냅 계약서 작성 폼 → Firestore 저장 + EmailJS 메일 발송 |
| `admin_dashboard.html` | 관리자 대시보드 (Firebase 이메일/비밀번호 로그인, 예약 조회·수정, html2pdf로 계약서 PDF 저장, EmailJS 발송) |

## 외부 의존성 (모두 CDN, 로컬 설치 없음)

- Firebase JS SDK (`gstatic.com/firebasejs`) — 계약서 폼은 11.6.1, 대시보드는 10.4.0 사용
- Firestore 경로: `artifacts/{appId}/public/data/reservations`
- EmailJS (`@emailjs/browser@3`) — 서비스 `service_vdp4qnl`, 템플릿 `template_mr76o7g`
- html2pdf.js 0.10.1 (대시보드), Pretendard / Noto 폰트

## 작업 규칙

- 각 페이지는 단일 HTML 파일 안에 CSS·JS를 인라인으로 둡니다. 별도 파일로 분리하지 마세요.
- UI 문구는 한국어로 작성합니다.
- Firestore 컬렉션 경로나 EmailJS 템플릿 파라미터를 바꾸면 계약서 폼과 대시보드 양쪽을 함께 수정해야 합니다.
- Firebase 설정값(apiKey 등)은 클라이언트 공개용이므로 그대로 두되, 새 비밀값(비밀번호, 서버 키)은 커밋하지 마세요.
- 실제 Firestore에 쓰기/이메일 발송이 일어나는 동작(계약서 제출, 대시보드 저장·발송 버튼)은 사용자 확인 없이 실행하지 마세요.

## 확인 방법

테스트·린트는 없습니다. 변경 후에는 로컬 서버로 페이지를 띄워 확인합니다 (`/preview` 스킬 참고).

```bash
python3 -m http.server 8000   # http://localhost:8000/index.html
```
