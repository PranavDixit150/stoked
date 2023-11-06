const nodemailer = require("nodemailer");
const { SMTP_MAIL, SMTP_PASSWORD } = process.env;

const emailSender = async (to, subject, html) => {
  console.log("cred =====", SMTP_MAIL, SMTP_PASSWORD);
  try {
    const smtpTransport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "rkdeveloper011@gmail.com",
        pass: "zcupzlskajwftptc",
      },
    });
    const mailOptions = {
      from: `pranavcql@gmail.com`,
      to,
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
      var otp = Math.floor(1000 + Math.random() * 9000);
      console.log("details ======>", to, subject);
      console.log(otp,">>>>>>>>>>>>>>>>>otp>>>>>>>>>>>>>>>>>>")
      const html = `<h1>Your OTP is : - ${otp}</h1>`;
      const res = await emailSender(to, subject, html);
      return otp;
    } catch (err) {
      throw err;
    }
  },
};
