const nodemailer = require('nodemailer');

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
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`
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
      html: `<p>Use the link below to reset your password. It expires in one hour.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email', { cause: error });
  }
};

module.exports = sendOTPEmail;
module.exports.sendOTPEmail = sendOTPEmail;
module.exports.sendPasswordResetEmail = sendPasswordResetEmail;