const { cryptoKey } = require('../config/constants');
const CryptoJS = require("crypto-js");

const hasNumber = myString => /\d/.test(myString);

const hasUpperCase = myString => /[A-Z]/.test(myString);

const encrypt = myString => CryptoJS.AES.encrypt(myString, cryptoKey).toString();

const decrypt = myString => {
  const bytes  = CryptoJS.AES.decrypt(myString, cryptoKey);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedString;
}

module.exports = {
  hasNumber,
  hasUpperCase,
  encrypt,
  decrypt
}
