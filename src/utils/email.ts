import nodemailer from 'nodemailer'

// 네이버 SMTP로 메일 발송 (발송자: 관리자 이메일)
// 필요 환경변수: NAVER_SMTP_USER (예: jay-on@naver.com), NAVER_SMTP_PASS (네이버 앱 비밀번호)
function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.naver.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.NAVER_SMTP_USER,
      pass: process.env.NAVER_SMTP_PASS,
    },
  })
}

export async function sendMail(to: string, subject: string, html: string) {
  const user = process.env.NAVER_SMTP_USER
  if (!user || !process.env.NAVER_SMTP_PASS) {
    console.warn('SMTP 환경변수 미설정 — 메일 발송 건너뜀')
    return { skipped: true }
  }

  try {
    await getTransporter().sendMail({
      from: `"J.ON International" <${user}>`,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (err) {
    console.error('메일 발송 실패:', err)
    return { error: String(err) }
  }
}

export function approvalEmail(name: string) {
  return {
    subject: '[J.ON International] Your account has been approved / 가입이 승인되었습니다',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #191c1d;">
        <div style="background: #0F172A; padding: 24px; text-align: center;">
          <p style="color: #fff; font-size: 18px; font-weight: bold; margin: 0;">J.ON INTERNATIONAL</p>
        </div>
        <div style="padding: 32px 24px; border: 1px solid #E2E8F0; border-top: none;">
          <p style="font-size: 16px; font-weight: bold;">${name}님, 가입이 승인되었습니다.</p>
          <p style="font-size: 14px; line-height: 1.7; color: #45464d;">
            J.ON International 바이어 등록이 완료되었습니다.<br/>
            가입 시 입력하신 이메일과 비밀번호로 로그인하여 브랜드 카탈로그와 가격표를 확인하실 수 있습니다.
          </p>
          <p style="font-size: 14px; line-height: 1.7; color: #45464d;">
            Dear ${name},<br/>
            Your buyer account has been approved. You can now sign in with your email and password to browse our brand catalog and price lists.
          </p>
          <a href="https://nunas-b2b.vercel.app" style="display: inline-block; background: #0F172A; color: #fff; padding: 12px 32px; text-decoration: none; font-size: 13px; margin-top: 16px;">
            로그인 / Sign In
          </a>
        </div>
        <p style="font-size: 11px; color: #999; text-align: center; padding: 16px;">© J.ON International</p>
      </div>
    `,
  }
}

export function rejectionEmail(name: string) {
  return {
    subject: '[J.ON International] Regarding your registration / 가입 신청 결과 안내',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #191c1d;">
        <div style="background: #0F172A; padding: 24px; text-align: center;">
          <p style="color: #fff; font-size: 18px; font-weight: bold; margin: 0;">J.ON INTERNATIONAL</p>
        </div>
        <div style="padding: 32px 24px; border: 1px solid #E2E8F0; border-top: none;">
          <p style="font-size: 16px; font-weight: bold;">${name}님, 가입 신청 결과를 안내드립니다.</p>
          <p style="font-size: 14px; line-height: 1.7; color: #45464d;">
            안타깝게도 이번 가입 신청은 승인되지 않았습니다.<br/>
            추가 문의 사항이 있으시면 본 메일에 회신해 주시기 바랍니다.
          </p>
          <p style="font-size: 14px; line-height: 1.7; color: #45464d;">
            Dear ${name},<br/>
            Unfortunately, we are unable to approve your registration at this time.<br/>
            If you have any questions, please reply to this email.
          </p>
        </div>
        <p style="font-size: 11px; color: #999; text-align: center; padding: 16px;">© J.ON International</p>
      </div>
    `,
  }
}
