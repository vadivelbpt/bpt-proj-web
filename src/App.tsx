import React, { JSX } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';  // Install: npm install jwt-decode
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";


// Define JWT Token Type
interface DecodedToken {
    id: string;
    role: string;
    exp: number;
}

// Function to validate authentication and role
const isAuthenticated = (): boolean => {
    const token = localStorage.getItem("token");

    if (!token) return false;

    try {
        const decoded: DecodedToken = jwtDecode(token);

        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            return false;
        }

        // Store role in localStorage (only if valid)
        localStorage.setItem("role", decoded.role);
        return decoded.role === "Admin" || decoded.role === "User";
    } catch (error) {
        console.error("Invalid token", error);
        return false;
    }
};

// Private Route Wrapper
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
};

// Main App Component
const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/user/*" element={<AdminDashboard />} />
                {/* <Route path="*" element={<Navigate to="/admin/users" />} /> */}
            </Routes>
        </Router>
    );
};

export default App;
