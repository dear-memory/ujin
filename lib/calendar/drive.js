const API = 'https://www.googleapis.com/drive/v3';

// 토큰이 만료됐거나 Drive 권한을 받지 못함: 다시 연결하면 해결됩니다.
export class DriveAuthError extends Error {}
// Google Cloud 쪽 설정 문제: 다시 연결해도 해결되지 않습니다.
export class DriveSetupError extends Error {}

async function call(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.ok) return res;
  let reason = '';
  let message = '';
  try {
    const body = await res.json();
    reason = body.error?.errors?.[0]?.reason || body.error?.status || '';
    message = body.error?.message || '';
  } catch {
    /* 본문이 JSON이 아니면 상태 코드만 씁니다 */
  }
  if (res.status === 401) throw new DriveAuthError('Drive 연결이 만료되었습니다.');
  if (res.status === 403) {
    if (reason === 'accessNotConfigured' || /has not been used|is disabled/i.test(message)) {
      throw new DriveSetupError('Google Cloud 콘솔에서 Google Drive API가 꺼져 있습니다. 사용 설정한 뒤 몇 분 후 다시 시도해 주세요.');
    }
    if (reason === 'insufficientPermissions' || /insufficient/i.test(message)) {
      throw new DriveAuthError('Drive 읽기 권한을 받지 못했습니다. 다시 연결할 때 Drive 권한 체크박스를 꼭 선택해 주세요.');
    }
    throw new DriveSetupError(`Drive 접근이 거부되었습니다: ${message || reason || res.status}`);
  }
  throw new Error(`Drive 요청 실패 (${res.status}${message ? `: ${message}` : ''})`);
}

// 이름이 'DM'으로 시작하는 PDF를 모두 가져옵니다.
// Drive 검색의 name contains는 단어 앞부분 일치라서, 한 번 더 startsWith로 거릅니다.
export async function listContractFiles(token) {
  const q = "name contains 'DM' and mimeType = 'application/pdf' and trashed = false";
  const fields = 'nextPageToken, files(id, name, createdTime, modifiedTime, webViewLink, size)';
  const files = [];
  let pageToken = '';
  do {
    const params = new URLSearchParams({
      q,
      fields,
      pageSize: '200',
      orderBy: 'modifiedTime desc',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await call(`${API}/files?${params}`, token);
    const data = await res.json();
    files.push(...(data.files || []));
    pageToken = data.nextPageToken || '';
  } while (pageToken);
  return files.filter((f) => f.name.startsWith('DM'));
}

export async function downloadFile(fileId, token) {
  const res = await call(`${API}/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`, token);
  return new Uint8Array(await res.arrayBuffer());
}
