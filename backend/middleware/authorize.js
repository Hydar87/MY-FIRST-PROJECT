const { default: SQL } = require('sql-template-strings');
const pool = require("../config/db");

const authorize = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            const public_id = req.user.public_id; 

            const result = await pool.query(SQL`
                SELECT 1 
                FROM user_roles ur
                JOIN role_permissions rp ON ur.role_id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.permission_id
                WHERE ur.public_id = ${public_id} AND p.name = ${requiredPermission}
                LIMIT 1;
            `);

            if (result.rows.length === 0) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions.' });
            }

            next();
        } catch (err) {
            console.error('Authorization error:', err);
            res.status(500).json({ error: 'Internal server error during authorization.' });
        }
    };
};

module.exports = {
    authorize
};