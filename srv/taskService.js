const cds = require('@sap/cds');

module.exports = async (srv) => {
    const db = await cds.connect.to('db');

    srv.on('markTaskAsClosed', async (req) => {
        const { taskID } = req.data;
        const tx = db.tx(req);
        
        // Update task status
        const result = await tx.run(
            UPDATE('tasktracking.Tasks').set({ status: 'Closed' }).where({ ID: taskID })
        );

        return result ? true : false;
    });

    srv.before('CREATE', 'Efforts', async (req) => {
        const { task_ID } = req.data;
        const task = await db.run(
            SELECT.one.from('tasktracking.Tasks').where({ ID: task_ID })
        );

        if (task.status === 'Closed') {
            req.error(400, 'Efforts cannot be logged for a Closed task.');
        }
    });
};
