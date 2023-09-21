onRecordAfterUpdateRequest(e => {
    const data = $apis.requestInfo(e.httpContext).data;
    const currentUser = e.httpContext.get("authRecord");

    const assignees = e.record.get("assignees");
    const projectId = e.record.get("project");

    if (data.done != null) {
        // if the task is completed
        if (data.done === true) {
            const usersToNotify = [];
            const taskId = e.record.get("id");
            const taskRecord = $app.dao().findRecordById("tasks", taskId);
            $app.dao().expandRecord(taskRecord, ["assignees", "project", "tags", "status", "subtasks"], null);

            const task = taskRecord.publicExport();

            for (const expandedKey of Object.keys(task.expand)) {
                task[expandedKey] = task.expand[expandedKey];
            }

            delete task.expand;

            if (assignees != null && assignees.length) {
                for (const assignee of assignees) {
                    if (assignee !== currentUser.id) {
                        usersToNotify.push(assignee);
                    }
                }
            }

            if (projectId) {
                const project = $app.dao().findRecordById("projects", projectId);
                if (project) {
                    const projectOwner = project.get("projectOwner");
                    if (projectOwner != null && !usersToNotify.includes(projectOwner)) {
                        usersToNotify.push(projectOwner);
                    }
                }
            }

            if (usersToNotify.length > 0) {
                const users = $app.dao().findRecordsByIds("users", usersToNotify);

                for (const user of users) {
                    const collection = $app.dao().findCollectionByNameOrId("notifications");
                    const record = new Record(collection);
                    const form = new RecordUpsertForm($app, record);

                    form.loadData({
                        recordId: e.record.id,
                        recordType: "task",
                        subject: "Task completed",
                        template: "task-completed",
                        email: user.get("email"),
                        name: `${user.get("firstName")} ${user.get("lastName")}`,
                        data: {
                            task,
                            currentUser: `${currentUser.get("firstName")} ${currentUser.get("lastName")}`,
                        },
                        delivered: false,
                    });
                    try {
                        form.submit();
                    } catch (error) {
                        console.log("Error saving user notification", JSON.stringify(error));
                    }
                }
            }
        }
        // else if the task was marked as todo
        // we need to delete any queued notifications
        else {
            const notifications = $app
                .dao()
                .findRecordsByFilter(
                    "notifications",
                    `delivered=false && recordId='${e.record.id}' && recordType="task"`
                );

            for (const notification of notifications) {
                $app.dao().deleteRecord(notification);
            }
        }
    }
}, "tasks");

cronAdd(
    "notifications",
    require(`${__hooks}/config.js`).cron.notificationsCheckInterval,
    sendQueuedNotifications
);

function sendQueuedNotifications() {
    const notifications = $app.dao().findRecordsByFilter("notifications", "delivered=false");
    console.log("Reading queued notifications", notifications.length);

    const templates = require(`${__hooks}/templates.js`);

    for (const notification of notifications) {
        const data = JSON.parse(notification.get("data"));
        const template = notification.get("template");

        let html = "";

        try {
            html = $template.loadFiles(...templates[template]).render(data);

            const message = new MailerMessage({
                from: {
                    address: $app.settings().meta.senderAddress,
                    name: $app.settings().meta.senderName,
                },
                to: [
                    {
                        name: notification.get("name"),
                        address: notification.get("email"),
                    },
                ],
                subject: `Stacks - ${notification.get("subject")}`,
                html,
            });

            try {
                $app.newMailClient().send(message);

                notification.set("delivered", true);
                notification.set("sent", new Date());
                $app.dao().saveRecord(notification);
            } catch (error) {
                console.log("Error while sending the notification", error);
            }
        } catch (error) {
            console.log("Error rendering template", error);
        }
    }
}
