const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'TU_CORREO@gmail.com',
    pass: 'TU_APP_PASSWORD'
  }
});

function enviarCodigo(email, cb) {
  const otp = crypto.randomInt(100000, 999999).toString();
  const mailOptions = {
    from: 'SecureChat <TU_CORREO@gmail.com>',
    to: email,
    subject: 'Código de verificación',
    text: `Tu código es: ${otp}`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    cb(error, otp);
  });
}

module.exports = enviarCodigo;
