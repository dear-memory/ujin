import { createWorker } from 'tesseract.js';

// 글자 인식 파일은 scripts/copy-pdfjs.mjs 가 public/tesseract 에 복사해 둡니다.
// 모두 이 사이트에서 내려받고, 인식은 브라우저 안에서만 합니다. 계약서 내용은 밖으로 나가지 않습니다.
const BASE = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/tesseract`;

let workerPromise = null;

function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('kor', 1, {
      workerPath: `${BASE}/worker.min.js`,
      corePath: BASE,
      langPath: BASE,
      gzip: true,
      workerBlobURL: false,
    }).catch((e) => {
      workerPromise = null;
      throw e;
    });
  }
  return workerPromise;
}

// 그림(canvas)에서 글자를 읽습니다.
export async function recognize(canvas) {
  const worker = await getWorker();
  const { data } = await worker.recognize(canvas);
  return data.text || '';
}
