import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthContext, { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyResetCode from "./pages/auth/VerifyResetCode"; 
import ResetPassword from "./pages/auth/ResetPassword" 

import UserDashboard from './pages/user/UserDashboard';

function App() {
   
    return(
        <Router>
        <main className="App">
            <AuthProvider>
                <Routes>
                    {/*public routes*/}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verifyEmail" element={<VerifyEmail />} />
                    <Route path="/forgotPassword" element={<ForgotPassword />} />
                    <Route path="/verifyResetCode" element={<VerifyResetCode />} />
                    <Route path="/resetPassword" element={<ResetPassword />} />                   

                    {/*protectend routes*/}

                    <Route element={<ProtectedRoute />} >
                    <Route path="/userDashboard" element={<UserDashboard />} />
                    </Route>
                                    
                </Routes>
            </AuthProvider>
        </main>
        </Router>
    );
}
export default App;