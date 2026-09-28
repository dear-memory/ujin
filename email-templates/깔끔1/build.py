F = "font-family:'Pretendard','Apple SD Gothic Neo','Malgun Gothic','맑은 고딕',sans-serif;"
S = "font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;"
INK, SOFT, LINE, SAGE, MUTE = "#1A1A1A", "#5C5C5A", "#E2E2E0", "#F2F2F0", "#8A8A87"


def circle(n):
    return (f'<table role="presentation" width="46" cellpadding="0" cellspacing="0" border="0" style="width:46px;"><tr>'
            f'<td width="44" height="44" align="center" valign="middle" style="width:44px; min-width:44px; height:44px; '
            f'border:1px solid #3A3A38; border-radius:23px; background-color:#FFFFFF; {S} font-weight:bold; '
            f'font-size:19px; line-height:44px; color:#000000;">{n}</td></tr></table>')


def step(n, eyebrow, title, body, last=False):
    pad = "0" if last else "44px"
    return f'''            <tr>
              <td width="46" valign="top" style="width:46px; min-width:46px; padding-bottom:{pad};">{circle(n)}</td>
              <td valign="top" style="padding:0 0 {pad} 14px; {F} word-break:keep-all;">
                <div style="{S} font-style:italic; font-weight:bold; font-size:16px; letter-spacing:1px; color:#000000;">{eyebrow}</div>
                <div style="margin-top:3px; font-weight:bold; font-size:18px; line-height:1.5; color:{INK};">{title}</div>
{body}
              </td>
            </tr>
'''


def p(text, top=8):
    return f'                <div style="margin-top:{top}px; font-size:15px; line-height:1.75; color:{SOFT};">{text}</div>\n'


def folder_row(n, name, value, strong):
    vc = INK if strong else MUTE
    vw = "bold" if strong else "normal"
    return (f'<tr><td width="30" style="width:30px; padding:12px 0; border-bottom:1px solid #EDEDEB; {S} font-weight:bold; font-size:18px; color:#000000;">{n}</td>'
            f'<td style="padding:12px 0; border-bottom:1px solid #EDEDEB; {F} font-size:15px; color:{INK};">{name}</td>'
            f'<td align="right" style="padding:12px 0; border-bottom:1px solid #EDEDEB; {F} font-size:14px; font-weight:{vw}; color:{vc}; white-space:nowrap;">{value}</td></tr>')


def chip(text, dark=False):
    bg, fg, bd = ("#1A1A1A", "#FFFFFF", "#1A1A1A") if dark else ("#FFFFFF", INK, "#D6D6D3")
    return (f'<td align="center" style="padding:6px 8px; border:1px solid {bd}; border-radius:4px; background-color:{bg}; '
            f'{F} font-size:12px; line-height:1.4; color:{fg}; white-space:nowrap;">{text}</td>')


ARROW = f'<td align="center" style="padding:0 4px; {S} font-size:14px; color:{MUTE};">&rarr;</td>'


def contact(en, ko):
    return (f'<td width="33%" align="center" style="padding:14px 4px; border:1px solid {LINE}; background-color:#FFFFFF;">'
            f'<div style="{S} font-style:italic; font-weight:bold; font-size:15px; letter-spacing:1px; color:#000000;">{en}</div>'
            f'<div style="margin-top:2px; {F} font-size:14px; font-weight:bold; color:{INK};">{ko}</div></td>')


body1 = p("첨부 파일의 압축을 풀면 아래 폴더가 들어 있어요.") + f'''                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px; border-top:1px solid #EDEDEB;">
                  {folder_row(1, "신랑신부 부부 앨범", "80장", True)}
                  {folder_row(2, "친정부모님 앨범", "비어 있음", False)}
                  {folder_row(3, "시댁부모님 앨범", "비어 있음", False)}
                </table>
'''

body2 = p('부부앨범에서 친정/시댁 부모님 앨범 폴더에 원하시는 사진을 <strong style="color:#000000;">각각 40장씩</strong> 넣어주시고, <strong style="color:#000000;">하나의 파일로 압축</strong>해서 보내주시면 되어요!') + f'''                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
                  <tr>{chip("부부앨범")}{ARROW}{chip("친정 40장<br>시댁 40장")}{ARROW}{chip("압축 1개", True)}</tr>
                </table>
'''

body3 = p("앨범에 인쇄되는 사진의 순서는 <strong style=\"color:#000000;\">'파일번호' 순</strong>이에요. 촬영된 시간 순서대로 나열해 두었고, 순서를 바꾸고 싶으시면 파일번호 넘버링만 수정해 주시면 됩니다~!") + f'''                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;">
                  <tr>{chip("0001")}{ARROW}{chip("0002")}{ARROW}{chip("0003")}</tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px; background-color:{SAGE}; border:1px solid #DEDEDC; border-radius:4px;">
                  <tr>
                    <td align="center" style="padding:18px 12px 16px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                        <tr>
                          <td width="92" height="64" align="center" valign="middle" style="width:92px; height:64px; background-color:#E8E8E6; border:1px solid #D6D6D3; {F} font-size:11px; color:#A0A09C;">빈 면</td>
                          <td width="92" height="64" align="center" valign="middle" style="width:92px; height:64px; background-color:#FFFFFF; border:1px solid #3A3A38;">
                            <div style="{S} font-weight:bold; font-size:22px; line-height:1; color:#000000;">1</div>
                            <div style="margin-top:3px; {F} font-size:11px; font-weight:bold; color:{INK};">첫 페이지</div>
                          </td>
                        </tr>
                      </table>
                      <div style="margin-top:10px; {F} font-size:14px; line-height:1.6; color:#333331;">앨범 페이지는 <strong>오른쪽부터</strong> 시작합니다</div>
                    </td>
                  </tr>
                </table>
'''

body4 = p("답장 주실 때, 택배 받으실 정보를 꼭 적어주세요!") + f'''                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px; border-collapse:collapse;">
                  <tr>{contact("Address", "주소")}{contact("Name", "성함")}{contact("Phone", "연락처")}</tr>
                </table>
'''

html = f'''<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FAFAF9; padding:40px 0;">
  <tr>
    <td align="center" style="padding:0 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; width:100%; background-color:#FFFFFF; border:1px solid {LINE}; border-radius:4px;">

        <!-- Hero -->
        <tr>
          <td align="center" style="padding:60px 28px 46px; border-bottom:1px solid {LINE};">
            <div style="{S} font-style:italic; font-weight:bold; font-size:16px; letter-spacing:5px; color:#000000; text-transform:uppercase;">Dear Memory</div>
            <div style="margin-top:18px; {F} font-weight:bold; font-size:28px; line-height:1.4; color:{INK}; word-break:keep-all;">보정본 전달 안내</div>
            <div style="margin-top:14px; {F} font-size:17px; line-height:1.7; color:{SOFT}; word-break:keep-all;">안녕하세요! 김소연 신부님 :)<br>오래 기다려주셔서 감사합니다!</div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:26px auto 0;">
              <tr><td width="44" height="1" style="width:44px; height:1px; font-size:0; line-height:0; background-color:#3A3A38;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- Intro note -->
        <tr>
          <td style="padding:40px 28px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{SAGE}; border:1px solid #DEDEDC; border-radius:4px;">
              <tr>
                <td style="padding:20px 22px; {F} word-break:keep-all;">
                  <div style="font-weight:bold; font-size:16px; line-height:1.5; color:#333331;">보정된 본식스냅 사진 전달드려요!</div>
                  <div style="margin-top:6px; font-size:15px; line-height:1.75; color:{SOFT};">과한 보정은 하지 않고 있어요. 보시고 추가로 보정하고 싶으신 부분이 있으시면 말씀 부탁드려요 :)</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Timeline -->
        <tr>
          <td style="padding:44px 22px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
{step("01", "Folders", "3개의 폴더를 확인해 주세요", body1)}{step("02", "Select", "부모님 앨범 사진 골라주세요", body2)}{step("03", "Order", "사진 순서를 확인해 주세요", body3)}{step("04", "Reply", "배송 정보와 함께 회신해 주세요", body4, last=True)}            </table>
          </td>
        </tr>

        <!-- Notice -->
        <tr>
          <td style="padding:40px 28px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFFFF; border:1px solid {LINE}; border-radius:4px;">
              <tr>
                <td style="padding:18px 22px; {F} word-break:keep-all;">
                  <div style="font-weight:bold; font-size:16px; line-height:1.5; color:#000000;">인쇄 전 꼭 확인해 주세요</div>
                  <div style="margin-top:6px; font-size:15px; line-height:1.75; color:{SOFT};">한번 인쇄된 앨범은 <strong style="color:#000000;">수정이 불가</strong>합니다.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Closing -->
        <tr>
          <td align="center" style="padding:44px 28px 44px; {F} font-size:16px; line-height:1.7; color:{INK};">감사합니다</td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:28px 28px 36px; border-top:1px solid {LINE};">
            <div style="{S} font-style:italic; font-size:14px; letter-spacing:3px; color:#000000;">Dear Memory</div>
            <div style="margin-top:8px; {F} font-size:14px; color:{SOFT};">문의사항은 언제든 편하게 연락 주세요</div>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top:18px;">
              <tr>
                <td align="center" bgcolor="#1A1A1A" style="background-color:#1A1A1A; border-radius:4px;">
                  <a href="https://pf.kakao.com/_ZsCyT" target="_blank" style="display:inline-block; padding:13px 32px; {F} font-size:14px; font-weight:bold; color:#FFFFFF; text-decoration:none;">카카오톡 문의하기</a>
                </td>
              </tr>
            </table>
            <div style="margin-top:10px; {F} font-size:12px; color:{MUTE};"><a href="https://pf.kakao.com/_ZsCyT" target="_blank" style="color:{MUTE}; text-decoration:underline;">https://pf.kakao.com/_ZsCyT</a></div>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
'''

open('daum-retouch-v3.html', 'w').write(html)
open('daum-retouch-v3-source.txt', 'w').write(html)
