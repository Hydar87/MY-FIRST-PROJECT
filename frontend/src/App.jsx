import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import AuthContext, { AuthProvider } from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";


import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyResetCode from "./pages/auth/VerifyResetCode"; 
import ResetPassword from "./pages/auth/ResetPassword" 

import UserDashboard from './pages/user/UserDashboard';
import UserDetails from './pages/admin/UserDetails';

import DownloadButton from './pages/auth/Pdf'



function App() {
   
    return(
        <Router>
        <main className="App">
            <AuthProvider>
                <Routes>
                    {/*public routes*/}

                    <Route path="/verifyEmail" element={<VerifyEmail />} />
                    <Route path="/forgotPassword" element={<ForgotPassword />} />
                    <Route path="/verifyResetCode" element={<VerifyResetCode />} />
                    <Route path="/resetPassword" element={<ResetPassword />} />  
                    <Route path="/pdf" element={<DownloadButton />} />     

                    {/*GuestRoute*/}        
                    <Route element={<GuestRoute />} >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    </Route>

                    {/*protectend routes*/}
                    <Route element={<ProtectedRoute />} >
                    <Route path="/userDashboard" element={<UserDashboard />} />

                    {/* Route matching http://localhost:5173/admin/users/:public_id */}
                    <Route path="/admin/users/:public_id" element={<UserDetails />} />
                    </Route>
                                    
                </Routes>
            </AuthProvider>
        </main>
        </Router>
    );
}
export default App;