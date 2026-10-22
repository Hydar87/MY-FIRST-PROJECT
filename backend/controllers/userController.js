const pool = require("../config/db");
const SQL = require('sql-template-strings')
const getProfile = async (req, res) => {

    try {
        // Get public_id from the verified access token
        const publicId = req.user.public_id;
        if(!publicId){
            res.status(403).json({ message: "Unauthorized access" })
        }
        // Find that specific user
        const {rows} = await pool.query(SQL`SELECT public_id, email, username, created_at FROM users WHERE public_id = ${publicId}`);
        // User doesn't exist
        if (rows.length === 0) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Send profile to frontend
        res.status(200).json({
            success: true,
            profile: rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Internal server error'
        });
    }
  }
module.exports ={
    getProfile,
}