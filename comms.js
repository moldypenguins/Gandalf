const config = require('./config');
const Member = require('./models/member');
const client = require('twilio')(config.twilio.sid, config.twilio.secret);

function callMember(memberId) {
    return new Promise((resolve, reject) => {
        Member.findOne({ id: memberId }).then(async (mem) => {
            if (mem != undefined && mem.phone != undefined) {
                var options = {
                    to: '+' + mem.phone,
                    from: config.twilio.number,
                    url: config.twilio.url,
                };

                var completed = {
                    status: 'completed'
                };

                // Place an outbound call to the user, using the TwiML instructions
                // from the /outbound route
                var call = await client.calls.create(options);
                setTimeout(async () => {
                    await call.update(completed);
                    resolve();
                }, config.twilio.ring_timeout * 1000);
            } else if (mem == undefined) {
                reject(`I don't know who is.`);
            } else if (mem.phone == undefined) {
                reject(`${mem.username} does not have a phone number set`);
            }
        });

    });
}

module.exports = {
    "callMember": callMember,
};

