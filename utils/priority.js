
const getPriority = (due_date) => {
    // Get the current date and time in UTC
    const currentDateUTC = new Date();

    // Define the UTC offset for the "Asia/Kolkata" time zone (in minutes)
    const utcOffsetMinutes = 330; // India Standard Time (IST) is UTC+5:30

    // Calculate the local date and time in the specified time zone
    const currentDate = new Date(currentDateUTC.getTime() + utcOffsetMinutes * 60 * 1000);
    const dueDate = new Date(due_date);

    console.log(currentDate);

    // Check if the date is valid
    // YYYY-MM-DD
    if (isNaN(dueDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for due_date should be in format YYYY-MM-DD ' });
    }


    const timeDifference = dueDate.getTime() - currentDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

    if (daysDifference < 0) {
        return res.status(400).json({
            message: "due date should only be for the future"
        })
    }

    let priority = 0;

    if (daysDifference <= 0) {
        priority = 0;
    } else if (daysDifference <= 2) {
        priority = 1;
    } else if (daysDifference <= 4) {
        priority = 2;
    } else if (daysDifference <= 5) {
        priority = 3;
    } else {
        priority = 3;
    }
    return priority;
}

module.exports = { getPriority }