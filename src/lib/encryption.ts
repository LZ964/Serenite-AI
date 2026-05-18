import CryptoJS from 'crypto-js';

export const encryptData = (data: string, pin: string) => {
  return CryptoJS.AES.encrypt(data, pin).toString();
};

export const decryptData = (ciphertext: string, pin: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, pin);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) throw new Error("Invalid PIN");
    return originalText;
  } catch (error) {
    return null;
  }
};
