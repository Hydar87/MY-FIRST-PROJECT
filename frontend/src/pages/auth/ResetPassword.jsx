// src/pages/auth/ResetPassword.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from '../../api/axios';
import './Login.css';

const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const VERIFY_FORGOT_PASS_URL = 'api/auth/verifyFogotpass'; // Matches your backend route

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const errRef = useRef();

    // Grab email and code automatically passed from the previous VerifyResetCode page
    const email = location.state?.email || '';
    const code = location.state?.code || '';

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd]);

    useEffect(() => {
        setErrMsg('');
    }, [pwd, matchPwd]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validPwd || !validMatch) {
            setErrMsg('Please ensure your passwords meet the criteria and match.');
            return;
        }

        if (!email || !code) {
            setErrMsg('Session data (email or code) is missing. Please restart recovery.');
            return;
        }

        setIsSubmitting(true);

        try {
            await axios.post(
                VERIFY_FORGOT_PASS_URL,
                JSON.stringify({ 
                    email, 
                    code, 
                    password: pwd, 
                    confirmPassword: matchPwd 
                }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );

            // Successfully updated password! Automatically redirect to login page.
            navigate('/login');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else {
                setErrMsg(err.response?.data?.message || 'Password reset failed.');
            }
            errRef.current?.focus();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            
            <h1>Reset Password</h1>
            {email ? (
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
                    Creating a new password for: <b>{email}</b>
                </p>
            ) : (
                <p style={{ fontSize: '13px', color: 'red', marginBottom: '15px' }}>
                    Warning: Session expired or missing email.
                </p>
            )}

            <form onSubmit={handleSubmit} style={{ marginTop: '15px' }}>
                
                {/* New Password Field */}
                <label htmlFor="pwd">
                    New Password:
                    <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
                </label>
                <input
                    type="password"
                    id="pwd"
                    onChange={(e) => setPwd(e.target.value)}
                    value={pwd}
                    required
                    aria-invalid={validPwd ? "false" : "true"}
                    onFocus={() => setPwdFocus(true)}
                    onBlur={() => setPwdFocus(false)}
                />
                <p className={pwdFocus && pwd && !validPwd ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    8 to 24 characters.<br />
                    Must include uppercase, lowercase, number, and special character.
                </p>

                {/* Confirm Password Field */}
                <label htmlFor="confirm_pwd">
                    Confirm New Password:
                    <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                    <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
                </label>
                <input
                    type="password"
                    id="confirm_pwd"
                    onChange={(e) => setMatchPwd(e.target.value)}
                    value={matchPwd}
                    required
                    aria-invalid={validMatch ? "false" : "true"}
                    onFocus={() => setMatchFocus(true)}
                    onBlur={() => setMatchFocus(false)}
                />
                <p className={matchFocus && matchPwd && !validMatch ? "instructions" : "offscreen"}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    Must match the new password input field.
                </p>

                <button 
                    type="submit" 
                    disabled={!validPwd || !validMatch || isSubmitting || !email || !code}
                    style={{ marginTop: '15px' }}
                >
                    {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>

            <p style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <Link to="/login" style={{ textDecoration: 'none', color: '#6c757d' }}>
                    &larr; Back to Login
                </Link>
            </p>
        </section>
    );
};

export default ResetPassword;