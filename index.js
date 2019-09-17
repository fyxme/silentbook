// const login = require("./facebook-chat-api/index.js");
const login = require("facebook-chat-api");

const creds = require("./creds.js");
const actionHandler = require("./src/actions.js");
const encryptor = require("./src/encryptor.js");

var stdin = process.openStdin();
var t_id;
var uidToName = {};
var my_id;

function init(api) {
    my_id = api.getCurrentUserID();

    api.setOptions({
        selfListen: true,
        logLevel: 'error'
    });

    console.log(
        "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n" +
        "~~~~~~~~ Facebook Encrypted messenger ~~~~~~~~~~\n" +
        "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
    );
    console.log("Logged in as : " + creds.email);
    console.log("Type :help for a list of available commands");
    list_threads(api);
}

function new_thread(api, name = "") {
    api.getFriendslist((err, data) => {
        if(err) return console.log(err);

        // TODO: filter by name

        for(var i = 0; i < data.length; i++) {
            console.log(i + ". " + friend.fullName + " (" + friend.userID + ")");
        }
    });
}

function list_threads(api) {
    api.getThreadList(10, null, [], (err, t_arr) => {
        if (err) return console.log(err);

        console.log("Found " + t_arr.length + " threads");
        for(var i in t_arr) {
            var t = t_arr[i];

            if (!(t['senderID'] in uidToName)) {
                uidToName[t['senderID']] = t['name'];
            }

            console.log(
            "[" + t['threadID'] + "] " + t['name']
            + " | Last msg: " + encryptor.decryptMsg(t['snippet'], creds.key));
        }
    });
}

function pad_txt(t1, t2) {
    var ret = t1;
    for (var i=t1.length; i<t2.length; i++)
        ret += " ";
    return ret;
}

function print_message(msg_obj) {
    // console.log(history[i]);
    var uid = msg_obj.senderID;
    if (msg_obj.body) {
        var msg = encryptor.decryptMsg(msg_obj.body.toString(), creds.key);
        var e = msg !== msg_obj.body? '[e] ' : '';
        if (uid === my_id)
            console.log('\x1b[31m%s | \033[1m%s\033[0;0m%s\x1b[0m', 'You ', e, msg);
        else
            console.log('\x1b[32m%s | \033[1m%s\033[0;0m%s\x1b[0m', 'Them', e, msg);
    }
}

function thread_history(api) {
    var num_messages = 0;
    api.getThreadHistory(t_id, num_messages, undefined, (err, history) => {
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
            print_message(history[i]);
        }

        // timestamp = history[0].timestamp;
    });
}

function select_thread(api, thread_id) {
    t_id = thread_id;
    // display history
    thread_history(api);
}

function send_message(api, msg) {
    console.log("\033[F\r\x1b[K\033[F");
    // Encrypt
    var ciphertext = encryptor.encryptMsg(msg, creds.key);
    api.sendMessage(ciphertext, t_id, (err, m) => {
        if (err) return console.log(err);
    });
}

function action_resolver(api, input) {
    var args = input.split(" ");
    var cmd;
    if (args.length) cmd = args[0].slice(1);
    // var cmds = ['help','st'];
    if (/^\:/i.test(input)) {
        switch (cmd) {
            case 'st':
                if (args.length != 2)  {
                    console.log('Usage: ":st <thread_id>"');
                    break;
                }
                select_thread(api, args[1]);
                break;
            case 'fl':
                list_threads(api);
                break;
            case 'help':
                console.log(
                    "Available commands:\n" +
                    "- Friends list: ':fl'\n" +
                    "- Set Thread to id: ':st <thread_id>'"
                );

                break;
            default:
                console.log('Invalid command');
        }
    } else {
        // check if thread is selected
        if (!t_id) {
            console.log('Please select a thread before sending a message');
        } else {
            send_message(api, input);
        }
    }
}

login({email: creds.email, password: creds.password}, (err, api) => {
    if(err) return console.error(err);

    init(api);

    stdin.addListener("data", function(d) {
        d = d.toString().trim();
        if (d) action_resolver(api, d);
    });

    api.listen((err, message) => {
        print_message(message);
    });
});
