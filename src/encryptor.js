const CryptoJS = require("crypto-js");

exports.decryptMsg = function decryptMsg(msg, key) {
    var plaintext = "";
    try {
        var bytes  = CryptoJS.AES.decrypt(msg, key);
        plaintext = bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return msg;
    }

    // if the deciphered message returned nothing,
    // we probably couldn't decrypt it so return the message itself
    if (msg.trim() !== "" && plaintext.trim() === "")
        return msg;

    return plaintext;
}

exports.encryptMsg = function encryptMsg(msg, key) {
    var ciphertext = CryptoJS.AES.encrypt(msg.toString().trim(), key);
    return ciphertext.toString();
}
