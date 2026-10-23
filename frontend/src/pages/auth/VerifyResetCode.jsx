// src/pages/auth/VerifyResetCode.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import './Login.css';

const VERIFY_CODE_URL = 'api/auth/verifycode'; // Matches your backend router path
const RESEND_URL = 'api/auth/forget'; // Matches your backend route to resend code

const VerifyResetCode = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const errRef = useRef();
    const inputRefs = useRef([]);

    // Grab email carried over from ForgotPassword page
    const email = location.state?.email || '';
    const [codeArr, setCodeArr] = useState(['', '', '', '', '', '']);
    const [errMsg, setErrMsg] = useState('');
    const [resendMsg, setResendMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        errRef.current?.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [codeArr]);

    const handleCodeChange = (value, index) => {
        if (isNaN(value)) return;
        const newArr = [...codeArr];
        newArr[index] = value.substring(value.length - 1);
        setCodeArr(newArr);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !codeArr[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        if (pasteData.length === 6 && !isNaN(pasteData)) {
            setCodeArr(pasteData.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerifyAndNext = async (e) => {
        e.preventDefault();
        const code = codeArr.join('');

        if (code.length < 6) {
            setErrMsg('Please enter all 6 digits.');
            return;
        }

        if (!email) {
            setErrMsg('Email context missing. Please restart password recovery.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Verify code with backend
            await axios.post(
                VERIFY_CODE_URL,
                JSON.stringify({ email, code }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );

            // Directly navigate to Reset Password page without showing success screen
            navigate('/resetPassword', { state: { email, code } });

        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg(err.response?.data?.message || 'Invalid or expired code.');
            } else {
                setErrMsg('Verification failed.');
            }
            errRef.current?.focus();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) {
            setResendMsg('Email missing. Cannot resend code.');
            return;
        }

        setIsResending(true);
        setResendMsg('');

        try {
            await axios.post(
                RESEND_URL,
                JSON.stringify({ email }),
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            setResendMsg('A new reset code has been sent to your email.');
        } catch (err) {
            setResendMsg('Failed to resend code. Try again later.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <section>
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
            <h1>Enter Reset Code</h1>
            {email ? (
                <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>
                    Code sent to: <b>{email}</b>
                </p>
            ) : (
                <p style={{ fontSize: '13px', color: 'red', marginBottom: '15px' }}>
                    Warning: Email address missing. Please request a new code.
                </p>
            )}

            <form onSubmit={handleVerifyAndNext}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '15px 0' }} onPaste={handlePaste}>
                    {codeArr.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={(el) => (inputRefs.current[idx] = el)}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleCodeChange(e.target.value, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            style={{ width: '38px', height: '42px', textAlign: 'center', fontSize: '18px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    ))}
                </div>

                <button type="submit" disabled={isSubmitting || !email} style={{ marginTop: '10px' }}>
                    {isSubmitting ? 'Verifying...' : 'Next'}
                </button>
            </form>

            {/* Resend Code Section */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#666' }}>Didn't receive the code?</p>
                <button
                    type="button"
                    onClick={handleResendCode}
                    style={{ background: 'none', border: 'none', color: '#007BFF', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px', padding: 0 }}
                    disabled={isResending}
                >
                    {isResending ? 'Resending...' : 'Resend Code'}
                </button>
                {resendMsg && <p style={{ fontSize: '12px', color: '#333', marginTop: '5px' }}>{resendMsg}</p>}
            </div>

            {/* Back to Login */}
            <p style={{ marginTop: '25px', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <Link to="/login" style={{ textDecoration: 'none', color: '#6c757d' }}>
                    &larr; Back to Login
                </Link>
            </p>
        </section>
    );
};

export default VerifyResetCode;