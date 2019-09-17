const CryptoJS = require("crypto-js");

exports.decrypt = function decrypt(msg, passphrase) {
    var plaintext = "";
    try {
        var bytes  = CryptoJS.AES.decrypt(msg, passphrase);
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

exports.encrypt = function encrypt(msg, passphrase) {
    var ciphertext = CryptoJS.AES.encrypt(msg.toString().trim(), passphrase);
    return ciphertext.toString();
}
