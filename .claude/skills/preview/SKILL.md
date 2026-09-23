---
name: preview
description: 로컬 서버로 HTML 페이지(index.html, wedding_snap_contract.html, admin_dashboard.html)를 띄우고 Playwright로 스크린샷을 찍어 변경 사항을 눈으로 확인합니다. 페이지를 수정한 뒤 "확인해줘", "스크린샷", "미리보기" 요청 시 사용합니다.
---

# 페이지 미리보기

1. 저장소 루트에서 백그라운드로 정적 서버를 띄웁니다.
   ```bash
   python3 -m http.server 8000
   ```
2. Playwright(Chromium)로 페이지를 열어 스크린샷을 찍습니다. 원격 환경에서는 Chromium이 `/opt/pw-browsers`에 미리 설치되어 있으니 `playwright install`을 실행하지 마세요. 모바일 폭(390px)과 데스크톱 폭(1280px) 두 가지로 확인합니다.
   ```js
   const { chromium } = require('playwright');
   (async () => {
     const browser = await chromium.launch();
     for (const [name, width] of [['mobile', 390], ['desktop', 1280]]) {
       const page = await browser.newPage({ viewport: { width, height: 900 } });
       page.on('console', m => console.log(`[${name}] ${m.type()}: ${m.text()}`));
       await page.goto('http://localhost:8000/index.html', { waitUntil: 'networkidle' });
       await page.screenshot({ path: `preview-${name}.png`, fullPage: true });
     }
     await browser.close();
   })();
   ```
   스크립트와 스크린샷은 저장소가 아닌 스크래치 디렉터리에 저장합니다.
3. 콘솔 에러를 함께 확인합니다. CDN(Firebase, EmailJS 등)이 네트워크 정책으로 막혀 생기는 에러는 코드 문제가 아닐 수 있다고 구분해서 보고하세요.
4. 계약서 제출이나 대시보드의 저장·메일 발송 버튼은 실제 데이터를 쓰거나 메일을 보내므로 클릭하지 마세요.
5. 끝나면 서버 프로세스를 종료합니다.
