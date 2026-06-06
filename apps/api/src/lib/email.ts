import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

function getTransporter() {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;

  if (smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
    });
    console.log('📧 Email configured with SMTP');
  } else {
    // Console fallback
    transporter = nodemailer.createTransport({ jsonTransport: true });
    console.log('📧 Email configured in console mode (no SMTP credentials)');
  }

  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const transport = getTransporter();
  const from = process.env.SMTP_FROM || 'VendorBridge AI <noreply@vendorbridge.in>';

  try {
    const info = await transport.sendMail({ from, ...options });

    if (!process.env.SMTP_USER) {
      console.log('\n📧 Email (console mode):');
      console.log(`   To: ${options.to}`);
      console.log(`   Subject: ${options.subject}`);
      console.log(`   Preview: ${options.html.substring(0, 200)}...\n`);
    }

    return info;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw error;
  }
}

export async function sendApprovalEmail(to: string, prNumber: string, title: string, amount: string) {
  return sendEmail({
    to,
    subject: `[VendorBridge] Approval Required: ${prNumber}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
        <h1 style="color: #38bdf8; margin: 0 0 8px;">VendorBridge AI</h1>
        <p style="color: #94a3b8; margin: 0 0 24px;">Procurement Intelligence Platform</p>
        <div style="background: #1e293b; border-radius: 8px; padding: 24px; border-left: 4px solid #f59e0b;">
          <h2 style="color: #f59e0b; margin: 0 0 16px;">⚡ Approval Required</h2>
          <p style="margin: 0 0 8px;"><strong>PR Number:</strong> ${prNumber}</p>
          <p style="margin: 0 0 8px;"><strong>Title:</strong> ${title}</p>
          <p style="margin: 0 0 16px;"><strong>Amount:</strong> ₹${amount}</p>
          <a href="${process.env.WEB_URL || 'http://localhost:3000'}/approvals" 
             style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Review & Approve →
          </a>
        </div>
        <p style="color: #64748b; margin: 24px 0 0; font-size: 12px;">This is an automated notification from VendorBridge AI.</p>
      </div>
    `,
  });
}

export async function sendPOEmail(to: string, poNumber: string, vendorName: string, total: string) {
  return sendEmail({
    to,
    subject: `[VendorBridge] Purchase Order ${poNumber}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
        <h1 style="color: #38bdf8; margin: 0 0 8px;">VendorBridge AI</h1>
        <p style="color: #94a3b8; margin: 0 0 24px;">Procurement Intelligence Platform</p>
        <div style="background: #1e293b; border-radius: 8px; padding: 24px; border-left: 4px solid #10b981;">
          <h2 style="color: #10b981; margin: 0 0 16px;">📦 Purchase Order Issued</h2>
          <p style="margin: 0 0 8px;"><strong>PO Number:</strong> ${poNumber}</p>
          <p style="margin: 0 0 8px;"><strong>Vendor:</strong> ${vendorName}</p>
          <p style="margin: 0 0 16px;"><strong>Total:</strong> ₹${total}</p>
          <a href="${process.env.WEB_URL || 'http://localhost:3000'}/purchase-orders" 
             style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Purchase Order →
          </a>
        </div>
      </div>
    `,
  });
}
