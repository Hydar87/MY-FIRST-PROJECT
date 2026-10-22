const pool = require("../config/db");
const SQL = require('sql-template-strings');

const getAllUsers = async (req, res) => {
  try {
    // 1. Pagination parameters (defaults to page 1, 10 users per page)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // 2. Fetch total count for frontend pagination controls
    const countResult = await pool.query(
      SQL`SELECT COUNT(*) AS total FROM users`
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // 3. Fetch user accounts sorted by creation date (newest first) using SQL template strings
    const { rows: users } = await pool.query(
      SQL`SELECT u.public_id, u.email, u.username, u.created_at, u.active, r.name AS role
           FROM users u
           LEFT JOIN user_roles ur ON u.public_id = ur.public_id
           LEFT JOIN roles r ON ur.role_id = r.role_id
           ORDER BY u.created_at DESC 
           LIMIT ${limit} OFFSET ${offset}`
      );

    // 4. Return structured response
    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          totalUsers: total,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          pageSize: limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin user accounts:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching users",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { public_id } = req.params; // Can be user_id or public_id depending on your schema

    // Fetch single user with their role joined
    const { rows } = await pool.query(
      SQL`SELECT u.public_id, u.email,u.username u.created_at, u.active, r.name AS role
           FROM users u
           LEFT JOIN user_roles ur ON u.public_id = ur.public_id
           LEFT JOIN roles r ON ur.role_id = r.role_id
           WHERE u.public_id = ${public_id}
           LIMIT 1`
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: rows[0],
      },
    });
  } catch (error) {
    console.error("Error fetching single user details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching user details",
    });
  }
};

module.exports = { getAllUsers, getUserById };