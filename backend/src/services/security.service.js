const SHA256 = require("crypto-js/sha256");
const hmacSHA512 = require("crypto-js/hmac-sha512");
const Base64 = require("crypto-js/enc-base64");

const cryptPassword = (password) => {
  const sha = SHA256(password);

  const hmacDigest = Base64.stringify(
    hmacSHA512(sha, process.env.PRIVATE_KEY)
  );

  return hmacDigest;
};

const comparePassword = (password, encryptedPassword) => {
  return cryptPassword(password) === encryptedPassword;
};

module.exports = {
  cryptPassword,
  comparePassword
};
