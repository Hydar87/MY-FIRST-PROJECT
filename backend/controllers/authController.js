
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const SQL = require('sql-template-strings'); // or require('../config/db')
// import generateVerificationCode file function
const {
   generateVerificationCode, 
   hashCode 
  } = require("../utils/generateVerificationCode");

  // import emailService file function
const { 
  sendVerificationEmail ,
  sendForgotEmail,
} = require("../services/emailService");

// import token file function
const { 
  generateAccessToken, 
  generateRefreshToken, 
  hashToken, 
} = require("../utils/token");

const { error } = require("console");

const register = async (req, res) => {
  const client = await pool.connect();
  let released = false; // Track release state

  try {
    const { username, email, password } = req.body;

    const { rows: exists } = await client.query(SQL`SELECT public_id FROM users WHERE email = ${email} `);

    if (exists.length > 0) { 
      // Release client before returning early
      client.release();
      released = true;
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query('BEGIN');

    const { rows } = await client.query(SQL`INSERT INTO users (email, username, password) VALUES (${email}, ${username}, ${hashedPassword}) RETURNING public_id, email`);

    const newUser = rows[0];

    await client.query(SQL`INSERT INTO user_roles (public_id, role_id) VALUES (${newUser.public_id}, 101)`); 

    const code = generateVerificationCode();
    const hashedCode = hashCode(code);

    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);
    await client.query(SQL`INSERT INTO email_verifications (public_id, code, expires_at) VALUES (${newUser.public_id}, ${hashedCode}, ${expiresAt})`);
    
    await client.query('COMMIT'); 

    // Release the client back to the pool immediately after commit
    client.release();
    released = true;

    // Send email outside the transaction/database lifecycle
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
    if (client && !released) { 
      try {
        await client.query('ROLLBACK'); 
      } catch (rollbackErr) {
        // Ignore rollback errors if connection is already dead
      }
    }

    console.error("Registration error:", error);
    return res.status(500).json({ message: "Internal server error" });

  } finally {
    if (client && !released) { 
      client.release(); 
    } 
  }
};
// Resend verification code
const resendVerification = async (req, res) => {

  const client = await pool.connect();
  try {
    const { email } = req.body;

    await client.query('BEGIN');
    // 1. Find the user
   const { rows } = await client.query(SQL`SELECT public_id, is_verified, email FROM users WHERE email = ${email} `);

    if (rows.length === 0) { return res.status(404).json({ message: "User not found" });}

    const user = rows[0];
    // 2. Check if email is already verified
    if (user.is_verified === 1) { return res.status(400).json({message: "Email is already verified" });}

    // 3. Generate a NEW verification code
    const code = generateVerificationCode();
    const hashedCode = hashCode(code);

  // 1. Check if a code record already exists for this public_id
    const { rows: existingCodes } = await pool.query(SQL`SELECT public_id FROM email_verifications WHERE public_id = ${user.public_id}`);

    const updatedAt = new Date(Date.now());
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);
    
   if (existingCodes.length > 0) {
   await client.query(SQL` UPDATE email_verifications SET code = ${hashedCode}, expires_at = ${expiresAt}, updated_at = ${updatedAt} WHERE public_id = ${user.public_id} `);
    } else {
  // Insert new verification code
  await client.query(SQL`INSERT INTO email_verifications (public_id, code, expires_at) VALUES (${user.public_id}, ${hashedCode}, ${expiresAt})`);
   }
     await client.query('COMMIT'); // Commit both database inserts

    // 5. Send the new code
    try{
       await sendVerificationEmail(user.email, code);
  } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }
    // 6. Response
    return res.status(200).json({ message: "A new verification code has been sent to your email.", requiresVerification: true });

  } catch (error) {
    if(client) { await client.query('ROLLBACK'); } // Rollback transaction on error
    
    console.error("Resend verification error:", error);
    return res.status(500).json({ message: "Internal server error"});
  } finally{
    if(client) { client.release(); } // Release the client back to the pool
  }
};
// Verify email
const  verifyEmail= async (req, res) => {
  const client = await pool.connect(); // Get a client from the pool
  try {
    const { email, code } = req.body;

    // 1. Find the user
    await client.query('BEGIN'); // Start transaction
    const {rows} = await client.query(
      SQL`SELECT u.public_id, u.email,u.is_verified, r.name AS role
           FROM users u
           LEFT JOIN user_roles ur ON u.public_id = ur.public_id
           LEFT JOIN roles r ON ur.role_id = r.role_id
           WHERE u.email = ${email}
           LIMIT 1`
    );

    if (rows.length === 0) {return res.status(404).json({message: "User not found"});}

    const user = rows[0];
    // 2. Check if email is already verified
    if (user.is_verified === true) { return res.status(400).json({ message: "Email is already verified" }); }
    
    // 3. Get the verification record
    const {rows: verifications}  = await client.query(SQL`SELECT * FROM email_verifications WHERE public_id = ${user.public_id}`);

    if (verifications.length === 0) { return res.status(404).json({ message: "Verification code not found"});}

       const incomingcode = hashCode(code);
    const verification = verifications[0];

    if (verification.code !== incomingcode) { return res.status(400).json({message: "Invalid verification code" });}

    const currentTime = new Date(Date.now());
    if(currentTime > verification.expires_at){
      return res.status(400).json({ message: "Verification code has expired. Please request a new code."});
    }
    // 6. Mark user's email as verified
    await client.query(SQL`UPDATE users SET is_verified = true, updated_at = ${currentTime} WHERE public_id = ${user.public_id}`);
    await client.query(SQL` DELETE FROM email_verifications WHERE public_id = ${user.public_id}`);

        // 5. Generate access token
     const accessToken = generateAccessToken(user);
     const refreshToken = generateRefreshToken();
     const hashedToken = hashToken(refreshToken);
     
     const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
     await client.query(SQL`INSERT INTO refresh_tokens (public_id, token, expires_at) VALUES (${user.public_id}, ${hashedToken}, ${expiresAt})`,);

    // 10. Send refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000
    });

    
    await client.query('COMMIT'); // Commit both database updates
    //  Success
      return res.status(200).json({
      message: "Email verified successfully",
      accessToken,
      user: { publicId: user.public_id, email: user.email, role: user.role, }
    });

  } catch (error) {
    if(client) { await client.query('ROLLBACK'); } // Rollback transaction on error
    console.error("Verify email error:", error);

    return res.status(500).json({ message: "Internal server error"});
  }finally {
    if(client) { client.release(); } // Release the client back to the pool
  }
};
// Login API// Login API
const login = async (req, res) => {

  const client = await pool.connect(); // Get a client from the pool
  try {
    const { email, password } = req.body;
    
    // 1. Find user
    await client.query('BEGIN'); // Start transactionconst 
    const { rows: exists } = await client.query(
      SQL`SELECT u.public_id, u.email, u.password, u.is_active, u.is_verified, r.name AS role
           FROM users u
           LEFT JOIN user_roles ur ON u.public_id = ur.public_id
           LEFT JOIN roles r ON ur.role_id = r.role_id
           WHERE u.email = ${email}
           LIMIT 1`
    );
    // 2. Check user
    if (exists.length === 0) { return res.status(401).json({ message: "Invalid email or password"});}
    const user = exists[0];

    // 3. Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) { return res.status(401).json({message: "Invalid email or password"});}
    
    if (user.is_active !== true) {
            return res.status(403).json({ message: "Your email is inactive. Contact support Dest to activate", requiresSupportDesk: true});
    }

    // 4. Check email verification
    if (user.is_verified !== true) {
      return res.status(403).json({ message: "Your email is not verified. Please verify your account to log in.", requiresVerification: true});
    }
    // 5. Generate access token
    const accessToken = generateAccessToken(user);
     const refreshToken = generateRefreshToken();
     const hashedToken = hashToken(refreshToken);
     
     const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
     
    await client.query(SQL`INSERT INTO refresh_tokens (public_id, token, expires_at) VALUES (${user.public_id}, ${hashedToken}, ${expiresAt})`);

    // 10. Send refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 2 * 24 * 60 * 60 * 1000
    });

    await client.query('COMMIT'); // Commit both database inserts
    const userIp = req.ip;
     
    console.log("my ip",userIp)
    // 11. Return access token + user
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: { publicId: user.public_id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    if(client) { await client.query('ROLLBACK'); } // Rollback transaction on error
    console.error("Login error:", error);

    return res.status(500).json({ message: "Internal server error"});
  }finally {
    if(client) { client.release(); } // Release the client back to the pool
  }
};
// refresh token api
const refreshToken =  async (req, res) => {
  const client = await pool.connect(); // Get a client from the pool
  try{ 
    //get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
  await client.query('BEGIN'); // Start transaction
        const hashRefresh = hashToken(refreshToken);
        //check if refresh token is valid and exists in database
          const { rows } = await client.query(SQL`
               SELECT rf.public_id, rf.token, rf.expires_at, r.name AS role_name, u.email
                FROM refresh_tokens rf LEFT JOIN users u ON rf.public_id = u.public_id
                LEFT JOIN user_roles ur ON rf.public_id = ur.public_id
                LEFT JOIN roles r ON ur.role_id = r.role_id
                WHERE rf.token = ${hashRefresh}
                LIMIT 1
              `);

        if (rows.length === 0) {return res.status(403).json({ message: 'Forbidden' }); }
       const user = rows[0];

       const currentTime= new Date(Date.now());
       const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days

      if (currentTime > user.expires_at ) { return res.status(400).json({ message: "Verification code has expired. Please request a new code." }); }
        // create a new access token
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        const hashedToken = hashToken(newRefreshToken);
                // 1. Delete any existing refresh token for this user firs

          // 2. Then insert the new refresh token safely
          await client.query(
            SQL`UPDATE refresh_tokens SET token= ${hashedToken},updated_at = ${currentTime}, expires_at = ${expiresAt} WHERE token = ${hashRefresh}`
          );

            res.clearCookie('refreshToken', {
              httpOnly: true,
              secure: false, // Set to true if using HTTPS in production
              sameSite: 'Strict',
            });
            // send new refresh token to client as http only cookie
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'Strict',
                maxAge: 2 * 24 * 60 * 60 * 1000 // 5 hours
            });
            await client.query('COMMIT'); // Commit both database updates
            // return new access token to client
            res.status(200).json({
                accessToken: newAccessToken,              
                message: 'Token refreshed successfully',
                user: { publicId: user.public_id, role: user.role_name, email: user.email}
            });
       }catch (error) {
       if(client) { await client.query('ROLLBACK'); } // Rollback transaction on error
           res.status(500).json({ message: 'Internal server error' });
            console.log(error);
        } finally{ if(client) { client.release(); } }   
}
// forgot password
const forgotPassword = async(req , res) =>{
const client = await pool.connect(); // Get a client from the pool
try{
  const {email} = req.body;
  //check email if exists
  const { rows } = await client.query(SQL`SELECT public_id, email FROM users WHERE email = ${email}`);
  if(rows.length===0){ return res.status(400).json({  message: "User does not exists"})}

    const user = rows[0];
    const code = generateVerificationCode();
    const hashedCode = hashCode(code);

      await client.query('BEGIN'); // Start transaction

      // 1. Check if a code record already exists for this public_id
    const { rows: existingCodes } = await client.query(SQL`SELECT public_id FROM forgot_passwords WHERE public_id = ${user.public_id}`);
        
      const currentTime = new Date();
      const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

    if (existingCodes.length > 0) {
  // Update existing verification code
   await client.query(SQL` UPDATE forgot_passwords SET code = ${hashedCode} , updated_at=${currentTime}, expires_at=${expiresAt} WHERE public_id = ${user.public_id} `);
    } else {
  // Insert new verification code
  //await client.query(SQL`INSERT INTO forgot_passwords (public_id, code, expires_at) VALUES (${user.public_id}, ${hashedCode}, ${expiresAt}`);
  await client.query(SQL`INSERT INTO forgot_passwords (public_id, code, expires_at) VALUES (${user.public_id}, ${hashedCode}, ${expiresAt})`);
   }
      await client.query('COMMIT'); // Commit both database inserts

           await sendForgotEmail(user.email, code);

    // 6. Response
    return res.status(200).json({ message: "A new verification code has been sent to your email.", requiresVerification: true});
   
  }catch(error){
    await client.query('ROLLBACK'); // Rollback transaction on error
    console.log(error);
    console.error("Forgot password error:", error);
    res.status(500).json({ message:"internal server error"})
    }finally{
      if (client) { client.release(); }
    }
  }

const verifypassCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        // 2. Check if the user exists
        const { rows } = await pool.query(SQL`SELECT public_id FROM users WHERE email = ${email}`);
        if (rows.length === 0) {
            return res.status(400).json({ message: "User does not exist" });
        }

        const user = rows[0];
        const hashedCode = hashCode(code);

        // 3. Query the forgot_passwords table for a matching hash and check expiration
        const { rows: exists } = await pool.query(
            SQL`SELECT public_id, code, expires_at FROM forgot_passwords WHERE public_id = ${user.public_id} AND code = ${hashedCode}`
        );

        if (exists.length === 0) {
            return res.status(400).json({ message: "Invalid code" });
        }

        const record = exists[0];
        const currentTime = new Date(Date.now());

        // 4. Check if the code has expired
        if (currentTime > record.expires_at) {
            return res.status(400).json({ message: "Verification code has expired" });
        }

        // 5. Code is valid
        return res.status(200).json({ message: "Code verified successfully" });

    } catch (err) {
        console.error("Verification error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
const verifyFogotpassword = async (req , res) =>{
  const client = await pool.connect();
  try{
  const {email, code, password} = req.body;

    const { rows } = await client.query(SQL`SELECT public_id FROM users WHERE email = ${email}`);

    if (rows.length === 0) { return res.status(400).json({ message: "Invalid or expired code" }); }
    const user = rows[0];
    const hashedCode = hashCode(code);

          await client.query('BEGIN'); // Start transaction
     const { rows: records} = await client.query(SQL`SELECT * FROM forgot_passwords  WHERE public_id = ${user.public_id} AND code = ${hashedCode} AND expires_at > NOW()`);
    if (records.length === 0) { return res.status(400).json({ message: "Invalid or expired code" }); }

    const currentTime = new Date(Date.now());
    const record = records[0];
    if(currentTime > record.expires_at){
      return res.status(400).json({message:"verification code has expired . request for another code"})
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await client.query(SQL`UPDATE users SET password = ${hashedPassword} , updated_at = ${currentTime} WHERE public_id = ${user.public_id}`);

    // 5. Delete the used code so it can never be reused
    await client.query(SQL`DELETE FROM forgot_passwords WHERE public_id = ${user.public_id}`);
    await client.query('COMMIT'); // Commit both database updates

    return res.status(200).json({ message: "Password reset successfully. You can now log in.",});
  } catch (error) {
    if(client) { await client.query('ROLLBACK'); } // Rollback transaction on error
    console.error("Verify forgot password error:", error);

    return res.status(500).json({ message: "Something went wrong",});
  }finally{ if(client) { client.release(); } }
}
//change password
const changePassword = async (req , res) =>{
  const client = await pool.connect();
  try{
  //take current password from user
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.public_id;

  if (!userId) {return res.status(401).json({ message: "Unauthorized access" });}
  
  await client.query('BEGIN'); // Start transaction
  const { rows } = await client.query(SQL`SELECT password FROM users WHERE public_id = ${userId}`);

   if (rows.length === 0) {return res.status(404).json({ message: "unauthorized access" });}

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isMatch) { return res.status(401).json({ message: "Incorrect current password" });}

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const currentTime = new Date(Date.now());
    await client.query(SQL`UPDATE users SET password = ${hashedPassword}, updated_at = ${currentTime} WHERE public_id = ${userId}`);

 // 6. Revoke all active sessions across devices
    await client.query(SQL`DELETE FROM refresh_tokens WHERE public_id = ${userId}`);

        await client.query('COMMIT'); 

    // 7. Clear the active refresh token cookie on current client
    res.clearCookie("refreshToken", { 
      path: "/api/refresh",
      httpOnly: true,
      secure: "false",
      sameSite: "strict"
    });
    // Commit both database updated

    return res.status(200).json({
      message: "Password changed successfully. Please log in again with your new password.",
    });

  } catch (error) {
    if(client) { await client.query('ROLLBACK'); } // Rollback transaction on error
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }finally{
    if (client) {client.release();} // Release the client back to the pool
  }
};
//logout
const logout = async (req, res) => {
  const client = await pool.connect();
  try {
    const token = req.accessToken; 
    const user = req.user.public_id;        
     //2. Revoke the Refresh Token from MySQL
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const hashedRefreshToken = hashToken(refreshToken);
      await client.query(SQL`DELETE FROM refresh_tokens WHERE token = ${hashedRefreshToken}`);
    }
    const expiresAt = new Date(req.user.exp * 1000);
    if (token) {
      const hashedAccessToken = hashToken(token);
      await client.query(SQL`INSERT INTO invalid_tokens (token, public_id, expires_at) VALUES (${hashedAccessToken}, ${user}, ${expiresAt})
        ON CONFLICT (token) DO NOTHING`);
    }

    // 3. Clear the httpOnly Refresh Token cookie on the client
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/api/refresh",
    });
    await client.query('COMMIT'); // Commit both database updates
    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    if (client) {await client.query('ROLLBACK');} // Rollback transaction on error}
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (client) {client.release();} // Release the client back to the pool
  }
}

module.exports = {
  register,
  resendVerification,
  verifyEmail,
  login,
  refreshToken,
  forgotPassword,
  verifypassCode,
  verifyFogotpassword,
  changePassword,
  logout,
};