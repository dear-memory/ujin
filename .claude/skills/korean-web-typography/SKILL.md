---
name: korean-web-typography
description: Korean (한글) web font pairings and color-palette combinations for Korean-language web pages, homepages and landing pages. Use together with frontend-design and theme-factory whenever a page's copy is in Korean (lang="ko"), or when choosing fonts/colors for this repo's pages (촬영 안내, 계약서, 관리자 대시보드 등).
---

# Korean Web Typography & Color Pairings

`frontend-design` decides the aesthetic direction and `theme-factory` gives Latin-font themes. This skill fills the Korean gap: which Hangul faces to load, how to pair them, and palettes that suit them. Choose from the brief, don't default to the first entry.

## Loading fonts

Google Fonts (verified): one `<link>` with only the weights used, plus `display=swap`.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@400;600&display=swap" rel="stylesheet">
```

Pretendard is not on Google Fonts; load it from jsDelivr:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
```

Always end the stack with system Korean fallbacks:
`"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", system-ui, sans-serif` /
`"Noto Serif KR", "AppleMyungjo", "Batang", serif`.

## Faces by role

| Role | Face | Character |
|---|---|---|
| Body sans | Pretendard | Neutral, modern, great at small sizes; default for UI/dashboards |
| Body sans | Noto Sans KR | Very complete weights; plainer than Pretendard |
| Body sans | IBM Plex Sans KR | Technical, slightly condensed; pairs with Plex Mono |
| Body sans | Gothic A1 | Wide, friendly geometric gothic |
| Serif (명조) | Noto Serif KR | Classic, many weights, safe for long text |
| Serif (명조) | Gowun Batang | Soft, handwritten warmth; weddings, lifestyle, letters |
| Serif (명조) | Nanum Myeongjo | Traditional book feel; editorial |
| Serif (명조) | Hahmlet | Contemporary high-contrast serif, variable weight; display |
| Display | Song Myung | Brush-like calligraphic serif; single headlines only |
| Display | Black Han Sans | Heavy poster gothic; events, sales, bold CTAs |
| Rounded | Gowun Dodum | Gentle rounded sans; kids, care, casual brands |

## Tested pairings

1. **Editorial wedding / photography** — Gowun Batang (headings) + Pretendard (body). Warm ivory paper, deep ink, one muted metallic or dusty accent.
2. **Classic trust (contracts, legal, 안내문)** — Noto Serif KR 600–700 (headings) + Noto Sans KR 400 (body). Keep body sans for readability at 15–16px.
3. **Modern product / SaaS / admin** — Pretendard only, contrast via weight (400/600/800) and size; tabular numerals via `font-variant-numeric: tabular-nums`.
4. **Tech / developer** — IBM Plex Sans KR + IBM Plex Mono for code/data.
5. **Magazine / luxury** — Hahmlet display (high weight, tight tracking) + Pretendard body.
6. **Heritage / 전통 / food** — Song Myung (hero headline only) + Nanum Myeongjo body.
7. **Bold event / promo** — Black Han Sans (headline) + Gothic A1 (body).
8. **Friendly / family / care** — Gowun Dodum (headings) + Pretendard (body).

## Palettes that fit Korean pages

Each: background / surface / ink / soft ink / accent / accent-soft. Check text contrast ≥ 4.5:1.

- **한지 Hanji** — `#f7f3ea` / `#ffffff` / `#26221c` / `#5e574b` / `#8c6a3b` / `#efe4cf` (serif-led, pairing 1/2/6)
- **청자 Celadon** — `#f3f6f3` / `#ffffff` / `#1f2a27` / `#51605b` / `#4f8a7b` / `#dcebe5` (calm, wellness, pairing 1/8)
- **단청 Dancheong** — `#fbf8f3` / `#ffffff` / `#1c1f2b` / `#4a4f63` / `#b33a2b` / `#2f6b5a` (heritage, event, pairing 6/7)
- **먹 Ink night** — `#15171c` / `#1e2128` / `#eceae4` / `#a7a59e` / `#c9a86a` / `#2b2f38` (dark luxury, pairing 5)
- **벚꽃 Blossom** — `#fdf7f7` / `#ffffff` / `#2e2326` / `#6d5a5f` / `#c7707f` / `#f6e1e4` (wedding, beauty, pairing 1/8)
- **한강 Han river** — `#f5f7fa` / `#ffffff` / `#17202e` / `#4b5566` / `#2f5fd0` / `#e3ebfb` (product/admin, pairing 3/4)

## Hangul typesetting rules

- `word-break: keep-all; overflow-wrap: anywhere;` on body text so words aren't split mid-syllable-block.
- Body 15–17px, `line-height` 1.65–1.8 (serif at the upper end); headings 1.25–1.35.
- Hangul needs little or negative tracking: body `letter-spacing: -0.01em`, large headings `-0.02em ~ -0.03em`. Never track out Hangul labels.
- Hangul has no italics; emphasize with weight or color, not `font-style: italic`.
- Keep measure around 30–40 Hangul characters (`max-width: 36em` works for 16px).
- Load at most two families and four weights total; Korean font files are large.
