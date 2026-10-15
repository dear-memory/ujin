const API = 'https://www.googleapis.com/drive/v3';

export class DriveAuthError extends Error {}

async function call(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401 || res.status === 403) {
    throw new DriveAuthError(`Drive 접근이 거부되었습니다 (${res.status})`);
  }
  if (!res.ok) throw new Error(`Drive 요청 실패 (${res.status})`);
  return res;
}

// 이름이 'DM'으로 시작하는 PDF를 모두 가져옵니다.
// Drive 검색의 name contains는 단어 앞부분 일치라서, 한 번 더 startsWith로 거릅니다.
export async function listContractFiles(token) {
  const q = "name contains 'DM' and mimeType = 'application/pdf' and trashed = false";
  const fields = 'nextPageToken, files(id, name, modifiedTime, webViewLink, size)';
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
