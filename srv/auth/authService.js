require('dotenv').config();
const cds = require('@sap/cds');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.SECRET_KEY;  // Load from .env

module.exports = async (srv) => {
    const db = await cds.connect.to('db');

    srv.on('login', async (req) => {
        const { username, password } = req.data;
    
        // Fetch user details without exposing password
        const user = await db.run(
            SELECT.one.from('tasktracking.Users')
            .columns(
                'ID',
                'username',
                'email',
                'role.name as role_name' // Fetch role name using association
            )
            .where({ username })
        );
    
        if (!user) return req.error(401, 'User not found');
    
        // Fetch the password separately for verification
        const userWithPassword = await db.run(
            SELECT.one.from('tasktracking.Users')
            .columns('password')
            .where({ username })
        );
    
        const match = await bcrypt.compare(password, userWithPassword.password);
        if (!match) return req.error(401, 'Invalid password');
    
        // Generate JWT token including role name
        const token = jwt.sign(
            { id: user.ID, role: user.role_name }, // Include correct role name
            SECRET_KEY,
            { expiresIn: '1h' }
        );
    
        // Return only necessary fields
        return {
            token,
            user: {
                ID: user.ID,
                username: user.username,
                email: user.email,
                role_name: user.role_name // Explicitly include role name
            }
        };
    });
    
    
};
