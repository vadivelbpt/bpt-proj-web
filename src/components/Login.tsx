import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, message, Spin } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios";
import { login } from "../services/authService";
import { gp_logo } from "./imageUrl";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        console.log("Handle login called");
        setLoading(true);

        try {
            const { user, token } = await login(username, password);
            console.log("User:", user);
            console.log("Token:", token);

            // Ensure user and role exist
            if (!user || !user.role_name) {
                console.error("Role name is missing from user:", user);
                message.error("Unexpected error: Role is missing.");
                return;
            }

            console.log("User role:", user.role_name);
            message.success("Login successful!");

            // Navigate based on role after state update
            setTimeout(() => {
                switch (user.role_name) {
                    case "Admin":
                        console.log("Navigating to /admin/users...");
                        navigate("/admin/users");
                        break;
                    case "User":
                        console.log("Navigating to /user/userprojects...");
                        navigate("/user/userTimeLog");
                        break;
                    case "PM":
                        console.log("Navigating to /admin/pmprojects...");
                        navigate("/admin/pmprojects");
                        break;
                    case "Team Lead":
                        console.log("Navigating to /admin/pmprojects...");
                        navigate("/user/userprojects");
                        break;
                    default:
                        console.error("Unknown role:", user.role_name);
                        alert("Unauthorized role.");
                }
            }, 100);
        }
        catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please check your credentials.");
        }
        finally {
            setLoading(false);
        }
    };
    // const handleLogin = async () => {
    //     console.log("Handle login called");
    //     setLoading(true)
    //     try {
    //         const { user, token } = await login(username, password);
    //         console.log("User:", typeof user.role_name);
    //         console.log("Token:", token);

    //         // Ensure user and role exist
    //         if (!user || !user.role_name) {
    //             console.error("Role name is missing from user:", user);
    //             message.error("Unexpected error: Role is missing.");
    //             return;
    //         }

    //         console.log("User role:", user.role_name);

    //         // if (user.role_name !== "Admin") {  // Validate role by name
    //         //     message.error("You are not authorized to access this page.");
    //         //     return;
    //         // }

    //         message.success("Login successful!");

    //         // Ensure state updates before navigating
    //         setTimeout(() => {
    //             if (user.role_name === "Admin") {
    //                 console.log("Navigating to /admin/users...");
    //                 navigate("/admin/users");
    //             }
    //             else if (user.role_name === "User") {
    //                 console.log("users...");
    //                 navigate("/user/userprojects");
    //             }
    //             else if (user.role_name === "PM") {
    //                 console.log("pm");
    //                 navigate("/admin/pmprojects")
    //             }

    //         }, 100);

    //     } 
    //     catch (error) {
    //         console.error("Login failed:", error);
    //         alert("Network error");
    //     }

    // };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Left Side */}
                <div style={styles.leftSide}>
                    <h2 style={styles.title}>Project Management Tool</h2>
                    <img
                        src={gp_logo}  // <-- Replace with your logo path
                        alt="Logo"
                        style={{
                            maxWidth: "100%",
                            height: "350px",
                            objectFit: "contain"
                        }}
                    />
                </div>

                {/* Right Side */}
                <div style={styles.rightSide}>
                    <div style={styles.avatar}>
                        <UserOutlined style={{ fontSize: 40, color: "#fff" }} />
                    </div>
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="User Name"
                        style={styles.input}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                        style={styles.input}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {/* <a style={styles.forgotPassword}>
                        Forgot your password?
                    </a> */}
                    <Button type="primary" style={styles.loginButton} onClick={handleLogin} disabled={loading}>
                        {loading ? "Loading..." : "LOGIN"}
                    </Button>
                    {/* <a style={styles.createAccount}>
                        Create new account
                    </a> */}
                </div>
            </div>
        </div>
    );
};

// Inline Styles
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
    },
    card: {
        display: "flex",
        width: 1000,
        height: 550,
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
    },
    leftSide: {
        flex: 1,
        background: "linear-gradient(135deg, #4F46E5,rgb(255, 230, 222))",
        color: "#fff",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "left",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        lineHeight: "1.5",
    },
    rightSide: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
    },
    avatar: {
        width: 70,
        height: 70,
        background: "linear-gradient(135deg, #4F46E5, rgb(255, 230, 222))",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15,
    },
    input: {
        width: "100%",
        height: 40,
        marginBottom: 15,
    },
    forgotPassword: {
        fontSize: 12,
        color: "#888",
        marginBottom: 15,
    },
    loginButton: {
        width: "100%",
        height: 40,
        background: "linear-gradient(135deg, #4F46E5, rgb(255, 230, 222))",
        border: "none",
        fontSize: 16,
    },
    createAccount: {
        fontSize: 12,
        color: "#888",
        marginTop: 10,
    },
};

export default Login;
