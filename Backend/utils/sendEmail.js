const nodemailer = require('nodemailer');
const path = require('path');

const brandLogoPath = path.join(__dirname, '..', '..', 'frontend', 'public', 'brand-logo.png');
const brandLogoAttachments = () => [{
  filename: 'brand-logo.png',
  path: brandLogoPath,
  cid: 'kmerce-brand-logo'
}];
const emailBrandHeader = '<div style="text-align:center;margin:0 0 24px">' +
  '<img src="cid:kmerce-brand-logo" alt="K-Merce" width="96" ' +
  'style="display:inline-block;width:96px;height:auto"></div>';

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
      html: `${emailBrandHeader}<h2>Your 2FA login code</h2>` +
        `<p>Your verification code is <strong>${otp}</strong>.</p>` +
        '<p>It will expire in 10 minutes.</p>',
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
      html: `${emailBrandHeader}<p>Use the link below to reset your password. It expires in one hour.</p>` +
        `<p><a href="${resetUrl}">Reset password</a></p>` +
        '<p>If you did not request this, you can ignore this email.</p>',
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
      html: `<div style="font-family:Arial,sans-serif;color:#20283a;max-width:680px;margin:auto">` +
        emailBrandHeader +
        `<h1 style="color:#273b54">Payment confirmed</h1>` +
        `<p>Hello ${escapeHtml(receipt.customerName || 'Customer')}, your K-Merce payment was successful.</p>` +
        `<table style="border-collapse:collapse;width:100%;margin:20px 0">` +
        `<tbody>` +
        `<tr><th align="left">Payment reference</th><td>${escapeHtml(receipt.paymentId)}</td></tr>` +
        `<tr><th align="left">Order reference</th><td>${escapeHtml(receipt.orderId || 'Not available')}</td></tr>` +
        `<tr><th align="left">M-Pesa receipt</th><td>${escapeHtml(receiptNumber)}</td></tr>` +
        `<tr><th align="left">Payment date</th><td>${escapeHtml(transactionDate)}</td></tr>` +
        `<tr><th align="left">Payment method</th><td>M-Pesa</td></tr>` +
        `<tr><th align="left">Phone number</th><td>${escapeHtml(receipt.phoneNumber || 'Not available')}</td></tr>` +
        `<tr><th align="left">Total paid</th><td><strong>${formatAmount(receipt.amount)}</strong></td></tr>` +
        `</tbody></table>` +
        `<h2>Items purchased</h2><table style="border-collapse:collapse;width:100%">` +
        `<thead><tr><th align="left">Product</th><th align="left">Store</th><th align="right">Qty</th>` +
        `<th align="right">Unit price</th><th align="right">Subtotal</th></tr></thead>` +
        `<tbody>${itemRows}</tbody></table>` +
        `<p style="margin-top:24px">Thank you for shopping with K-Merce.</p></div>`,
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