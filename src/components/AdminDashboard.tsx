import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { UserOutlined, FilePptOutlined, LogoutOutlined, UserSwitchOutlined, ProjectOutlined, CheckSquareOutlined, TeamOutlined, BarChartOutlined, SolutionOutlined, FundProjectionScreenOutlined, ProfileOutlined } from "@ant-design/icons";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import UserPage from "../pages/Admin/ManageUsers";
import RolePage from "../pages/Admin/ManageRole";
import ProjectsList from "../pages/Admin/AssignProject";
import AdmProjects from "../pages/Admin/ManageProject";
import AdmReport from "../pages/Admin/ManageReport";
import UserProjects from "../pages/Users/UserProjects";
import AdminTasks from "../pages/Admin/AdminTasks";
import PmManageProject from "../pages/PM/PmManageProject";
import ManagePM from "../pages/Admin/ManagePM";
import { logo } from "./imageUrl";
import UserTimeLog from "../pages/Users/UserTimeLog";

const { Header, Content, Sider } = Layout;

const AdminDashboard: React.FC = () => {

    const [collapsed, setCollapsed] = useState(false);
    const roleId = localStorage.getItem("role")
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/"); // Redirect to login page after logout
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                <div style={{
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#001529",
                    padding: "30px"
                }}>
                    <img
                        src={logo}  // <-- Replace with your logo path
                        alt="Logo"
                        style={{
                            maxWidth: "100%",
                            height: "40px",
                            objectFit: "contain"
                        }}
                    />
                </div>
                <Menu theme="dark" mode="inline">
                    {roleId === "Admin" ? (
                        <>
                            <Menu.Item key="users" icon={<UserOutlined />}>
                                <Link to="/admin/users">Manage Users</Link>
                            </Menu.Item>
                            {/* <Menu.Item key="roles" icon={<TeamOutlined />}>
                                <Link to="/admin/roles">Manage Roles</Link>
                            </Menu.Item> */}
                            <Menu.Item key="admProjects" icon={<FundProjectionScreenOutlined />}>
                                <Link to="/admin/admProjects">Manage Clients</Link>
                            </Menu.Item>
                            <Menu.Item key="admTasks" icon={<CheckSquareOutlined />}>
                                <Link to="/admin/admTasks">Manage Tasks</Link>
                            </Menu.Item>
                            {/* <Menu.Item key="projects" icon={<UserSwitchOutlined />}>
                                <Link to="/admin/projects">Assign Projects</Link>
                            </Menu.Item> */}
                            <Menu.Item key="reports" icon={<BarChartOutlined />}>
                                <Link to="/admin/reports">Report</Link>
                            </Menu.Item>
                            <Menu.Item key="managepm" icon={<SolutionOutlined />}>
                                <Link to="/admin/managepm">Assign Clients</Link>
                            </Menu.Item>
                        </>

                    ) : roleId === "User" ? (
                        <>
                            {/* <Menu.Item key="userProjects" icon={<ProfileOutlined />}>
                                <Link to="/user/userprojects">My Projects</Link>
                            </Menu.Item> */}
                            <Menu.Item key="userTimeLog" icon={<ProfileOutlined />}>
                                <Link to="/user/userTimeLog">My Time Log</Link>
                            </Menu.Item>

                            
                        </>
                    ) : roleId === "PM" ? (
                        <>
                            <Menu.Item key="pmprojects" icon={<ProjectOutlined />}>
                                <Link to="/admin/pmprojects">Manage Clients</Link>
                            </Menu.Item>
                            <Menu.Item key="assignuser" icon={<UserSwitchOutlined />}>
                                <Link to="/admin/ProjectsList">Assign Users</Link>
                            </Menu.Item>
                            <Menu.Item key="reports" icon={<BarChartOutlined />}>
                                <Link to="/admin/reports">Report</Link>
                            </Menu.Item>
                        </>
                    ) : 
                    roleId === "Team Lead" ? (
                        <>
                            <Menu.Item key="userProjects" icon={<ProfileOutlined />}>
                                <Link to="/user/userprojects">My Projects</Link>
                            </Menu.Item>
                            {/* <Menu.Item key="reports" icon={<BarChartOutlined />}>
                                <Link to="/admin/reports">Manage Report</Link>
                            </Menu.Item> */}
                        </>
                    )
                     :
                        null}
                </Menu>
            </Sider>
            <Layout>
                <Header style={{ background: "#001529", padding: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingLeft: "20px", paddingRight: "20px" }}>
                        <span style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", color: "white" }}>
                            {roleId === "Admin" ? "Admin" : "User"}
                        </span>
                        <div style={{ cursor: "pointer", color: "white" }} onClick={handleLogout}>
                            <LogoutOutlined />
                        </div>
                    </div>


                </Header>
                <Content style={{ margin: "16px" }}>
                    <Routes>
                        {roleId === "Admin" && (
                            <>
                                <Route path="/users" element={<UserPage />} />
                                <Route path="/roles" element={<RolePage />} />
                                {/* <Route path="/projects" element={<ProjectsList />} /> */}
                                <Route path="/admProjects" element={<AdmProjects />} />
                                <Route path="/admTasks" element={<AdminTasks />} />
                                <Route path="/reports" element={<AdmReport />} />
                                <Route path="/managepm" element={<ManagePM />} />
                            </>
                        )}
                        {roleId === "User" && (
                            <>
                            {/* <Route path="/userprojects" element={<UserProjects />} /> */}
                            <Route path="/userTimeLog" element={<UserTimeLog />} />
                            </>
                            
                        )}
                        {roleId === "PM" && (
                            <>
                                <Route path="/pmprojects" element={<PmManageProject />} />
                                <Route path="/ProjectsList" element={<ProjectsList />} />
                                <Route path="/reports" element={<AdmReport />} />
                            </>
                        )}
                        {roleId === "Team Lead" && (
                            <>
                                 <Route path="/userprojects" element={<UserProjects />} />
                                 {/* <Route path="/reports" element={<AdmReport />} /> */}
                            </>
                        )}
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminDashboard;
