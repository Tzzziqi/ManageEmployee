const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "093eaffb16cd3a",
      pass: "30b4a27a69a6ad"
    }
  });

  await transporter.sendMail({
    from: '"HR Department" <hr@yourcompany.com>',
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;