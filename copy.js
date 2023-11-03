const nodemailer = require("nodemailer");
const { SMTP_MAIL, SMTP_PASSWORD } = process.env;
var otp = Math.floor(1000 + Math.random() * 9000);
const emailSender = async (to, subject, html) => {
  console.log("cred =====", SMTP_MAIL, SMTP_PASSWORD);
  try {
    const smtpTransport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      secure: false,
      requireTLS: true,
      auth: {
        user: SMTP_MAIL,
        pass: SMTP_PASSWORD,
      },
    });
    const mailOptions = {
      from: `pranav@gmail.com`,
      to: req.body.ownerEmail,
      subject,
      html,
    };
    let info = await smtpTransport.sendMail(mailOptions);
    console.log("mail send info ======", info.response);
    return info;
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  sendEmail: emailSender,
  sendOTP: async (to, subject) => {
    try {
      console.log("details ======>", to, subject);
      const html = `<h1>Your OTP is : - ${otp}</h1>`;
      const res = await emailSender(to, subject, html);
    } catch (err) {
      throw err;
    }
  },
};
