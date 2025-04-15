const cds = require('@sap/cds');
const { UPDATE } = require('@sap/cds/lib/ql/cds-ql');

module.exports = cds.service.impl(async function () {
    const db = await cds.connect.to('db'); // Connect to DB

    // #getProjects
    // this.on('READ', 'Projects', async (req) => {
    //     return db.run(SELECT.from('tasktracking.Projects').columns('ID', 'name', 'statusflag', 'description'));
    // });

    this.on('READ', 'Projects', async (req) => {
        return db.run(SELECT.from('tasktracking.Projects'));
    });


    // #addProjects
    this.on('addProject', async (req) => {
        const { name, description, statusflag } = req.data;

        if (!name) return req.error(400, "Project name is required.");

        const createproject = await db.run(
            INSERT.into('tasktracking.Projects').entries({
                ID: cds.utils.uuid(),
                name,
                description,
                statusflag
            })
        );
        if (createproject) {
            return { status: 200, message: "Project created successfully" };
        } else {
            req.error(500, "Failed to create project.");
        }
    });

    // #updateProjects
    this.on('updateProject', async (req) => {
        const { ID, name, description, statusflag } = req.data;

        if (!ID) return req.error(400, "Project ID is required.");
        if (!name) return req.error(400, "Project name is required.");

        // Check if project exists
        const projectExists = await db.run(SELECT.one.from('tasktracking.Projects').where({ ID }));
        if (!projectExists) return req.error(404, "Project not found.");

        // Update project
        const updated = await db.run(
            UPDATE('tasktracking.Projects')
                .set({ name, description, statusflag })
                .where({ ID })
        );

        if (updated) {
            return { status: 200, message: "Project updated successfully" };
        } else {
            req.error(500, "Failed to update project.");
        }
    });

    
     // Assign Project to PM
     this.on('assignProjectToUser', async (req) => {
        const { user_ID, project_IDs } = req.data;
    
        if (!user_ID || !Array.isArray(project_IDs) || project_IDs.length === 0) {
            return { error: "User ID and at least one Project ID are required." };
        }
    
        const projectIDsList = project_IDs.map(proj => proj.ID);
        const errors = [];
        const success = [];
    
        for (const project_ID of projectIDsList) {
            try {
                // Check if the project exists
                const projectExists = await SELECT.one.from('tasktracking.Projects').where({ ID: project_ID });
                if (!projectExists) {
                    errors.push(`Project with ID ${project_ID} not found.`);
                    continue;
                }
    
                // Check if the project is already assigned
                const projectAssigned = await SELECT.one.from('tasktracking.ProjectAssignments').where({ project_ID });
                if (projectAssigned) {
                    errors.push(`Project ${projectExists.name   } is already assigned to user`);
                    continue;
                }
    
                // Check if the user is already assigned to this project
                const assignmentExists = await SELECT.one.from('tasktracking.ProjectAssignments').where({ user_ID, project_ID });
                if (assignmentExists) {
                    errors.push(`User is already assigned to Project ${projectExists.name}.`);
                    continue;
                }
    
                // Assign project to user
                await INSERT.into('tasktracking.ProjectAssignments').entries({
                    ID: cds.utils.uuid(),
                    user_ID,
                    project_ID
                });
    
                success.push(`Project ID ${project_ID} assigned successfully.`);
            } catch (error) {
                errors.push(`Failed to assign Project ${projectExists.name}: ${error.message}`);
            }
        }
    
        // Return proper response including errors
        return {
            message: success.length > 0 ? "Projects assigned successfully." : "Error Occured.",
            success: success,
            errors
        };
    });
    
    

    // # Get Assigned Projects & Modules for Logged-in User
    this.on('getAssignedProjects', async (req) => {
        const { user_ID } = req.data;
    
        if (!user_ID) return req.error(400, "User ID is required.");
    
        const assignedData = await db.run(
            SELECT
                .from('tasktracking.ProjectAssignments as pa')
                .join('tasktracking.Projects as p').on('pa.project_ID = p.ID') // Join with Projects table
                .where({ 'pa.user_ID': user_ID, 'p.statusflag': true }) // Filter by user_ID and statusflag = true
                .columns(
                    'p.ID as project_ID',
                    'p.name as project_name',
                    'statusflag as statusFlag',
                    'p.description as description'
                )
        );
    
        if (!assignedData.length) {
            return req.reply({ status: 404, message: "No active assigned projects found." });
        }
    
        return req.reply({ status: 200, data: assignedData });
    });
    

    // #addModules
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

        const subProjectsData = subProjectNames.map(subProject => ({
            ID: cds.utils.uuid(),
            name: subProject.name,
            description : subProject.description,
            statusflag : subProject.statusflag,
            startDate: subProject.startDate,
            endDate:subProject.endDate,
            project_ID: project_id
        }));

        await db.run(INSERT.into('tasktracking.SubProjects').entries(subProjectsData));
        return "Modules added successfully";

    });

    // #updateModule
    this.on('updateSubModules', async (req) => {
        const { ID, name, description, statusflag,startDate, endDate } = req.data; // Get module ID and name

        if (!ID) return req.error(400, "SubProject ID is required.");
        if (!name) return req.error(400, "SubProject name is required.");

        // Check if the subproject exists
        const subProjectExists = await db.run(SELECT.one.from('tasktracking.SubProjects').where({ ID }));
        if (!subProjectExists) return req.error(404, "SubProject not found.");

        // Update the subproject
        const updated = await db.run(
            UPDATE('tasktracking.SubProjects')
                .set({ name, description, statusflag,startDate, endDate  })
                .where({ ID })
        );

        if (updated > 0) {
            return { status: 200, message: "SubProject updated successfully" };
        } else {
            req.error(500, "Failed to update SubProject.");
        }
    });

    // #getProjectModulesByid
    this.on('READ', 'SubProjects', async (req) => {
        console.log("Incoming Request for SubProjects:", req.query);

        if (!req.query.SELECT.where) {
            console.error("Error: Project ID is missing in request filter!");
            return req.error(400, "Project ID is required.");
        }

        // Extract project_ID from the query filter
        let project_ID;
        req.query.SELECT.where.forEach((condition, index) => {
            if (condition.ref && condition.ref[0] === 'project_ID') {   
                project_ID = req.query.SELECT.where[index + 2].val;
            }
        });

        if (!project_ID) {
            console.error("Error: Project ID not found in filter condition!");
            return req.error(400, "Project ID is required.");
        }

        return db.run(SELECT.from('tasktracking.SubProjects').where({ project_ID }));
    });

    // Assign TL to Modules

    this.on('assignModules', async (req) => {
        const { user_ID,   module_IDs } = req.data;
    
        if (!user_ID  || !Array.isArray(module_IDs) || module_IDs.length === 0) {
            return { error: "User ID and at least one Module ID are required." };
        }
    
        const errors = [];
        const success = [];
    
        for (const module of module_IDs) {
            const module_ID = module.ID;
    
            try {
                // Fetch module details along with project_ID
                const moduleData = await SELECT.one
                    .from('tasktracking.SubProjects')
                    .columns('ID', 'project_ID', 'name')
                    .where({ ID: module_ID });
    
                if (!moduleData) {
                    errors.push(`Module with ID ${module_ID} not found.`);
                    continue;
                }
    
                const { project_ID, name: moduleName } = moduleData;
    
                // Fetch project name
                const projectData = await SELECT.one
                    .from('tasktracking.Projects')
                    .columns('ID', 'name')
                    .where({ ID: project_ID });
    
                if (!projectData) {
                    errors.push(`Project associated with Module '${moduleName}' not found.`);
                    continue;
                }
    
                const { name: projectName } = projectData;
    
                // Check if the user is already assigned to this module
                const assignmentExists = await SELECT.one
                    .from('tasktracking.ModuleAssign')
                    .where({ user_ID, module_ID });
    
                if (assignmentExists) {
                    errors.push(`User is already assigned to Module '${moduleName}' under Project '${projectName}'.`);
                    continue;
                }
    
                // Assign module and project to the user
                await INSERT.into('tasktracking.ModuleAssign').entries({
                    ID: cds.utils.uuid(),
                    user_ID,
                    project_ID,
                    module_ID
                });
    
                success.push(`Module '${moduleName}' under Project '${projectName}' assigned successfully.`);
            } catch (error) {
                errors.push(`Failed to assign module with ID ${module_ID}: ${error.message}`);
            }
        }
    
        return {
            message: success.length > 0 ? "Modules assigned successfully." : "Error Occured.",
            success: success,
            errors
        };
    });
    
    // this.on('assignModules', async (req) => {
    //     const { module_ID, user_IDs } = req.data;
    
    //     if (!module_ID || !Array.isArray(user_IDs) || user_IDs.length === 0) {
    //         return req.error(400, "Module ID and at least one user input are required.");
    //     }
    
    //     const moduleData = await SELECT.one
    //         .from('tasktracking.SubProjects')
    //         .columns('ID', 'project_ID', 'name')
    //         .where({ ID: module_ID });
    
    //     if (!moduleData) {
    //         return req.error(404, `Module with ID ${module_ID} not found.`);
    //     }
    
    //     const { project_ID, name: moduleName } = moduleData;
    
    //     const projectData = await SELECT.one
    //         .from('tasktracking.Projects')
    //         .columns('ID', 'name')
    //         .where({ ID: project_ID });
    
    //     if (!projectData) {
    //         return req.error(404, `Project associated with Module '${moduleName}' not found.`);
    //     }
    
    //     const { name: projectName } = projectData;
    
    //     const errors = [];
    //     const success = [];
    
    //     for (const user of user_IDs) {
    //         const user_ID = user.ID;
    //         const percentage = user.percentage;
    
    //         if (!user_ID || !percentage) {
    //             errors.push(`User ID and percentage are required for one of the entries.`);
    //             continue;
    //         }
    
    //         try {
    //             const assignmentExists = await SELECT.one
    //                 .from('tasktracking.ModuleAssign')
    //                 .where({ user_ID, module_ID });
    
    //             if (assignmentExists) {
    //                 errors.push(`User with ID ${user_ID} is already assigned to Module '${moduleName}' under Project '${projectName}'.`);
    //                 continue;
    //             }
    
    //             await INSERT.into('tasktracking.ModuleAssign').entries({
    //                 ID: cds.utils.uuid(),
    //                 user_ID,
    //                 project_ID,
    //                 module_ID,
    //                 percentage
    //             });
    
    //             success.push(`Module '${moduleName}' assigned to User ID '${user_ID}' with ${percentage}% successfully.`);
    //         } catch (error) {
    //             errors.push(`Failed to assign module to User ID '${user_ID}': ${error.message}`);
    //         }
    //     }
    
    //     return {
    //         message: success.length > 0 ? "Module assignment process completed." : "All assignments failed.",
    //         success,
    //         errors
    //     };
    // });
    
    
    // get Assigned Module for TL

    // this.on('getAssignedModules', async (req) => {
    //     const { user_ID } = req.data;
    
    //     if (!user_ID) return req.error(400, "User ID is required.");
    
    //     const assignedData = await db.run(
    //         SELECT
    //             .from('tasktracking.ModuleAssign as ma')
    //             .join('tasktracking.SubProjects as sp').on('ma.module_ID = sp.ID') // Join with SubProjects table
    //             .join('tasktracking.Projects as p').on('ma.project_ID = p.ID') // Join with Projects table
    //             .where({ 'ma.user_ID': user_ID, 'p.statusflag': true }) // Filter by user_ID and active projects
    //             .columns(
    //                 'ma.ID as assignment_ID',
    //                 'p.ID as project_ID',
    //                 'p.name as project_name',
    //                 'sp.ID as module_ID',
    //                 'sp.name as module_name',
    //                 'p.statusflag as statusFlag'
    //             )
    //     );
    
    //     if (!assignedData.length) {
    //         return req.reply({ status: 404, message: "No active assigned modules found." });
    //     }
    
    //     return req.reply({ status: 200, data: assignedData });
    // });

    this.on('getAssignedModules', async (req) => {
        const { user_ID } = req.data;
    
        if (!user_ID) return req.error(400, "User ID is required.");
    
        const assignedData = await db.run(
            SELECT
                .from('tasktracking.ModuleAssign as ma')
                .join('tasktracking.SubProjects as sp').on('ma.module_ID = sp.ID')
                .join('tasktracking.Projects as p').on('ma.project_ID = p.ID')
                .where({ 'ma.user_ID': user_ID, 'p.statusflag': true })
                .columns(
                    'ma.ID as assignment_ID',
                    'p.ID as project_ID',
                    'p.name as project_name',
                    'p.description as project_description',
                    'sp.ID as module_ID',
                    'sp.name as module_name',
                    'sp.description as module_description',
                    'p.statusflag as statusFlag'
                )
        );
    
        if (!assignedData.length) {
            return req.reply({ status: 404, message: "No active assigned modules found." });
        }
    
        // Grouping the modules under respective projects
        const groupedData = assignedData.reduce((acc, item) => {
            if (!acc[item.project_ID]) {
                acc[item.project_ID] = {
                    project_ID: item.project_ID,
                    project_name: item.project_name,
                    project_description: item.project_description,
                    statusFlag: item.statusFlag,
                    modules: []
                };
            }
            acc[item.project_ID].modules.push({
                module_ID: item.module_ID,
                module_name: item.module_name,
                module_description: item.module_description,
                assignment_ID: item.assignment_ID
            });
            return acc;
        }, {});
    
        return req.reply({ status: 200, data: Object.values(groupedData) });
    });
    
// get Assigned Users list according to project

    this.on('getUsersByModuleId', async (req) => {
        const { module_ID } = req.data;
    
        if (!module_ID) return req.error(400, "Module ID is required.");
    
        const assignedUsers = await db.run(
            SELECT
                .from('tasktracking.ModuleAssign as ma')
                .join('tasktracking.Users as u').on('ma.user_ID = u.ID')
                .join('tasktracking.Projects as p').on('ma.project_ID = p.ID')
                .where({ 'ma.module_ID': module_ID, 'p.statusflag': true })
                .columns(
                    'ma.ID as assignment_ID',
                    'u.ID as user_ID',
                    'u.name as user_name',
                    'u.email as user_email',
                    'ma.percentage as assigned_percentage',
                    'p.ID as project_ID',
                    'p.name as project_name',
                    'p.statusflag as statusFlag'
                )
        );
    
        if (!assignedUsers.length) {
            return req.reply({ status: 404, message: "No active users assigned to this module." });
        }
    
        return req.reply({ status: 200, data: assignedUsers });
    });
    
    

    // Assign Tasks to Users

    this.on('assignTasks', async (req) => {
        const { user_ID, task_IDs } = req.data;
    
        if (!user_ID || !Array.isArray(task_IDs) || task_IDs.length === 0) {
            return { error: "User ID and at least one Task ID are required." };
        }
    
        const errors = [];
        const success = [];
    
        for (const task of task_IDs) {
            const task_ID = task.ID;
    
            try {
                // Fetch task details along with module_ID and project_ID
                const taskData = await SELECT.one
                    .from('tasktracking.Tasks')
                    .columns('ID', 'module_ID', 'name')
                    .where({ ID: task_ID });
    
                if (!taskData) {
                    errors.push(`Task with ID ${task_ID} not found.`);
                    continue;
                }
    
                const { module_ID, name: taskName } = taskData;
    
                // Fetch module details along with project_ID
                const moduleData = await SELECT.one
                    .from('tasktracking.SubProjects')
                    .columns('ID', 'project_ID', 'name')
                    .where({ ID: module_ID });
    
                if (!moduleData) {
                    errors.push(`Module associated with Task '${taskName}' not found.`);
                    continue;
                }
    
                const { project_ID, name: moduleName } = moduleData;
    
                // Fetch project name
                const projectData = await SELECT.one
                    .from('tasktracking.Projects')
                    .columns('ID', 'name')
                    .where({ ID: project_ID });
    
                if (!projectData) {
                    errors.push(`Project associated with Task '${taskName}' not found.`);
                    continue;
                }
    
                const { name: projectName } = projectData;
    
                // Check if the user is already assigned to this task
                const assignmentExists = await SELECT.one
                    .from('tasktracking.TaskAssign')
                    .where({ user_ID, task_ID });
    
                if (assignmentExists) {
                    errors.push(`User is already assigned to Task '${taskName}' under Module '${moduleName}' and Project '${projectName}'.`);
                    continue;
                }
    
                // Assign task to the user
                await INSERT.into('tasktracking.TaskAssign').entries({
                    ID: cds.utils.uuid(),
                    user_ID,
                    project_ID,
                    module_ID,
                    task_ID
                });
    
                success.push(`Task '${taskName}' under Module '${moduleName}' and Project '${projectName}' assigned successfully.`);
            } catch (error) {
                errors.push(`Failed to assign task with ID ${task_ID}: ${error.message}`);
            }
        }
    
        return {
            message: success.length > 0 ? "Tasks assigned successfully." : "Error Occurred.",
            success: success,
            errors
        };
    });
    
    this.on('getAssignedTasks', async (req) => {
        const { user_ID } = req.data;
    
        if (!user_ID) return req.error(400, "User ID is required.");
    
        const assignedData = await db.run(
            SELECT
                .from('tasktracking.TaskAssign as ta')
                .join('tasktracking.Tasks as t').on('ta.task_ID = t.ID') // Join with Tasks table
                .join('tasktracking.SubProjects as sp').on('ta.module_ID = sp.ID') // Join with SubProjects table
                .join('tasktracking.Projects as p').on('ta.project_ID = p.ID') // Join with Projects table
                .where({ 'ta.user_ID': user_ID, 'p.statusflag': true }) // Filter by user_ID and active projects
                .columns(
                    'ta.ID as assignment_ID',
                    'p.ID as project_ID',
                    'p.name as project_name',
                    'sp.ID as module_ID',
                    'sp.name as module_name',
                    't.ID as task_ID',
                    't.name as task_name',
                    'p.statusflag as statusFlag'
                )
        );
    
        if (!assignedData.length) {
            return req.reply({ status: 404, message: "No active assigned tasks found." });
        }
    
        return req.reply({ status: 200, data: assignedData });
    });
    

    // #getallTasks
    this.on('READ', 'Tasks', async (req) => {
        return db.run(
            SELECT
                .from('tasktracking.Tasks as t')
                .columns('t.ID', 't.title', 't.description', 't.subProject_ID', 't.status', 'sp.name as subProjectName', 'p.name as projectName')
                .join('tasktracking.SubProjects as sp').on('t.subProject_ID = sp.ID')
                .join('tasktracking.Projects as p').on('sp.project_ID = p.ID')
        );
    });

    // #addTaks
    this.on('addTasks', async (req) => {
        const { subproject_id, Tasks } = req.data;

        if (!subproject_id) return req.error(400, "SubProject ID is required.");
        if (!Tasks || Tasks.length === 0) return req.error(400, "At least one task is required.");

        // Check if the SubProject exists
        const subProjectExists = await db.run(SELECT.one.from('tasktracking.SubProjects').where({ ID: subproject_id }));
        if (!subProjectExists) return req.error(404, "SubProject not found.");

        // Prepare task entries for insertion
        const taskEntries = Tasks.map(task => ({
            ID: cds.utils.uuid(),
            title: task.tasksname,
            description: task.description,
            status: task.status || 'Open',
            subProject_ID: subproject_id 
        }));

        try {
            await db.run(INSERT.into('tasktracking.Tasks').entries(taskEntries));
            return { status: 200, message: "Tasks added successfully" };
        } catch (error) {
            req.error(500, "Failed to add tasks: " + error.message);
        }
    });

    // #updateTask
    this.on('updateTask', async (req) => {
        const { task_ID, module_ID, title, description, status  } = req.data;

        if (!task_ID) return req.error(400, "Task ID is required.");
        if (!module_ID) return req.error(400, "Module ID is required.");
        if (!title && !status) return req.error(400, "At least one field (title or status) is required for update.");

        try {
            // Check if the task exists under the given module
            const taskExists = await db.run(
                SELECT.one.from('tasktracking.Tasks').where({ ID: task_ID, subProject_ID: module_ID })
            );

            if (!taskExists) return req.error(404, "Task not found for the given module.");

            // Update only the provided fields
            const updateData = {};
            if (title) updateData.title = title;
            if(description) updateData.description = description;
            if (status) updateData.status = status;

            await db.run(UPDATE('tasktracking.Tasks').set(updateData).where({ ID: task_ID }));

            return { status: 200, message: "Task updated successfully." };
        } catch (error) {
            req.error(500, "Failed to update task: " + error.message);
        }
    });


    // #getTasksByModuleIds
    this.on('getTasksByModuleIds', async (req) => {
        const { module_ids } = req.data;

        if (!module_ids || !Array.isArray(module_ids) || module_ids.length === 0) {
            return req.error(400, "Module ID array is required.");
        }

        try {
            const tasks = await db.run(
                SELECT.from('tasktracking.Tasks')
                    .where({ subProject_ID: { in: module_ids } })
                    .columns('ID', 'title', 'description', 'status', 'subProject_ID')
            );

            return { status: 200, data: tasks };
        } catch (error) {
            req.error(500, "Failed to fetch tasks: " + error.message);
        }
    });    
    

   
    // Add User Task Entry
    this.on('addUserTask', async (req) => {
        const { user_ID, task_ID, project_ID, module_ID, date, hours, description, ticketNo } = req.data;

        if (!user_ID) return req.error(400, "User ID is required.");
        if (!task_ID) return req.error(400, "Task ID is required.");
        if (!project_ID) return req.error(400, "Project ID is required.");
        if (!module_ID) return req.error(400, "Module ID is required.");
        if (!date) return req.error(400, "Date is required.");
        if (!hours) return req.error(400, "Hours are required.");
        if (!description) return req.error(400, "Description is required.");

        // Check if user exists
        const userExists = await db.run(SELECT.one.from('tasktracking.Users').where({ ID: user_ID }));
        if (!userExists) return req.error(404, "User not found.");

        // Check if task exists
        const taskExists = await db.run(SELECT.one.from('tasktracking.Tasks').where({ ID: task_ID }));
        if (!taskExists) return req.error(404, "Task not found.");

        // Insert task entry
        try {
            await db.run(
                INSERT.into('tasktracking.UserTasks').entries({
                    ID: cds.utils.uuid(),
                    user_ID: user_ID,
                    task_ID: task_ID,
                    project_ID: project_ID,
                    module_ID: module_ID,
                    date: date,
                    hours: hours,
                    ticketNo : ticketNo,
                    description: description
                })
            );
            return { status: 200, message: "Task entry added successfully." };
        } catch (error) {
            return req.error(500, "Failed to add task entry: " + error.message);
        }
    });

    // Update user task entry

    this.on('updateUserTask', async (req) => {
        const { ID, user_ID, task_ID, project_ID, module_ID, date, hours, description, ticketNo } = req.data;
    
        if (!ID) return req.error(400, "User Task ID is required.");
        if (!user_ID) return req.error(400, "User ID is required.");
        if (!task_ID) return req.error(400, "Task ID is required.");
        if (!project_ID) return req.error(400, "Project ID is required.");
        if (!module_ID) return req.error(400, "Module ID is required.");
        if (!date) return req.error(400, "Date is required.");
        if (!hours) return req.error(400, "Hours are required.");
        if (!description) return req.error(400, "Description is required.");
    
        // Check if task entry exists
        const taskEntry = await db.run(SELECT.one.from('tasktracking.UserTasks').where({ ID: ID }));
        if (!taskEntry) return req.error(404, "Task entry not found.");
    
        // Check if user exists
        const userExists = await db.run(SELECT.one.from('tasktracking.Users').where({ ID: user_ID }));
        if (!userExists) return req.error(404, "User not found.");
    
        // Check if task exists
        const taskExists = await db.run(SELECT.one.from('tasktracking.Tasks').where({ ID: task_ID }));
        if (!taskExists) return req.error(404, "Task not found.");
    
        // Perform update
        try {
            await db.run(
                UPDATE('tasktracking.UserTasks')
                    .set({
                        user_ID: user_ID,
                        task_ID: task_ID,
                        project_ID: project_ID,
                        module_ID: module_ID,
                        date: date,
                        hours: hours,
                        ticketNo: ticketNo,
                        description: description
                    })
                    .where({ ID: ID })
            );
            return { status: 200, message: "Task entry updated successfully." };
        } catch (error) {
            return req.error(500, "Failed to update task entry: " + error.message);
        }
    });
    

    this.on('getUserTasksForTask', async (req) => {
        const { user_ID, task_ID } = req.data;
    
        if (!user_ID) return req.error(400, "User ID is required.");
        if (!task_ID) return req.error(400, "Task ID is required.");
    
        try {
            const userTasksForTask = await db.run(
                SELECT
                    .from('tasktracking.UserTasks as ut')
                   
                    .where({ 'ut.user_ID': user_ID, 'ut.task_ID': task_ID })
                    .columns(
                        'ut.ID as userTask_ID',
                        'ut.date',
                        'ut.hours',
                        'ut.description'
                    )
            );
    
            if (!userTasksForTask.length) {
                return req.reply({ status: 404, message: "No task entries found for this user and task." });
            }
    
            return req.reply({ status: 200, data: userTasksForTask });
    
        } catch (error) {
            return req.error(500, `Failed to fetch user task entries: ${error.message}`);
        }
    });
    

    // Get User Task Entries
    this.on('getUserTasks', async (req) => {
        const { user_ID } = req.data;

        if (!user_ID) return req.error(400, "User ID is required.");

        try {
            const userTasks = await db.run(
                SELECT
                    .from('tasktracking.UserTasks as ut')
                    .where({ 'ut.user_ID': user_ID })
                    .columns(
                        'ut.ID as userTask_ID',
                        'ut.date',
                        'ut.hours',
                        'ut.description',
                        'ut.ticketNo',
                        't.title as task_name',
                        'p.name as project_name',
                        'm.name as module_name'
                    )
                    .join('tasktracking.Tasks as t').on('ut.task_ID = t.ID')
                    .join('tasktracking.Projects as p').on('ut.project_ID = p.ID')
                    .join('tasktracking.SubProjects as m').on('ut.module_ID = m.ID')
            );

            if (userTasks.length === 0) {
                return req.reply({ status: 404, message: "No tasks found for this user." });
            }

            return req.reply({ status: 200, data: userTasks });
        } catch (error) {
            return req.error(500, "Failed to fetch user tasks: " + error.message);
        }
    });
});
