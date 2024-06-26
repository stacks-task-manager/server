cronAdd("logs", require(`${__hooks}/config.js`).cron.transactionalCheckInterval, () => {
    const utils = require(`${__hooks}/utils.js`);
    utils.clearLogs();
});

cronAdd("notifications", require(`${__hooks}/config.js`).cron.notificationsInterval, () => {
    const notifications = arrayOf(new Record);

    $app.dao().recordQuery("notifications")
        .andWhere($dbx.hashExp({ "sent": "" }))
        .all(notifications)
});