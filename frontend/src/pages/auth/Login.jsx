import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "../../api/axios";
import useAuth from "../../hooks/useAuth"; 

import "./Login.css";

const LOGIN_URL = "/api/auth/login";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const userRef = useRef();
    const errRef = useRef();

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);
    const [isUnverified, setIsUnverified] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        userRef.current.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
        setIsUnverified(false);
    }, [email, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                LOGIN_URL,
                { email, password },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            console.log("API Login Response:", response.data);
            const accessToken = response?.data?.accessToken;
            const publicId = response?.data?.user?.publicId;
            const role = response?.data?.user?.role; // Adjust if your backend includes role inside user

            console.log("accessToken:", accessToken, "Role:", role, "PublicId:", publicId);
            // Save token to your in-memory Auth state
            login(accessToken, role, publicId); 
            
            setEmail('');
            setPassword('');
            setSuccess(true);

            // Redirect seamlessly to your protected user dashboard
            navigate('/userDashboard', { replace: true });

        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Email or Password');
            } else if (err.response?.status === 401) {
                setErrMsg('Invalid Email or Password');
            } else if (err.response?.status === 403) {
                setErrMsg(err.response?.data.message || 'Account not verified.');
                setIsUnverified(true);
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    };

    const handleNavigateToVerify = () => {
        navigate('/verifyEmail', { state: { email } });
    };

    return (
        <div className="login-container">
            {success ? (
                <section>
                    <h1>You are logged in!</h1>
                    <br />
                    <p>Redirecting to your dashboard...</p>
                </section>
            ) : (
                <section className="form-card">
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">
                        {errMsg}
                        {isUnverified && (
                            <span style={{ display: 'block', marginTop: '8px' }}>
                                <button 
                                    type="button" 
                                    onClick={handleNavigateToVerify}
                                    style={{ background: 'none', border: 'none', color: '#0056b3', textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}
                                >
                                    Click here to verify your email
                                </button>
                            </span>
                        )}
                    </p>
                    
                    <h1>Login</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            ref={userRef}
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            required
                        />
                        
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                        />

                        <div style={{ textAlign: 'right', marginTop: '5px' }}>
                            <Link to="/forgotPassword" style={{ fontSize: '13px', color: '#007BFF', textDecoration: 'none' }}>
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit">Login</button>
                        
                        <p>
                            Don't have an account? <br />
                            <span className="line">
                                <Link to="/register">Sign Up</Link>
                            </span>
                        </p>
                    </form>
                </section>
            )}
        </div>
    );
}

export default Login;