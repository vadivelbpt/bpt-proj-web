import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Select, message, Spin, Tag } from 'antd';
import { fetchProjects, fetchTaskByModuleId } from '../../services/userService';
import { SearchOutlined } from "@ant-design/icons";
import service from '../../services/adminapiservice';
import { ColumnsType } from 'antd/es/table';
import Alert from '../../components/Alert';

interface ModuleType {
    ID: any;
    id: number;
    name: string;
}

interface Task {
    [x: string]: any;
    ID: number;
    name: string;
    description: string;
    status: "Open" | "In Progress" | "Done" | "Closed";
}


interface Project {
    ID: any;
    key: React.Key;
    name: string;
    status: string;
    modules: ModuleType[];
}

interface User {
    ID: any;
    username: string;
}

const AdminTasks: React.FC = () => {

    const [openModule, setOpenModule] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("Open");
    const [taskName, setTaskName] = useState<string>('');
    const [desc, setDesc] = useState<string>('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<number | null>(null);
    const [selectedProjectID, setSelectedProjectID] = useState<number | null>(null);
    const [modules, setModules] = useState<ModuleType[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [searchText, setSearchText] = useState<string>('');

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
        fetchTaskByModuleId()
            .then((res) => setTasks(res.data.value))
            .catch(() => message.error("Failed to load roles"))
            .finally(() => setLoading(false));
    }, []);

    const handleProjectChange = (value: string) => {
        const project = projects.find(proj => proj.name === value);
        if (project) {
            setSelectedProject(value);
            setSelectedProjectID(project.ID)
            setSelectedModule(null);
            getProjectModulesByid(project.ID);
        }
    };

    const handleModuleChange = (value: number) => {
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

    const filteredTasks = tasks.filter(task =>
        task.ID.toString().includes(searchText) || task.title.toLowerCase().includes(searchText.toLowerCase()) || task.subProjectName.toLowerCase().includes(searchText.toLowerCase())
    );

    const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const handleView = (task: Task) => {
        setSelectedTask(task);
        setOpenUpdateModal(true);
    };


    const columns: ColumnsType<Task> = [
        {
            title: "S. No",
            key: "serialNumber",
            render: (_: any, __: any, index: number) => index + 1,
        },
        { title: "Task Ticket ID", dataIndex: "ID", key: "ID" },
        { title: "Client Name", dataIndex: "projectName", key: "projectName" },
        { title: "Project Name", dataIndex: "subProjectName", key: "subProjectName" },
        { title: "Task Name", dataIndex: "title", key: "title" },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: Task["status"]) => {
                let color = status === "Open" ? "blue" :
                    status === "In Progress" ? "orange" :
                        status === "Done" ? "green" : "red";
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: "Action",
            render: (_, record) => (
                <Button onClick={() => handleView(record)}>Update</Button>
            ),
        },
    ];

    const adminAddProject = () => {
        if (!selectedModule || !taskName || status === null) {
            alert("Please fill all required fields!");
            return;
        }
        setLoading(true)
        service.adminAddTask(selectedModule, taskName, status,desc)
            .then((response) => {
                if (response.status === 200) {
                    setUserAlert(true);
                    setAlertType("info");
                    setAlertMsg("Task Saved Succesfully");
                    setAlertClose(() => () => setUserAlert(false));
                }
                setTaskName("");
                setDesc("");
                setStatus("");
                setOpenModule(false);
                fetchTaskByModuleId().then((res) => setTasks(res.data.value));
            })
            .catch(() => message.error("Failed to save project"))
            .finally(() => setLoading(false))
    };

    const handleUpdate = () => {
        if (selectedTask) {
            console.log("Task ID:", selectedTask.ID);
            console.log("Module ID:", selectedTask.subProject_ID);
            console.log("Task Name:", selectedTask.title);
            console.log("Status:", selectedTask.status);
        }
        setOpenUpdateModal(false);
    };

    const adminUpdateProject = () => {
        if (!selectedTask || !selectedTask.ID || !selectedTask.subProject_ID) {
            message.error("Task ID and Module ID are required.");
            return;
        }
        service.adminTaskUpdate(selectedTask.ID, selectedTask.subProject_ID, selectedTask.title, selectedTask.status)
            .then((response) => {
                if (response.status === 200) {
                    setUserAlert(true);
                    setAlertType("info");
                    setAlertMsg("Task Update Succesfully");
                    setAlertClose(() => () => setUserAlert(false));
                }
                setOpenUpdateModal(false);
                fetchTaskByModuleId().then((res) => setTasks(res.data.value));
            })
            .catch(() => message.error("Failed to save project"));
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2>Manage Tasks</h2>
                <Button type="primary" onClick={() => { setOpenModule(true), setSelectedModule(null), setSelectedProject(null), setStatus("Open"), setTaskName("") }}>Add Task</Button>
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

            <Table dataSource={filteredTasks} loading={loading} columns={columns} rowKey="ID" />

            {/* Assign Users Modal */}
            <Modal
                title={`Add Task ${selectedUser ? `- ${selectedUser.username}` : ""}`}
                open={openModule}
                width={1000}
                footer={
                    <>
                        <Button type="primary" onClick={adminAddProject} disabled={loading}>
                            {loading ? <Spin /> : "Save"}
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
                        options={projects.map(proj => ({ value: proj.name, label: proj.name }))}
                    />

                    <Select
                        style={{ flex: "1 1 300px", height: "40px" }}
                        showSearch
                        placeholder="Select Project"
                        value={selectedModule}
                        onChange={handleModuleChange}
                        options={modules.map(mod => ({ value: mod.ID, label: mod.name }))}
                        disabled={!selectedProject}
                    />
                    <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} style={{ flex: "1 1 300px", height: "40px" }} placeholder="Enter Task Name" />

                    <Select
                        placeholder="Select Status"
                        style={{ width: '100%', height: '40px', marginBottom: '20px' }}
                        value={status}
                        onChange={(value) => setStatus(value)}
                    >
                        <Select.Option value="Open">Open</Select.Option>
                        <Select.Option value="In Progress">In Progress</Select.Option>
                        <Select.Option value="Done">Done</Select.Option>
                        <Select.Option value="Closed">Closed</Select.Option>
                    </Select>
                </div>
            </Modal>
            <Modal
                title="Update Task"
                open={openUpdateModal}
                width={600}
                footer={
                    <>
                        <Button type="primary" onClick={adminUpdateProject}>Update</Button>
                        <Button onClick={() => setOpenUpdateModal(false)}>Close</Button>
                    </>
                }
                onCancel={() => setOpenUpdateModal(false)}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                    <Input value={selectedTask?.projectName} disabled style={{ height: "40px" }} />
                    <Input value={selectedTask?.subProjectName} disabled style={{ height: "40px" }} />
                    <Input
                        value={selectedTask?.title}
                        onChange={(e) => selectedTask && setSelectedTask({ ...selectedTask, title: e.target.value })}
                        style={{ height: "40px" }}
                    />
                    <Select
                        placeholder="Select Status"
                        style={{ height: "40px" }}
                        value={selectedTask?.status}
                        onChange={(value) => selectedTask && setSelectedTask({ ...selectedTask, status: value })}
                    >
                        <Select.Option value="Open">Open</Select.Option>
                        <Select.Option value="In Progress">In Progress</Select.Option>
                        <Select.Option value="Done">Done</Select.Option>
                        <Select.Option value="Closed">Closed</Select.Option>
                    </Select>

                </div>
            </Modal>
            <Alert msg={alertMsg} open={userAlert} type={alertType} onClose={alertClose} title={"Alert"} />
        </div>
    );
};

export default AdminTasks;
