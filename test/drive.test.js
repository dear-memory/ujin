import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listContractFiles, DriveAuthError, DriveSetupError } from '../lib/calendar/drive.js';

function mockFetch(status, body) {
  globalThis.fetch = async () => new Response(JSON.stringify(body), { status });
}

test('Drive API가 꺼져 있으면 설정 오류', async () => {
  mockFetch(403, { error: { message: 'Google Drive API has not been used in project 1 before or it is disabled.', errors: [{ reason: 'accessNotConfigured' }] } });
  await assert.rejects(listContractFiles('t'), DriveSetupError);
});

test('권한 부족이면 다시 연결 필요', async () => {
  mockFetch(403, { error: { message: 'Request had insufficient authentication scopes.', errors: [{ reason: 'insufficientPermissions' }] } });
  await assert.rejects(listContractFiles('t'), DriveAuthError);
});

test('토큰 만료면 다시 연결 필요', async () => {
  mockFetch(401, { error: { message: 'Invalid Credentials' } });
  await assert.rejects(listContractFiles('t'), DriveAuthError);
});

test('DM으로 시작하는 PDF만 고름', async () => {
  mockFetch(200, { files: [{ id: '1', name: 'DM 홍길동.pdf' }, { id: '2', name: '계약서 DM.pdf' }] });
  assert.deepEqual((await listContractFiles('t')).map((f) => f.id), ['1']);
});
