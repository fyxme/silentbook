const encrypter = require("./encrypter.js");

exports.receive_message = function(msg_obj, passphrase) {
    // console.log(history[i]);
    var uid = msg_obj.senderID;
    if (msg_obj.body) {
        var msg = encrypter.decrypt(msg_obj.body.toString(), passphrase);
        var e = msg !== msg_obj.body? '[e] ' : '';
        if (uid === my_id)
            console.log('\x1b[31m%s | \033[1m%s\033[0;0m%s\x1b[0m', 'You ', e, msg);
        else
            console.log('\x1b[32m%s | \033[1m%s\033[0;0m%s\x1b[0m', 'Them', e, msg);
    }    
}