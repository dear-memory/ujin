const functions = require("firebase-functions/v1");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const crypto = require("crypto");
const path = require("path");

initializeApp();
const db = getFirestore();

const GMAIL_USER = defineSecret("GMAIL_USER");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");
const CONFIRM_SECRET = defineSecret("CONFIRM_SECRET");

const REGION = "asia-northeast3";
const OWNER_EMAIL = "dearmemory@kakao.com";

const FONT_REGULAR = path.join(__dirname, "fonts/Pretendard-Regular.ttf");
const FONT_BOLD = path.join(__dirname, "fonts/Pretendard-Bold.ttf");

const FIELD_ROWS = [
  ["신랑/신부", "namesAndPhone"],
  ["고객 이메일", "customerEmail"],
  ["본식 날짜", "weddingDate"],
  ["예식 시간/장소", "weddingLocationTime"],
  ["상품 구성", "snapPackage"],
  ["촬영 요청사항", "shootingRequests"],
  ["보정 요청사항", "editingRequests"],
  ["기타 요청사항", "otherRequests"],
  ["포트폴리오 동의", "portraitRights"],
  ["알게 되신 경로", "discoveryRoute"],
  ["SNS/블로그", "snsId"],
  ["제출 시각", "submittedAt"],
];

function mailer(user, pass) {
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

// 이메일 링크만으로 아무나 고객 PDF를 재발송시킬 수 없도록, 문서 id를 비밀키로 서명한 토큰을 사용한다.
function makeToken(docId, secret) {
  return crypto.createHmac("sha256", secret).update(docId).digest("hex").slice(0, 24);
}

function rowValue(data, key) {
  if (key === "discoveryRoute") {
    return [data.discoveryRoute, data.discoveryRouteOther].filter(Boolean).join(" ");
  }
  return data[key];
}

function summaryText(data) {
  return FIELD_ROWS.map(([label, key]) => `${label}: ${rowValue(data, key) || "-"}`).join("\n");
}

function summaryHtml(data) {
  const rows = FIELD_ROWS.map(
    ([label, key]) =>
      `<tr><td style="padding:6px 12px;color:#6b6357;white-space:nowrap;">${label}</td><td style="padding:6px 12px;color:#201c16;">${
        rowValue(data, key) || "-"
      }</td></tr>`
  ).join("");
  return `<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">${rows}</table>`;
}

function buildContractPdf(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("Regular", FONT_REGULAR);
    doc.registerFont("Bold", FONT_BOLD);

    doc.font("Bold").fontSize(20).text("본식스냅 계약 확인서", { align: "center" });
    doc.moveDown(1.5);

    FIELD_ROWS.forEach(([label, key]) => {
      doc.font("Bold").fontSize(11).fillColor("#a3792f").text(label);
      doc.font("Regular").fontSize(12).fillColor("#201c16").text(rowValue(data, key) || "-");
      doc.moveDown(0.7);
    });

    doc.end();
  });
}

exports.notifyOwnerOnReservation = functions
  .runWith({ secrets: [GMAIL_USER, GMAIL_APP_PASSWORD, CONFIRM_SECRET] })
  .region(REGION)
  .firestore.document("reservations/{reservationId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const { reservationId } = context.params;

    const token = makeToken(reservationId, CONFIRM_SECRET.value());
    const projectId = process.env.GCLOUD_PROJECT;
    const confirmUrl = `https://${REGION}-${projectId}.cloudfunctions.net/confirmAndSendPdf?docId=${encodeURIComponent(
      reservationId
    )}&token=${token}`;

    const transporter = mailer(GMAIL_USER.value(), GMAIL_APP_PASSWORD.value());
    await transporter.sendMail({
      from: `"디어메모리 예약 알림" <${GMAIL_USER.value()}>`,
      to: OWNER_EMAIL,
      subject: `[신규 계약 신청] ${data.namesAndPhone || "고객"} · ${data.weddingDate || ""}`,
      text: `새 본식스냅 계약 신청이 도착했습니다.\n\n${summaryText(data)}\n\n확인 및 고객에게 PDF 발송: ${confirmUrl}`,
      html: `
        <div style="font-family:sans-serif;line-height:1.7;">
          <h2 style="margin-bottom:4px;">새 본식스냅 계약 신청이 도착했습니다</h2>
          ${summaryHtml(data)}
          <p style="margin-top:24px;color:#6b6357;">아래 버튼을 누르면 고객 이메일(${
            data.customerEmail || "-"
          })로 계약 내용을 정리한 PDF가 자동 발송됩니다.</p>
          <p>
            <a href="${confirmUrl}" style="display:inline-block;background:#201c16;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
              확인 및 고객에게 PDF 발송
            </a>
          </p>
        </div>
      `,
    });
  });

exports.confirmAndSendPdf = functions
  .runWith({ secrets: [GMAIL_USER, GMAIL_APP_PASSWORD, CONFIRM_SECRET] })
  .region(REGION)
  .https.onRequest(async (req, res) => {
    const { docId, token } = req.query;
    if (!docId || !token) {
      res.status(400).send("잘못된 요청입니다.");
      return;
    }

    const expected = makeToken(String(docId), CONFIRM_SECRET.value());
    if (token !== expected) {
      res.status(403).send("유효하지 않은 링크입니다.");
      return;
    }

    const ref = db.collection("reservations").doc(String(docId));
    const doc = await ref.get();
    if (!doc.exists) {
      res.status(404).send("신청 내역을 찾을 수 없습니다.");
      return;
    }
    const data = doc.data();

    if (data.status === "confirmed") {
      res.send("<h2>이미 처리된 신청입니다.</h2><p>고객님께는 이미 PDF가 발송되었습니다.</p>");
      return;
    }
    if (!data.customerEmail) {
      res.status(400).send("고객 이메일 정보가 없어 발송할 수 없습니다.");
      return;
    }

    const pdfBuffer = await buildContractPdf(data);
    const transporter = mailer(GMAIL_USER.value(), GMAIL_APP_PASSWORD.value());

    await transporter.sendMail({
      from: `"디어메모리" <${GMAIL_USER.value()}>`,
      to: data.customerEmail,
      subject: "[디어메모리] 본식스냅 계약 확인서",
      text: "본식스냅 계약 신청이 확인되어, 계약 내용을 정리한 PDF를 첨부해 드립니다. 감사합니다.",
      html: "<p>안녕하세요, 디어메모리입니다.</p><p>본식스냅 계약 신청이 확인되어, 계약 내용을 정리한 PDF를 첨부해 드립니다. 감사합니다 :)</p>",
      attachments: [{ filename: "본식스냅_계약확인서.pdf", content: pdfBuffer }],
    });

    await ref.update({ status: "confirmed", confirmedAt: new Date().toISOString() });

    res.send(
      `<h2>발송 완료되었습니다.</h2><p>${data.customerEmail} 로 계약 확인서 PDF가 발송되었습니다.</p>`
    );
  });
