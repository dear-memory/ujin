import * as pdfjs from 'pdfjs-dist';

// 워커와 한글 cMap은 scripts/copy-pdfjs.mjs 가 public/pdfjs 에 복사해 둡니다.
const BASE = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/pdfjs`;
pdfjs.GlobalWorkerOptions.workerSrc = `${BASE}/pdf.worker.min.mjs`;

// PDF의 글자를 줄 단위로 이어 붙여 돌려줍니다. 스캔본(이미지)이면 빈 문자열입니다.
export async function extractText(data) {
  const task = pdfjs.getDocument({ data, cMapUrl: `${BASE}/cmaps/`, cMapPacked: true });
  const doc = await task.promise;
  const lines = [];
  try {
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      let line = '';
      let lastY = null;
      for (const item of content.items) {
        if (!('str' in item)) continue;
        const y = Math.round(item.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 3) {
          lines.push(line.trim());
          line = '';
        }
        line += item.str + (item.hasEOL ? '\n' : ' ');
        lastY = y;
      }
      if (line.trim()) lines.push(line.trim());
    }
  } finally {
    task.destroy();
  }
  return lines.join('\n').replace(/[ \t]+\n/g, '\n');
}
