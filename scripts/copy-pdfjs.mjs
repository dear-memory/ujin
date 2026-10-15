// pdf.js 워커와 한글 cMap을 public/pdfjs 로 복사합니다. (dev/build 전에 자동 실행)
import { cpSync, mkdirSync } from 'node:fs';

const src = 'node_modules/pdfjs-dist';
const dest = 'public/pdfjs';
mkdirSync(dest, { recursive: true });
cpSync(`${src}/build/pdf.worker.min.mjs`, `${dest}/pdf.worker.min.mjs`);
cpSync(`${src}/cmaps`, `${dest}/cmaps`, { recursive: true });
