onAfterBootstrap(e => {
    // creating (if missing) an Inbox project
    // this is used for tasks added to the Inbox section which still require to be connected to an actual project
    try {
        const inboxProject = $app.dao().findFirstRecordByData("projects", "id", "inbox");
    } catch (e) {
        const collection = $app.dao().findCollectionByNameOrId("projects");
        const record = new Record(collection, {
            title: "Inbox",
            id: "inbox",
        });
        $app.dao().saveRecord(record);
    }

    // clearing logs on startup
    const utils = require(`${__hooks}/utils.js`);
    utils.clearLogs();
});
