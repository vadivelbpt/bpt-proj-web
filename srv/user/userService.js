require('dotenv').config();
const cds = require('@sap/cds');
const bcrypt = require('bcrypt');

module.exports = async (srv) => {
    const db = await cds.connect.to('db');

    // Add Role API
    srv.on('addRole', async (req) => {
        const { name } = req.data;
        const [role] = await db.run(
            INSERT.into('tasktracking.Roles').entries({ ID: cds.utils.uuid(), name })
        );
        return role.ID;
    });

    // Add User API
    srv.on('addUser', async (req) => {
        const { username, email, password, roleID } = req.data;

        // Check if role exists
        const roleExists = await db.run(SELECT.one.from('tasktracking.Roles').where({ ID: roleID }));
        if (!roleExists) return req.error(400, 'Invalid Role ID');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert User
        const [user] = await db.run(
            INSERT.into('tasktracking.Users').entries({
                ID: cds.utils.uuid(),
                username,
                email,
                password: hashedPassword,
                role_ID: roleID
            })
        );

        return user.ID;
    });
    
    srv.on('READ', 'Users', async (req) => {
        return db.run(
            SELECT
                .from('tasktracking.Users as u') // Alias Users as 'u'
                .join('tasktracking.Roles as r').on('u.role_id = r.ID') // Explicit join condition
                .columns(
                    'u.ID as user_ID',  // Specify "u.ID" to avoid ambiguity
                    'u.username',
                    'u.email',
                    'r.name as roleName' // Fetch role name from Roles table
                )
        );
    });


    srv.on('getUsersByRoleId', async (req) => {
        const { role_ID } = req.data;
    
        if (!role_ID) {
            return req.error(400, "Role ID is required.");
        }
    
        try {
            // Fetch users based on role ID with role name
            const users = await db.run(
                SELECT
                    .from('tasktracking.Users as u') // Alias for Users
                    .join('tasktracking.Roles as r').on('u.role_ID = r.ID') // Join with Roles
                    .where({ 'u.role_ID': role_ID }) // Filter by role ID
                    .columns(
                        'u.ID as user_ID',  
                        'u.username as username',
                        'u.email',
                        'u.role_ID',  // Include role_ID
                        'r.name as roleName' // Fetch role name from Roles table
                    )
            );
    
            if (!users.length) {
                return req.reply({ status: 404, message: "No users found for the given Role ID." });
            }
    
            return req.reply({ status: 200, data: users });
    
        } catch (error) {
            return req.reject(500, `Error fetching users: ${error.message}`);
        }
    });
    
    


    
};


