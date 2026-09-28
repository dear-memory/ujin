F = "font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic','맑은 고딕',sans-serif;"
SERIF = "font-family:Georgia,'Times New Roman','Noto Serif KR','Nanum Myeongjo',serif;"
BG, INK, GOLD, SOFT, LINE, LINE2, BOX, MUTE = "#FAF8F5", "#322A1B", "#8F7A56", "#6E5C3D", "#EBE3D5", "#F5F1EA", "#DDD1BD", "#A8987E"


def item(title, body):
    return f'''                <tr><td style="padding-bottom:12px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{BG}; border:1px solid {LINE}; border-radius:16px;">
                    <tr><td style="padding:16px 18px; {F} word-break:keep-all;">
                      <div style="font-size:15px; font-weight:bold; line-height:1.5; color:{INK};">{title}</div>
                      <div style="margin-top:6px; font-size:14px; line-height:1.7; color:{SOFT};">{body}</div>
                    </td></tr>
                  </table>
                </td></tr>
'''


def folder(n, name, value, strong):
    c, w = (INK, "bold") if strong else (MUTE, "normal")
    return (f'<tr><td style="padding:7px 0; border-top:1px solid {LINE}; {F} font-size:14px; color:{INK};">'
            f'<span style="{SERIF} font-weight:bold; color:{GOLD};">{n}</span>&nbsp;&nbsp;{name}</td>'
            f'<td align="right" style="padding:7px 0; border-top:1px solid {LINE}; {F} font-size:13px; font-weight:{w}; color:{c}; white-space:nowrap;">{value}</td></tr>')


def check(text):
    return f'''                <tr><td style="padding-bottom:10px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{BG}; border:1px solid {BOX}; border-radius:16px;">
                    <tr>
                      <td width="22" valign="top" style="width:22px; padding:15px 0 15px 16px;">
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="20" height="20" style="width:20px; height:20px; border:1px solid {BOX}; border-radius:6px; background-color:{LINE2}; font-size:0; line-height:0;">&nbsp;</td></tr></table>
                      </td>
                      <td style="padding:14px 16px 14px 12px; {F} font-size:14px; font-weight:bold; line-height:1.6; color:{INK}; word-break:keep-all;"><span style="color:#D64545; white-space:nowrap;">[필수]</span> {text}</td>
                    </tr>
                  </table>
                </td></tr>
'''


folders = f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:4px;">
                        {folder(1, "신랑신부 부부 앨범", "80장", True)}
                        {folder(2, "친정부모님 앨범", "비어 있음", False)}
                        {folder(3, "시댁부모님 앨범", "비어 있음", False)}
                      </table>'''

ITEM3 = item("3. 사진 순서", f'앨범에 인쇄되는 순서는 <strong style="color:{INK};">&#39;파일번호&#39; 순</strong>이에요. 촬영된 시간 순서대로 나열해 두었고, 순서를 바꾸고 싶으시면 파일번호 넘버링만 수정해 주시면 됩니다~!')

html = f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{BG};">
  <tr>
    <td align="center" style="padding:0 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; width:100%;">

        <!-- Header -->
        <tr>
          <td align="center" style="padding:36px 0 26px; border-bottom:1px solid {LINE};">
            <div style="{F} font-size:11px; font-weight:bold; letter-spacing:4px; color:{GOLD}; text-transform:uppercase;">Wedding Photography</div>
            <div style="margin-top:6px; {SERIF} font-size:28px; font-weight:bold; letter-spacing:6px; color:{INK};">DEAR MEMORY</div>
            <div style="margin-top:10px; {F} font-size:15px; font-weight:bold; color:{INK};">본식스냅 보정본 전달</div>
            <div style="margin-top:2px; {F} font-size:13px; line-height:1.6; color:{GOLD}; word-break:keep-all;">안녕하세요! 김소연 신부님 :) 오래 기다려주셔서 감사합니다!</div>
          </td>
        </tr>

        <!-- Title -->
        <tr>
          <td align="center" style="padding:40px 8px 28px; word-break:keep-all;">
            <div style="{SERIF} font-size:25px; font-weight:bold; line-height:1.45; color:{INK};">보정된 본식스냅 사진<br>전달드려요</div>
            <div style="margin-top:12px; {F} font-size:14px; line-height:1.75; color:{SOFT};">과한 보정은 하지 않고 있어요.</div>
            <div style="{F} font-size:14px; line-height:1.75; color:{GOLD};">보시고 추가로 보정하고 싶으신 부분이 있으시면<br>말씀 부탁드려요 :)</div>
          </td>
        </tr>

        <!-- Card 1 -->
        <tr>
          <td>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF; border:1px solid {LINE}; border-radius:24px;">
              <tr>
                <td style="padding:24px 20px 12px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid {LINE2}; margin-bottom:16px;">
                    <tr>
                      <td style="padding-bottom:12px; {F} font-size:17px; font-weight:bold; color:{INK};">앨범 셀렉 안내</td>
                      <td align="right" style="padding-bottom:12px; {F} font-size:12px; color:{GOLD}; white-space:nowrap;">첨부 파일 기준</td>
                    </tr>
                  </table>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
{item("1. 압축을 풀면 3개의 폴더가 있어요", folders)}{item("2. 부모님 앨범 사진 고르기", f'부부앨범에서 친정/시댁 부모님 앨범 폴더에 원하시는 사진을 <strong style="color:{INK};">각각 40장씩</strong> 넣어주시고, <strong style="color:{INK};">하나의 파일로 압축</strong>해서 보내주시면 되어요!')}{ITEM3}{item("4. 앨범 페이지", f'앨범 페이지는 <strong style="color:{INK};">오른쪽부터</strong> 시작합니다.')}                  </table>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px; background-color:#FCFBF9; border:1px solid {LINE}; border-radius:16px;">
                    <tr><td style="padding:16px 18px; {F} font-size:14px; line-height:1.7; color:{SOFT}; word-break:keep-all;">
                      <div style="font-weight:bold; color:{INK};">인쇄 전 꼭 확인해 주세요:</div>
                      <div>&bull; 답장 주실 때 택배 받으실 <strong style="color:{INK};">주소 / 성함 / 연락처</strong>를 적어주세요</div>
                      <div>&bull; 한번 인쇄된 앨범은 <strong style="color:{INK};">수정이 불가</strong>합니다</div>
                    </td></tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Card 2 -->
        <tr>
          <td style="padding-top:20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF; border:1px solid {LINE}; border-radius:24px;">
              <tr>
                <td style="padding:24px 20px;">
                  <div style="padding-bottom:12px; margin-bottom:16px; border-bottom:1px solid {LINE2}; {F} font-size:17px; font-weight:bold; color:{INK};">회신 전 체크리스트</div>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
{check("친정/시댁 부모님 폴더에 각각 40장씩 넣었어요")}{check("두 폴더를 하나의 파일로 압축했어요")}{check("택배 받으실 주소 / 성함 / 연락처를 적었어요")}                  </table>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
                    <tr>
                      <td align="center" bgcolor="{INK}" style="background-color:{INK}; border-radius:16px;">
                        <a href="https://pf.kakao.com/_ZsCyT" target="_blank" style="display:block; padding:18px 12px; {F} font-size:16px; font-weight:bold; color:{BG}; text-decoration:none;">카카오톡으로 문의하기 &rarr;</a>
                      </td>
                    </tr>
                  </table>
                  <div style="margin-top:10px; text-align:center; {F} font-size:12px; color:{MUTE};"><a href="https://pf.kakao.com/_ZsCyT" target="_blank" style="color:{MUTE}; text-decoration:underline;">https://pf.kakao.com/_ZsCyT</a></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Closing -->
        <tr>
          <td align="center" style="padding:36px 0 0; {SERIF} font-size:18px; font-weight:bold; color:{INK};">감사합니다</td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid {LINE};">
              <tr>
                <td align="center" style="padding-top:28px;">
                  <div style="{SERIF} font-size:15px; font-weight:bold; letter-spacing:4px; color:{INK};">DEAR MEMORY</div>
                  <div style="margin-top:6px; {F} font-size:13px; font-weight:bold; color:{INK};">본식스냅 스튜디오 디어메모리</div>
                  <div style="margin-top:4px; {F} font-size:11px; color:{MUTE};">Copyright &copy; 2026 DEAR MEMORY. All rights reserved.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
'''

open('daum-retouch-warm.html', 'w').write(html)
open('daum-retouch-warm-source.txt', 'w').write(html)
