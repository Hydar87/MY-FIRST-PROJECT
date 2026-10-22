import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useLocation, Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import useAuth from "../../hooks/useAuth"; // Added to match your Login component

const VERIFY_URL = 'api/auth/verify-email'; 
const RESEND_URL = 'api/auth/resend-verification'; 

const VerifyEmail = () => {
    const { login } = useAuth(); // Initialized auth hook
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    
    // Grab email passed from the Register page or Login fallback
    const email = location.state?.email || ''; 
    const urlCode = searchParams.get('code') || '';

    // State for the 6 boxes: array of 6 empty strings
    const [codeArr, setCodeArr] = useState(
        urlCode.length === 6 ? urlCode.split('') : ['', '', '', '', '', '']
    );
    const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'error'
    const [message, setMessage] = useState('');
    const [resendMessage, setResendMessage] = useState('');
    const [isResending, setIsResending] = useState(false);

    // Refs to manage focus across the 6 inputs
    const inputRefs = useRef([]);

    // Auto-verify if code passed via URL is complete (6 digits) and we have an email
    useEffect(() => {
        if (urlCode.length === 6 && email) {
            verifyCode(urlCode);
        }
    }, [urlCode, email]);

    const handleInputChange = (value, index) => {
        // Only allow numbers
        if (isNaN(value)) return;

        const newCodeArr = [...codeArr];
        // Take only the last typed character if multiple are entered
        newCodeArr[index] = value.substring(value.length - 1);
        setCodeArr(newCodeArr);

        // Move to next input if value is entered and not the last box
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Move to previous input on Backspace if current box is empty
        if (e.key === 'Backspace' && !codeArr[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        if (pasteData.length === 6 && !isNaN(pasteData)) {
            const newCodeArr = pasteData.split('');
            setCodeArr(newCodeArr);
            inputRefs.current[5]?.focus(); // Focus last box
        }
    };

    const verifyCode = async (codeString) => {
        if (codeString.length < 6) {
            setStatus('error');
            setMessage('Please enter all 6 digits of the verification code.');
            return;
        }

        if (!email) {
            setStatus('error');
            setMessage('No email address found. Please try logging in or registering again.');
            return;
        }

        setStatus('verifying');
        setMessage('Verifying your code...');

        try {
            const response = await axios.post(
                VERIFY_URL,
                JSON.stringify({ email, code: codeString }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            setStatus('success');
            setMessage(response?.data?.message || 'Email verified successfully! Logging you in...');

            console.log("API Verification Response:", response.data);
            const accessToken = response?.data?.accessToken;
            const publicId = response?.data?.user?.publicId;
            const role = response?.data?.user?.role; 

            console.log("accessToken:", accessToken, "Role:", role, "PublicId:", publicId);
            
            // Save token and user details to your in-memory Auth state (just like Login)
            login(accessToken, role, publicId); 

            // Redirect seamlessly to your protected user dashboard after a brief pause
            setTimeout(() => {
                navigate('/userDashboard', { replace: true });
            }, 1000);

        } catch (err) {
            setStatus('error');
            if (!err?.response) {
                setMessage('No Server Response.');
            } else if (err.response?.status === 400) {
                setMessage('Invalid or expired code.');
            } else {
                setMessage(err.response?.data?.message || 'Verification failed. Please try again.');
            }
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const fullCode = codeArr.join('');
        verifyCode(fullCode);
    };

    const handleResendCode = async () => {
        if (!email) {
            setResendMessage('Cannot resend: Email is missing.');
            return;
        }

        setIsResending(true);
        setResendMessage('');

        try {
            const response = await axios.post(
                RESEND_URL,
                JSON.stringify({ email }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            setResendMessage(response?.data?.message || 'A new verification code has been sent to your email.');
        } catch (err) {
            setResendMessage('Failed to resend code. Please try again later.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Verify Your Email</h2>
            {email ? (
                <p style={{ fontSize: '14px', color: '#555' }}>
                    We've sent a 6-digit code to <b>{email}</b>
                </p>
            ) : (
                <p style={{ fontSize: '14px', color: 'red' }}>
                    Warning: Email context missing. Please try logging in to access verification.
                </p>
            )}

            {status !== 'success' ? (
                <form onSubmit={handleFormSubmit} style={{ marginTop: '20px' }}>
                    {/* 6 Input Boxes Container */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }} onPaste={handlePaste}>
                        {codeArr.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleInputChange(e.target.value, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                style={{
                                    width: '40px',
                                    height: '45px',
                                    fontSize: '20px',
                                    textAlign: 'center',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px'
                                }}
                                disabled={status === 'verifying'}
                            />
                        ))}
                    </div>
                    
                    <button 
                        type="submit" 
                        style={{ width: '100%', padding: '10px', fontSize: '16px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        disabled={status === 'verifying'}
                    >
                        {status === 'verifying' ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>
            ) : null}

            {message && (
                <p style={{ marginTop: '20px', color: status === 'success' ? 'green' : 'red', fontWeight: 'bold' }}>
                    {message}
                </p>
            )}

            {status !== 'success' && (
                <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
                    <p style={{ fontSize: '14px', color: '#666' }}>Didn't receive the code?</p>
                    <button 
                        onClick={handleResendCode} 
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#007BFF', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
                        disabled={isResending}
                    >
                        {isResending ? 'Resending...' : 'Resend Code'}
                    </button>
                    {resendMessage && <p style={{ fontSize: '13px', color: '#333', marginTop: '5px' }}>{resendMessage}</p>}
                </div>
            )}
        </div>
    );
};

export default VerifyEmail;