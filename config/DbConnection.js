const mongoose = require("mongoose")
const connection = mongoose.connection

//Connecting to mongodb database
const connectdb = async () => {
    // trying connection with mongodb database
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Connected to Database successfully",
            connect.connection.host,
            connect.connection.name);
    }
    // if some error occurs catch it and log
    catch (err) {
        console.log(err);
        process.exit(1);
    }
}

//exporting connection function
module.exports = connectdb;