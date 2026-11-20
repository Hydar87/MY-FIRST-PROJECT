const { rows } = await client.query(SQL`
  SELECT
    u.public_id,
    u.email,
    u.is_verified,
    COALESCE(
      ARRAY_AGG(r.name) FILTER (WHERE r.name IS NOT NULL),
      ARRAY[]::TEXT[]
    ) AS roles

  FROM users u

  LEFT JOIN user_roles ur
    ON u.public_id = ur.public_id

  LEFT JOIN roles r
    ON ur.role_id = r.role_id

  WHERE u.email = ${email}

  GROUP BY
    u.public_id,
    u.email,
    u.is_verified

  FOR UPDATE OF u
`);
const register = async (req, res) => {
  const client = await pool.connect();
  let committed = false;
  try {
    const { username, email, password } = req.body;

    await client.query('BEGIN');
    const { rows: exists } = await client.query(SQL
      `SELECT public_id FROM users WHERE email = ${email} `
    );

    if (exists.length > 0) { 
      await client.query('ROLLBACK')
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { rows } = await client.query(SQL
      `INSERT INTO users (email, username, password) 
      VALUES (${email}, ${username}, ${hashedPassword}) 
      RETURNING public_id, email`);

    const newUser = rows[0];

    await client.query(SQL`
      INSERT INTO user_roles (public_id, role_id) VALUES (${newUser.public_id}, 101)
      `); 

    const code = generateVerificationCode();
    const hashedCode = hashCode(code);

    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);
    await client.query(SQL`INSERT INTO email_verifications (public_id, code, expires_at) VALUES (${newUser.public_id}, ${hashedCode}, ${expiresAt})`);
    
    await client.query('COMMIT'); 
    committed = true;

    try {
      await sendVerificationEmail(newUser.email, code);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return res.status(201).json({
      message: "User registered successfully. Please check your email for the verification code.",
      requiresVerification: true,
      user: { publicId: newUser.public_id, email: newUser.email }
    });

  } catch (error) {
    if(!committed){
      try {
        await client.query('ROLLBACK'); 
      } catch (rollbackErr) {
      }
    }

    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });

  } finally {
      client.release(); 
    } 
};