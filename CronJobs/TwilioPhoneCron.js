const cron = require("node-cron");
const Task = require("../models/taskModel");
const User = require("../models/UserModel");
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NO;

const client = require("twilio")(accountSid, authToken);

const DueTaskschedule = async (phoneNumber) => {
    console.log(`Scheduling voice call with +91${phoneNumber} from ${twilioNumber} at ${new Date()}`);

    try {
        const call = await client.calls.create({
            url: "http://demo.twilio.com/docs/voice.xml",
            to: `+919013366483`,
            from: twilioNumber,
        });

        console.log("call sid:", call.sid);

        const callRes = call.sid;
        console.log('Call happened successfully:', callRes);
        return true;  // Return a success indicator
    } catch (err) {
        console.error('Something went wrong while calling:', err);
        return false;  // Return a failure indicator
    }
};

const VoiceCallTasks = () => {
    // every minute
    cron.schedule('*/5 * * * * *', async () => {
        try {
            const tasks = await Task.find({
                priority: 0, // Due today or overdue
                status: { $in: ['TODO', 'IN_PROGRESS'] },
            })
                .populate('user')
                .sort({ 'user.priority': 1, due_date: 1 });

            console.log("In voica call: ", tasks)

            for (const task of tasks) {
                const phoneNumber = task.user.phone_no;

                const isCallSuccessful = await DueTaskschedule(phoneNumber);

                if (isCallSuccessful) {
                    break;
                }
            }
        } catch (error) {
            console.error('Error in scheduling overdue tasks: \n', error);
        }
    }, { timezone: 'Asia/Kolkata', scheduled: true });
}

module.exports = { DueTaskschedule, VoiceCallTasks };
