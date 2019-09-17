const login = require("facebook-chat-api");
const creds = require("../creds.js");

const CryptoJS = require("crypto-js");

console.log(creds.email);

var t_id = "100025752126036";
var key = "c0fd3da40cdc6c76f0f42b7c1658c4277a79f7e377d23b04bb25beded56380f7";

function decryptMsg(msg) {
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

// main
login({email: creds.email, password: creds.password}, (err, api) => {
    if(err) return console.error(err);

    api.getThreadHistory(t_id, 50, undefined, (err, history) => {
        if(err) return console.error(err);

        /*
            Since the timestamp is from a previous loaded message,
            that message will be included in this history so we can discard it unless it is the first load.
        */
        // if(timestamp != undefined) history.pop();

        /*
            Handle message history
        */
        for (var i = 0; i < history.length; i++) {
            console.log(decryptMsg(history[i].body.toString()));
        }

        // timestamp = history[0].timestamp;
    });

    api.listen((err, msg) => {
        if (err) return console.log(err);

        console.log(decryptMsg(msg.body.toString()));
    });
});
