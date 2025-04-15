module.exports = async (srv) => {
    const db = await cds.connect.to('db');

    this.on('addModules', async (req) => {
        const { project_id, subProjectNames } = req.data;

        if (!project_id) {
            req.reject(400, "Project ID is required");
        }
        if (!subProjectNames || subProjectNames.length === 0) {
            req.reject(400, "At least one SubProject is required");
        }
        const projectExists = await db.run(SELECT.one.from('tasktracking.Projects').where({ ID: project_id }));

        if (!projectExists) return req.error(400, 'Invalid Project ID');

        // Extract names from subProjectNames array of objects
        const subProjectsData = subProjectNames.map(subProject => ({
            ID: cds.utils.uuid(),
            name: subProject.name,
            project_ID: project_id
        }));

        await db.run(INSERT.into('tasktracking.SubProjects').entries(subProjectsData));

        return "Modules added successfully";

    });
};
