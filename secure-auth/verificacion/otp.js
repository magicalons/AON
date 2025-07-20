const crypto = require('crypto');

function generarOTP(tel) {
  const otp = crypto.randomInt(100000, 999999).toString();
  console.log(`(Simulado) Enviar OTP ${otp} al teléfono ${tel}`);
  return otp;
}

module.exports = generarOTP;
