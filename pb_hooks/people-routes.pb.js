routerAdd(
    "GET",
    "/api/custom/people",
    c => {
        const people = arrayOf(new Record());
        $app.dao().recordQuery("users").all(people);

        const companies = arrayOf(new Record());
        $app.dao().recordQuery("companies").all(companies);

        const tasksRecords = arrayOf(new Record());
        $app.dao()
            .recordQuery("tasks")
            .andWhere($dbx.exp("assignees != {:exp}", { exp: "" }))
            .andWhere($dbx.exp("deleted = {:exp}", { exp: "" }))
            .all(tasksRecords);

        const projectsRecords = arrayOf(new Record());
        $app.dao()
            .recordQuery("projects")
            .andWhere($dbx.exp("id != 'inbox'"))
            .andWhere($dbx.exp("deleted = ''"))
            .all(projectsRecords);

        const projects = [];
        for (const project of projectsRecords) {
            const people = [];

            for (const task of tasksRecords) {
                if (task.get("project") === project.id) {
                    const assignees = task.get("assignees");
                    if (assignees && assignees.length) {
                        for (const assignee of assignees) {
                            if (!people.includes(assignee)) {
                                people.push(assignee);
                            }
                        }
                    }
                }
            }

            projects.push({
                title: project.get("title"),
                id: project.id,
                people,
            });
        }

        return c.json(200, { people, companies, projects, tasks: tasksRecords });
    },
    require(`${__hooks}/middlewares.pb.js`).checkForOwner
);
