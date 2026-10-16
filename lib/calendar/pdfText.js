import * as pdfjs from 'pdfjs-dist';

// pdf.js가 쪽을 그릴 때 쓰는 최신 기능(Map.getOrInsertComputed)이 없는 브라우저를 위한 보충
for (const C of [Map, WeakMap]) {
  if (!C.prototype.getOrInsertComputed) {
    C.prototype.getOrInsertComputed = function (key, fn) {
      if (!this.has(key)) this.set(key, fn(key));
      return this.get(key);
    };
  }
  if (!C.prototype.getOrInsert) {
    C.prototype.getOrInsert = function (key, value) {
      if (!this.has(key)) this.set(key, value);
      return this.get(key);
    };
  }
}

// 워커와 한글 cMap은 scripts/copy-pdfjs.mjs 가 public/pdfjs 에 복사해 둡니다.
const BASE = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/pdfjs`;
pdfjs.GlobalWorkerOptions.workerSrc = `${BASE}/pdf.worker.min.mjs`;

// 이미지로 된 PDF에서 글자 인식을 할 최대 쪽 수 (본식 날짜는 앞쪽에 있습니다)
const OCR_MAX_PAGES = 3;

// PDF의 글자를 줄 단위로 이어 붙여 돌려줍니다.
// 글자가 거의 없으면(화면을 사진처럼 저장한 PDF) 쪽을 그림으로 그려 글자 인식(OCR)으로 읽습니다.
export async function extractText(data, { onOcr } = {}) {
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
    if (lines.join('').replace(/\s/g, '').length < 20) {
      const { recognize } = await import('./ocr');
      const pages = [];
      for (let p = 1; p <= Math.min(doc.numPages, OCR_MAX_PAGES); p++) {
        onOcr?.(p, Math.min(doc.numPages, OCR_MAX_PAGES));
        pages.push(await recognize(await renderPage(doc, p)));
      }
      return pages.join('\n');
    }
  } finally {
    task.destroy();
  }
  return lines.join('\n').replace(/[ \t]+\n/g, '\n');
}

// 쪽을 글자 인식에 알맞은 크기(가로 약 2000px)의 그림으로 그립니다.
async function renderPage(doc, p) {
  const page = await doc.getPage(p);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: Math.min(4, 2000 / base.width) });
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  return canvas;
}
