import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Select, message, Checkbox, Spin ,notification} from 'antd';
import type { TableColumnsType } from 'antd';
import { fetchProjects, fetchUsers } from '../../services/userService';
import { SearchOutlined } from "@ant-design/icons";
import service from '../../services/adminapiservice';
import Alert from '../../components/Alert';
import { TableRowSelection } from 'antd/es/table/interface';


interface ModuleType {
    ID: any;
    id: number;
    name: string;
}

interface Project {
    ID: any;
    id: number;
    name: string;
    description: string;
}


interface User {
    user_ID: any;
    ID: any;
    username: string;
}

const ManagePM: React.FC = () => {

    const [openModule, setOpenModule] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<number | null>(null);
    const [selectedProjectID, setSelectedProjectID] = useState<number | null>(null);
    const [modules, setModules] = useState<ModuleType[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    type AlertType = "error" | "info" | "success" | "yesorno";

    const [userAlert, setUserAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState<AlertType>("info");
    const [alertClose, setAlertClose] = useState<() => void>(() => () => { });

    useEffect(() => {
        setLoading(true);
        fetchProjects()
            .then((res) => setProjects(res.data.value))
            .catch(() => message.error("Failed to load projects"))
            .finally(() => setLoading(false));
            
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchUsers()
            .then((res) => {
                const pmUsers = res.data.value.filter((user: any) => user.roleName === "PM"); // Filter only PMs
                setUsers(pmUsers);
            })
            .catch(() => message.error("Failed to load users"))
            .finally(() => setLoading(false));
    }, []);


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
        if (!selectedUser) {
            console.log(selectedUser,"selected User")
            alert("Please select a user.");
            return;
        }

        if (selectedProjectIDs.length === 0) {
            alert("Please select at least one project.");
            return;
        }
        setLoading(true)
        const payload = {
            user_ID: selectedUser.user_ID,
            project_IDs: selectedProjectIDs.map(projectID => ({ ID: projectID }))
        };
        service.addProjectToUser(payload)
            .then((response) => {
                console.log(response,"response")
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
                    setAlertMsg("Project Manager Assigned Succesfully");
                    setAlertClose(() => () => setUserAlert(false));
                    setSelectedProject(null);
                    setSelectedModule(null);
                }
                else if (response.status === 409) {
                    setUserAlert(true);
                    setAlertType("error");
                    setAlertMsg("Project Manager already assigned to this project");
                    setAlertClose(() => () => setUserAlert(false));
                }
                setOpenModule(false);
                // fetchUsers().then((res) => setUsers(res.data.value));
            })
            .catch(() => message.error("Failed to save project"))
            .finally(() => setLoading(false));
    };


    const columns: TableColumnsType<User> = [
        { title: 'S.No', dataIndex: 'index', render: (_, __, index) => index + 1 },
        { title: 'User Name', dataIndex: 'username', key: 'username' },
        { title: 'email', dataIndex: 'email', key: 'email' },

        {
            title: 'Assign Clients',
            render: (_, record) => (
                <Button onClick={() => {
                    setSelectedUser(record);
                    setOpenModule(true);
                    setSelectedModule(null);
                    setSelectedProject(null);
                }}>+</Button>
            )
        }
    ];

    const [selectedProjectIDs, setSelectedProjectIDs] = useState<string[]>([]);

    const rowSelection: TableRowSelection<Project> = {
        selectedRowKeys: selectedProjectIDs,
        onChange: (selectedRowKeys, selectedRows) => {
            const formattedProjectIDs = selectedRows.map(row => ({ ID: row.ID }));

            setSelectedProjectIDs(selectedRowKeys as string[]);
            console.log("Selected Project IDs:", JSON.stringify({ project_IDs: formattedProjectIDs }));
        },
    };
    const projectColumns: TableColumnsType<Project> = [
        { title: 'S.No', dataIndex: 'index', render: (_, __, index) => index + 1 },
        { title: 'Client Name', dataIndex: 'name', key: 'name' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
    ];


    const filteredTasks = users.filter(users =>
        users.username.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Project Managers</h2>
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
            <Modal title={`Project Manager Name ${selectedUser ? `- ${selectedUser.username}` : ""}`} open={openModule} width={1000}
                footer={
                    <>
                        <Button type="primary" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving" : "Save"}
                        </Button>
                        <Button onClick={() => setOpenModule(false)}>Close</Button>
                    </>
                }
                onCancel={() => setOpenModule(false)}
            >
                <div style={{ marginTop: "20px" }}>
                    <Table<Project>
                        loading={loading}
                        rowSelection={rowSelection}
                        columns={projectColumns}
                        dataSource={projects}
                        rowKey="ID"
                    />
                </div>
            </Modal>
            <Alert msg={alertMsg} open={userAlert} type={alertType} onClose={alertClose} title={"Alert"} />
        </div>
    );
};

export default ManagePM;
