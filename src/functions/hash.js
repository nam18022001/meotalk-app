import CryptoJS from 'crypto-js';
function encryptAES(message, key) {
  const encryptedMessage = CryptoJS.AES.encrypt(message, key);
  return encryptedMessage.toString();
}

function decryptAES(encryptedMessage, key) {
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedMessage, key);
    const decryptedMessage = CryptoJS.enc.Utf8.stringify(decryptedBytes).toString();
    if (typeof decryptedMessage === 'string' && decryptedMessage.length > 0) {
      return decryptedMessage;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

function encryptAESObject(value, key) {
  const message = JSON.stringify(value);
  const encrypted = CryptoJS.AES.encrypt(message, key).toString();
  return encrypted;
}

function decryptAESObject(message, key) {
  const decryptedMessage = CryptoJS.AES.decrypt(message, key);
  const v = decryptedMessage.toString(CryptoJS.enc.Utf8);
  const decryptedObject = JSON.parse(v);

  return decryptedObject;
}
export { encryptAES, decryptAES, encryptAESObject, decryptAESObject };
