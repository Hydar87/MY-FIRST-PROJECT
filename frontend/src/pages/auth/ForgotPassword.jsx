// src/pages/auth/ForgotPassword.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import './Login.css';

const FORGOT_PWD_URL = 'api/auth/forget';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const emailRef = useRef();
    const errRef = useRef();

    const [email, setEmail] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post(
                FORGOT_PWD_URL,
                JSON.stringify({ email }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );

            // Redirect to the Reset Password page with email context
            navigate('/verifyResetCode', { state: { email } });

        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 404) {
                setErrMsg('Email address not found.');
            } else {
                setErrMsg('Failed to send reset code. Try again.');
            }
            errRef.current?.focus();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Forgot Password</h1>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                Enter your account email to receive a 6-digit reset code.
            </p>

            <form onSubmit={handleSubmit}>
                <label htmlFor="email">Email Address:</label>
                <input
                    type="email"
                    id="email"
                    ref={emailRef}
                    autoComplete="off"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                />

                <button type="submit" disabled={isSubmitting} style={{ marginTop: '20px' }}>
                    {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                </button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Remembered your password? <br />
                <span className="line">
                    <Link to="/login">Back to Login</Link>
                </span>
            </p>
        </section>
    );
};

export default ForgotPassword;