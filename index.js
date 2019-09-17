const login = require("facebook-chat-api");

const creds = require("./creds.js");

const helpers = require("./src/helpers.js");
const actions = require("./src/actions.js");
const events = require("./src/events.js");

var selected_thread_id;

function init(api) {
    my_id = api.getCurrentUserID();

    api.setOptions({
        selfListen: true,
        logLevel: 'error'
    });

    console.log(helpers.banner(creds.email));

    actions.list_threads(api, creds.secret_passphrase);
}

function action_resolver(api, input) {
    var args = input.split(" ");
    var cmd;

    if (args.length) cmd = args[0].slice(1);
    
    if (/^\:/i.test(input)) {
        switch (cmd) {
            case 'st':
                if (args.length != 2)  {
                    console.log('Usage: ":st <thread_id>"');
                    break;
                }
                selected_thread_id = actions.select_thread(api, args[1], creds.secret_passphrase);
                break;
            case 'lt':
                actions.list_threads(api, creds.secret_passphrase);
                break;
            case 'help':
                console.log(
                    "Available commands:\n" +
                    "- List threads: ':lt'\n" +
                    "- Set Thread to id: ':st <thread_id>'"
                );

                break;
            default:
                console.log('Invalid command');
        }
    } else {
        // check if thread is selected
        if (!selected_thread_id) {
            console.log('Please select a thread before sending a message');
        } else {
            actions.send_message(api, selected_thread_id, input, creds.secret_passphrase);
        }
    }
}

login({email: creds.email, password: creds.password}, (err, api) => {
    if(err) return console.error(err);

    init(api);

    process.openStdin().addListener("data", function(d) {
        d = d.toString().trim();
        if (d) action_resolver(api, d);
    });

    api.listen((err, message) => {
        events.receive_message(message, creds.secret_passphrase);
    });
});
