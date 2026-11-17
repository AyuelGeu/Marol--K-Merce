const nodemailer = require('nodemailer');
const path = require('path');

const brandLogoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'brand-logo.png');
const brandLogoAttachments = () => [{
  filename: 'brand-logo.png',
  path: brandLogoPath,
  cid: 'kmerce-brand-logo'
}];
const emailBrandHeader = '<div style="text-align:center;margin:0 0 8px">' +
  '<img src="cid:kmerce-brand-logo" alt="K-Merce" width="96" ' +
  'style="display:inline-block;width:96px;height:auto;border-radius:16px;box-shadow:0 8px 24px rgba(29,78,216,0.15)"></div>';

const emailWrapper = (content) => `
  <div style="margin:0;padding:32px 16px;background:linear-gradient(180deg,#eef4ff 0%,#f7f9fc 100%);font-family:Arial,Helvetica,sans-serif;color:#1f2a37;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #dfe7f5;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(15,23,42,0.08);">
      <div style="padding:28px 32px 18px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 58%,#60a5fa 100%);text-align:center;">
        ${emailBrandHeader}
      </div>
      <div style="padding:28px 32px 32px;">
        ${content}
      </div>
    </div>
  </div>`;

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_APP_PASS:", process.env.EMAIL_APP_PASS ? "Loaded" : "MISSING!");
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_APP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `Support <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your 2FA Login Code',
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: emailWrapper(`
        <h2 style="margin:0 0 16px;font-size:28px;color:#111827;line-height:1.2;">Your 2FA login code</h2>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">Your verification code is:</p>
        <div style="display:inline-block;padding:18px 24px;border-radius:14px;background:#eff6ff;border:1px solid #bfdbfe;font-size:32px;letter-spacing:4px;font-weight:700;color:#1d4ed8;margin:0 0 16px;">${otp}</div>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">This code will expire in 10 minutes. Use it to complete your sign-in securely.</p>
      `),
      attachments: brandLogoAttachments()
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send authentication email');
  }
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    await transporter.sendMail({
      from: `Support <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your password',
      text: `Use this link to reset your password. It expires in one hour: ${resetUrl}`,
      html: emailWrapper(`
        <h2 style="margin:0 0 16px;font-size:28px;color:#111827;line-height:1.2;">Reset your password</h2>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#374151;">Use the button below to reset your password. This link expires in one hour.</p>
        <div style="margin:0 0 20px;">
          <a href="${resetUrl}" style="display:inline-block;padding:14px 24px;border-radius:12px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#ffffff;text-decoration:none;font-weight:700;box-shadow:0 12px 22px rgba(37,99,235,0.22);">Reset password</a>
        </div>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#4b5563;">If you did not request this, you can safely ignore this email.</p>
      `),
      attachments: brandLogoAttachments()
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email', { cause: error });
  }
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const sendPaymentReceiptEmail = async (email, receipt) => {
  const formatAmount = (amount) => `KSh ${Number(amount).toLocaleString('en-KE')}`;
  const itemRows = receipt.items.map((item) => (
    `<tr><td>${escapeHtml(item.productName)}</td><td>${escapeHtml(item.storeName)}</td>` +
    `<td>${item.quantity}</td><td>${formatAmount(item.unitPrice)}</td>` +
    `<td>${formatAmount(item.unitPrice * item.quantity)}</td></tr>`
  )).join('');
  const itemText = receipt.items.map((item) =>
    `${item.productName} — ${item.storeName} — ${item.quantity} × ${formatAmount(item.unitPrice)} = ${formatAmount(item.unitPrice * item.quantity)}`
  ).join('\n');
  const transactionDate = new Date(receipt.transactionDate).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  const receiptNumber = receipt.receiptNumber || 'Not provided by M-Pesa';

  try {
    await transporter.sendMail({
      from: `K-Merce Payments <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Payment receipt ${receiptNumber} - K-Merce`,
      text: [
        `Hello ${receipt.customerName || 'Customer'},`,
        '',
        'Your payment has been confirmed.',
        `Payment reference: ${receipt.paymentId}`,
        `Order reference: ${receipt.orderId || 'Not available'}`,
        `M-Pesa receipt number: ${receiptNumber}`,
        `Payment date: ${transactionDate}`,
        `Payment method: M-Pesa`,
        `Phone number: ${receipt.phoneNumber || 'Not available'}`,
        `Total paid: ${formatAmount(receipt.amount)}`,
        '',
        'Items:',
        itemText,
        '',
        'Thank you for shopping with K-Merce.'
      ].join('\n'),
      html: emailWrapper(`
        <h2 style="margin:0 0 16px;font-size:28px;color:#111827;line-height:1.2;">Payment confirmed</h2>
        <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#374151;">Hello ${escapeHtml(receipt.customerName || 'Customer')}, your K-Merce payment was successful.</p>
        <table style="border-collapse:collapse;width:100%;margin:0 0 28px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
          <tbody>
            <tr><th align="left" style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Payment reference</th><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(receipt.paymentId)}</td></tr>
            <tr><th align="left" style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Order reference</th><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(receipt.orderId || 'Not available')}</td></tr>
            <tr><th align="left" style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">M-Pesa receipt</th><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(receiptNumber)}</td></tr>
            <tr><th align="left" style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Payment date</th><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(transactionDate)}</td></tr>
            <tr><th align="left" style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Payment method</th><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;">M-Pesa</td></tr>
            <tr><th align="left" style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Phone number</th><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;">${escapeHtml(receipt.phoneNumber || 'Not available')}</td></tr>
            <tr><th align="left" style="padding:12px 16px;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">Total paid</th><td style="padding:12px 16px;color:#0f172a;font-weight:700;">${formatAmount(receipt.amount)}</td></tr>
          </tbody>
        </table>
        <h3 style="margin:0 0 14px;font-size:22px;color:#111827;">Items purchased</h3>
        <table style="border-collapse:collapse;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
          <thead>
            <tr style="background:#eff6ff;">
              <th align="left" style="padding:12px 14px;color:#1e3a8a;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Product</th>
              <th align="left" style="padding:12px 14px;color:#1e3a8a;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Store</th>
              <th align="right" style="padding:12px 14px;color:#1e3a8a;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Qty</th>
              <th align="right" style="padding:12px 14px;color:#1e3a8a;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Unit price</th>
              <th align="right" style="padding:12px 14px;color:#1e3a8a;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#4b5563;">Thank you for shopping with K-Merce.</p>
      `),
      attachments: brandLogoAttachments()
    });
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    throw new Error('Could not send payment receipt email', { cause: error });
  }
};

module.exports = sendOTPEmail;
module.exports.sendOTPEmail = sendOTPEmail;
module.exports.sendPasswordResetEmail = sendPasswordResetEmail;
module.exports.sendPaymentReceiptEmail = sendPaymentReceiptEmail;