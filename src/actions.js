const encrypter = require("./encrypter.js");
const events = require("./events.js");

exports.send_message = function send_message(api, thread_id, msg, passphrase) {
    console.log("\033[F\r\x1b[K\033[F");
    
    // encrypt message and then send it
    var ciphertext = encrypter.encrypt(msg, passphrase);
    api.sendMessage(ciphertext, thread_id, (err, m) => {
        if (err) return console.log(err);
    });
};

exports.list_threads = function list_threads(api, passphrase) {
    function process_list_threads(err, t_arr, passphrase) {
        var uidToName = {};

        if (err) return console.log(err);

        console.log(`Found ${t_arr.length} threads`);
        
        for(var i in t_arr) {
            var t = t_arr[i];

            if (!(t['senderID'] in uidToName)) {
                uidToName[t['senderID']] = t['name'];
            }

            console.log(
            "[" + t['threadID'] + "] " + t['name']
            + " | Last msg: " + encrypter.decrypt(t['snippet'], passphrase));
        }
    }

    api.getThreadList(10, null, [], (err, t_arr) => process_list_threads(err, t_arr, passphrase));
};

exports.select_thread = function select_thread(api, thread_id, passphrase) {
    function thread_history(api, thread_id, passphrase) {
        function process_thread_history(err, history, passphrase) {
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
                events.receive_message(history[i], passphrase);
            }
    
            // timestamp = history[0].timestamp;
        }

        var num_messages = 10;
        api.getThreadHistory(thread_id, num_messages, undefined, (err, history) => process_thread_history(err, history, passphrase));
    }

    console.log("Fetching thread history");
    try {
        thread_history(api, thread_id, passphrase);    
    } catch (error) {
        console.log(error);
        return null;
    }
    
    return thread_id;
};