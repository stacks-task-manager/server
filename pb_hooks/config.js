module.exports = {
    cron: {
        notificationsCheckInterval: "*/3 * * * *", // interval to check for queued emails to be sent
        clearLogsInterval: "* * */3 * *", // real-time logs clear interval
    }
};
