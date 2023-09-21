cronAdd("logs", require(`${__hooks}/config.js`).cron.notificationsCheckInterval, () => {
    const utils = require(`${__hooks}/utils.js`);
    utils.clearLogs();
});
