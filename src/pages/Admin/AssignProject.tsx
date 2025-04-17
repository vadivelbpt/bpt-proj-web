import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Select, message, Checkbox, Spin } from 'antd';
import type { TableColumnsType } from 'antd';
import { fetchProjects, fetchUsers } from '../../services/userService';
import { SearchOutlined } from "@ant-design/icons";
import service from '../../services/adminapiservice';
import Alert from '../../components/Alert';

interface ModuleType {
    ID: any;
    id: number;
    name: string;
}

interface Project {
    project_ID: any;
    project_name: string;
    ID: any;
    key: React.Key;
    name: string;
    status: string;
    modules: ModuleType[];
}

interface User {
    ID: any;
    username: string;
    user_ID: any
}

const ProjectsList: React.FC = () => {
    const [openModule, setOpenModule] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<string[]>([]);
    const [selectedProjectID, setSelectedProjectID] = useState<number | null>(null);
    const [modules, setModules] = useState<ModuleType[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    type AlertType = "error" | "info" | "success" | "yesorno";

    const [userAlert, setUserAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState<AlertType>("info");
    const [alertClose, setAlertClose] = useState<() => void>(() => () => { });
    const [assignedUsers, setAssignedUsers] = useState([]);

    const userid = localStorage.getItem("userID");

    useEffect(() => {
        getProjectsByUserId();
    }, []);

    const getProjectsByUserId = () => {
        setLoading(true);
        service.pmgetProjectsById(userid)
            .then((response) => {
                console.log(response, "assigned users")
                if (response.status === 200) {
                    setProjects(response?.data?.data || []);
                }
            })
            .catch(() => alert({ message: "Failed to load projects" }))
            .finally(() => setLoading(false));
    };

    const getAssignedUsers = () => {
        setLoading(true);
        service.getProjectsById(userid)
            .then((response) => {
                console.log(response, "assigned users")
                if (response.status === 200) {
                    setAssignedUsers(response?.data?.data || []);
                }
            })
            .catch(() => alert({ message: "Failed to load projects" }))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        setLoading(true);
        fetchUsers()
            .then((res) => {
                const pmUsers = res.data.value.filter((user: any) => user.roleName === "User" || user.roleName === "Team Lead"); // Filter only PMs
                setUsers(pmUsers);
            })
            .catch(() => message.error("Failed to load users"))
            .finally(() => setLoading(false))
    }, []);

    // useEffect(() => {
    //     fetchUsers()
    //         .then((res) => setUsers(res.data.value))
    //         .catch(() => message.error("Failed to load users"));
    // }, []);

    const handleProjectChange = (value: string) => {
        const project = projects.find(proj => proj.project_name === value);
        if (project) {
            setSelectedProject(value);  // Store ID instead of name
            setSelectedProjectID(project.project_ID)
            setSelectedModule([]);
            getProjectModulesByid(project.project_ID);
        }
    };

    const handleModuleChange = (value: string[]) => {
        setSelectedModule(value);
    };

    const getProjectModulesByid = (projectId: any) => {
        service.getProjectModulesByid(projectId)
            .then((response) => {
                if (response.status === 200) {
                    setModules(response.data.value);
                }
            })
            .catch(() => message.error("Failed to load modules"));
    };

    const handleSave = () => {
        if (!selectedUser || !selectedModule) {
            alert("Please select all fields before saving.");
            return;
        }
        setLoading(true);
        const modulesPayload = selectedModule.map(moduleID => ({ ID: moduleID }));
        service.addProjectToUsers(selectedUser.user_ID, selectedProjectID, modulesPayload)
            .then((response) => {
                console.log(response, "response error")
                if (response.data.value?.errors?.length > 0) {
                    const errorMessages = response.data.value.errors.join("\n"); // Join errors into a single string
                    setUserAlert(true);
                    setAlertType("error");
                    setAlertMsg(errorMessages);
                    setAlertClose(() => () => setUserAlert(false));
                    return;
                }
                if (response.status === 200) {
                    setUserAlert(true);
                    setAlertType("info");
                    setAlertMsg("User Assigned Succesfully");
                    setAlertClose(() => () => setUserAlert(false));

                    setSelectedProject(null);
                    setSelectedModule([]);
                }
                else if (response.status === 409) {
                    setUserAlert(true);
                    setAlertType("error");
                    setAlertMsg("User already assigned to this project");
                    setAlertClose(() => () => setUserAlert(false));
                }
                setOpenModule(false);
                // fetchUsers().then((res) => setUsers(res.data.value));
            })
            .catch(() => message.error("Failed to save project"))
            .finally(() => setLoading(false))
    };


    const columns: TableColumnsType<User> = [
        { title: 'S.No', dataIndex: 'index', render: (_, __, index) => index + 1 },
        { title: 'User Name', dataIndex: 'username', key: 'username' },
        { title: 'email', dataIndex: 'email', key: 'email' },

        {
            title: 'Assign Module',
            render: (_, record) => (
                <Button onClick={() => {
                    setSelectedUser(record);
                    setOpenModule(true);
                    setSelectedModule([]);
                    setSelectedProject(null);
                }}>+</Button>
            )
        }
    ];


    const filteredTasks = users.filter(users =>
        users.username.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Assign Module</h2>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Input
                    placeholder="Search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: 16, width: 300 }}
                    prefix={<SearchOutlined />}
                />
            </div>

            <Table<User> columns={columns} loading={loading} dataSource={filteredTasks} />

            {/* Assign Users Modal */}
            <Modal
                title={`Assign Projects ${selectedUser ? `- ${selectedUser.username}` : ""}`}
                open={openModule}
                width={600}
                footer={
                    <>
                        <Button type="primary" onClick={handleSave} disabled={loading}>
                            {loading ? "Assigning" : "Save"}
                        </Button>
                        <Button onClick={() => setOpenModule(false)}>Close</Button>
                    </>
                }
                onCancel={() => setOpenModule(false)}
            >
                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "20px" }}>
                    <Select
                        style={{ flex: "1 1 300px", height: "40px" }}
                        showSearch
                        placeholder="Select Client"
                        value={selectedProject}
                        onChange={handleProjectChange}
                        options={projects.map(proj => ({ value: proj.project_name, label: proj.project_name }))}
                    />

                    <Select
                        mode="multiple"
                        style={{ flex: "1 1 300px", height: "38px" }}
                        showSearch
                        placeholder="Select Project"
                        value={selectedModule}
                        onChange={handleModuleChange}
                        options={modules.map(mod => ({ value: mod.ID, label: mod.name }))}
                        disabled={!selectedProject}
                    />
                </div>
            </Modal>
            <Alert msg={alertMsg} open={userAlert} type={alertType} onClose={alertClose} title={"Alert"} />
        </div>
    );
};

export default ProjectsList;
