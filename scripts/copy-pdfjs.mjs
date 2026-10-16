// pdf.js 워커와 한글 cMap을 public/pdfjs 로 복사합니다. (dev/build 전에 자동 실행)
import { cpSync, mkdirSync } from 'node:fs';

const src = 'node_modules/pdfjs-dist';
const dest = 'public/pdfjs';
mkdirSync(dest, { recursive: true });
cpSync(`${src}/build/pdf.worker.min.mjs`, `${dest}/pdf.worker.min.mjs`);
cpSync(`${src}/cmaps`, `${dest}/cmaps`, { recursive: true });

// 이미지로 된 계약서 PDF를 읽기 위한 글자 인식(tesseract.js) 파일과 한국어 학습 데이터.
// CDN 대신 우리 사이트에서 내려받게 해서, 계약서 내용과 관련된 요청이 밖으로 나가지 않게 합니다.
const ocr = 'public/tesseract';
mkdirSync(ocr, { recursive: true });
cpSync('node_modules/tesseract.js/dist/worker.min.js', `${ocr}/worker.min.js`);
for (const f of ['tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js']) {
  cpSync(`node_modules/tesseract.js-core/${f}`, `${ocr}/${f}`);
}
cpSync('node_modules/@tesseract.js-data/kor/4.0.0_best_int/kor.traineddata.gz', `${ocr}/kor.traineddata.gz`);
