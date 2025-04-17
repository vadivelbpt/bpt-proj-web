import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Tooltip, message, Select, DatePicker, TimePicker, Tag, Row, Col, Table } from 'antd';
import { PlusOutlined, InfoCircleOutlined, UserOutlined, ProjectOutlined, FilePptOutlined, ApartmentOutlined } from '@ant-design/icons';
import service from '../../services/adminapiservice';
import { fetchProjects } from '../../services/userService';
import Alert from '../../components/Alert';
import { data } from 'react-router-dom';
import dayjs from 'dayjs';


interface ModuleType {
    module_ID: string;
    module_name: string;
}

interface Project {
    [x: string]: any;
    key: React.Key;
    name: any;
    age: any;
    address: any;
    modules: ModuleType[];
}

interface TaskType {
    ID: string;
    title: string;
    status: string;
    description: string | null;
}

const UserProjects: React.FC = () => {
    const [openProject, setOpenProject] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const [openModule, setOpenModule] = useState<boolean>(false);

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [loggedTasks, setLoggedTasks] = useState([]);

    type AlertType = "error" | "info" | "success" | "yesorno";

    const [userAlert, setUserAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [date, setDate] = useState<string>("");
    const [desc, setDesc] = useState("");
    const [hours, setHours] = useState("");
    const [ticketno, setTicketno] = useState("");
    const [alertType, setAlertType] = useState<AlertType>("info");
    const [alertClose, setAlertClose] = useState<() => void>(() => () => { });

    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [showLogTable, setShowLogTable] = useState(false);

    const handleViewLog = () => {
        setShowLogTable(!showLogTable);
        if (!showLogTable) {
            getloggedTaskList();
        }
    };

    const userid = localStorage.getItem("userID");

    useEffect(() => {
        getProjectsByUserId();

    }, []);

    const getProjectsByUserId = () => {
        setLoading(true);
        service.getProjectsById(userid)
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data, "Projects & Modules");
                    setProjects(response.data.data);
                    if (response.data.data.length > 0) {
                        setSelectedProject(response?.data?.data || []); // Set first project as default
                    }
                }
            })
            .catch(() => message.error("Failed to load projects"))
            .finally(() => setLoading(false));
    };

    const getTasksByModuleId = (moduleId: string) => {
        setLoading(true);
        service.getTasksByModuleId(moduleId)
            .then((response) => {
                if (response.status === 200) {
                    const fetchedTasks = response?.data?.value[0]?.data || [];
                    setTasks(fetchedTasks);
                }
            })
            .catch(() => message.error("Failed to load tasks"))
            .finally(() => setLoading(false));
    };

    const getloggedTaskList = () => {
        if (!selectedTaskId) {
            message.error("Task ID is missing!");
            return;
        }
        setLoading(true);
        service.usergettaskById(selectedTaskId, userid)
            .then((response) => {
                console.log(response, "GET Logged Time");
                if (response.status === 200) {
                    setLoggedTasks(response.data.value[0].data || []);
                }
            })
            .catch(() => message.error("Failed to load tasks"))
            .finally(() => setLoading(false));
    };


    const adminAddTimeLog = () => {
        if (selectedTaskId == null || !date || !hours || !desc) {
            alert("Please fill all required fields!");
            return;
        }
        setLoading(true);
        const projectId = selectedProject?.project_ID || "";
        const moduleId = selectedModuleId || "";
        service.userAddTimeLog(userid, selectedTaskId, projectId, moduleId, date, hours, desc,ticketno)
            .then((response) => {
                if (response.status === 200) {
                    setUserAlert(true);
                    setAlertType("success");
                    setAlertMsg("Time Log Saved Successfully");
                    setAlertClose(() => () => setUserAlert(false));

                    // setOpenModule(false);
                    setDate("");
                    setHours("");
                    setDesc("");
                    getloggedTaskList();
                }
            })
            .catch(() => message.error("Failed to save time log"))
            .finally(() => setLoading(false));
    };

    const resetTimeLogFields = () => {
        setDate("");
        setHours("");
        setDesc("");
    };
    const handleCloseModal = () => {
        setShowLogTable(false)
        setOpenModule(false);
        resetTimeLogFields();
    };

    const columns = [
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Hours",
            dataIndex: "hours",
            key: "hours",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        }
    ];

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>My Projects</h2>
            </div>

            <div style={{ display: 'flex', gap: '20px', height: '100vh', background: '#f4f5f7' }}>

                {/* Projects Column */}
                <Card title="Projects" style={{ flex: 1, border: '2px solid #FCE7F3', borderRadius: '10px', height: '650px', overflowY: 'auto', padding: '10px' }}>
                    {projects?.length > 0 ? (
                        projects.map(project => (
                            <Card
                                key={project?.project_ID ?? `unknown-${Math.random()}`}
                                style={{ border: '2px solid #D4E4FC', marginBottom: '10px', borderRadius: '8px', cursor: "pointer" }}
                                onClick={() => { project && setSelectedProject(project), setTasks([]); }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <p>
                                        <ProjectOutlined style={{ marginRight: '8px' }} />
                                        {project?.project_name || "Unnamed Project"}
                                    </p>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p style={{ textAlign: "center", color: "#999" }}>No projects available</p>
                    )}
                </Card>

                {/* Modules Column */}
                {/* <Card
                    title={selectedProject?.project_name ? `Modules (Project: ${selectedProject.project_name})` : "Modules"}
                    style={{
                        flex: 1,
                        border: '2px solid #FCE7F3',
                        borderRadius: '10px',
                        height: '650px',
                        overflowY: 'auto',
                        padding: '10px'
                    }}
                >
                    {selectedProject ? (
                        projects
                            .filter(proj => proj?.project_ID === selectedProject?.project_ID)
                            .map(proj => (
                                <Card
                                    key={proj.module_ID}
                                    style={{
                                        border: '2px solid #FFEDD5',
                                        marginBottom: '10px',
                                        borderRadius: '8px',
                                        cursor: "pointer"
                                    }}
                                    onClick={() => {
                                        setSelectedModuleId(proj.module_ID);
                                        getTasksByModuleId(proj.module_ID);
                                        localStorage.setItem("ProjectID", selectedProject?.project_ID || '');
                                        localStorage.setItem("ModuleID", proj.module_ID);
                                    }}
                                >
                                    <div style={{ display: "flex" }}>
                                        <ApartmentOutlined />
                                        <p style={{ marginLeft: "10px" }}>
                                            {proj.module_name.length > 15 ? proj.module_name.substring(0, 15) + "..." : proj.module_name}
                                        </p>
                                    </div>
                                </Card>
                            ))
                    ) : (
                        <p style={{ textAlign: "center", color: "#999" }}>Select a project to view its modules</p>
                    )}
                </Card> */}
                <Card
                    title={
                        <>
                            <span>Modules</span>
                            {selectedProject?.project_name && (
                                <span style={{ fontSize: "14px", color: "gray", marginLeft: "10px" }}>
                                    (Project Name: {selectedProject.project_name})
                                </span>
                            )}
                        </>
                    }
                    style={{
                        flex: 1,
                        border: '2px solid #FCE7F3',
                        borderRadius: '10px',
                        height: '650px',
                        overflowY: 'auto',
                        padding: '10px'
                    }}
                >
                    {selectedProject && Array.isArray(selectedProject.modules) ? (
                        selectedProject.modules.length > 0 ? (
                            selectedProject.modules.map(module => (
                                <Card
                                    key={module?.module_ID || Math.random()} // Fallback key if module_ID is missing
                                    style={{
                                        border: '2px solid #FFEDD5',
                                        marginBottom: '10px',
                                        borderRadius: '8px',
                                        cursor: "pointer"
                                    }}
                                    onClick={() => {
                                        if (module?.module_ID) {
                                            setSelectedModuleId(module.module_ID);
                                            getTasksByModuleId(module.module_ID);
                                            localStorage.setItem("ProjectID", selectedProject?.project_ID || '');
                                            localStorage.setItem("ModuleID", module.module_ID);
                                        }
                                    }}
                                >
                                    <div style={{ display: "flex" }}>
                                        <ApartmentOutlined />
                                        <p style={{ marginLeft: "10px" }}>
                                            {module?.module_name
                                                ? module.module_name.length > 15
                                                    ? module.module_name.substring(0, 15) + "..."
                                                    : module.module_name
                                                : "Unnamed Module"}
                                        </p>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <p style={{ textAlign: "center", color: "#999" }}>No modules available</p>
                        )
                    ) : (
                        <p style={{ textAlign: "center", color: "#999" }}>Select a project to view its modules</p>
                    )}
                </Card>



                {/* Tasks Column */}
                <Card title="Tasks" style={{ flex: 1, border: '2px solid #FCE7F3', borderRadius: '10px', height: '650px', overflowY: 'auto', padding: '10px' }}>
                    {selectedModuleId ? (
                        tasks.length > 0 ? (
                            tasks.map(task => (
                                <Card key={task.ID} style={{ border: '2px solid #E0F2FE', marginBottom: '10px', borderRadius: '8px' }}>
                                    <span style={{ marginBottom: "10px", fontSize: "12px" }}><a style={{ color: "orange" }}>Ticket Id : - </a> {task.ID}</span>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <p> {task.title.length > 25
                                            ? task.title.substring(0, 25) + "..."
                                            : task.title}
                                        </p>

                                    </div>
                                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                        <div style={{ marginTop: "10px" }}>
                                            <Tag color={
                                                task.status === "Open" ? "blue" :
                                                    task.status === "In Progress" ? "orange" :
                                                        task.status === "Done" ? "green" : "red"
                                            }>
                                                {task?.status}
                                            </Tag>
                                        </div>
                                        <div style={{ marginTop: "2%" }} onClick={() => setOpenModule(true)}>
                                            <Button onClick={() => {
                                                setSelectedTaskId(task.ID);
                                                setSelectedTask(task);
                                            }} disabled={task.status === "Done"}>Time Log</Button>
                                        </div>

                                    </div>

                                </Card>
                            ))
                        ) : <p style={{ textAlign: "center", color: "#999" }}>No tasks available for this module</p>
                    ) : <p style={{ textAlign: "center", color: "#999" }}>Select a module to view its tasks</p>}
                </Card>


                <Modal title="Add Time Log" open={openModule} width={1000}
                    footer={
                        <>
                            <Button onClick={handleViewLog} style={{ marginLeft: "10px" }} disabled={loading}>
                                {showLogTable ? "Hide My Time Log" : "View My Time Log"}
                            </Button>
                            <Button type="primary" onClick={() => { adminAddTimeLog(); }} disabled={loading}>
                                {loading ? "Saving" : "Save"}
                            </Button>

                            <Button onClick={() => handleCloseModal()}>Close</Button>

                        </>
                    } onCancel={() => handleCloseModal()}>
                    <div style={{ marginTop: "0px" }}>
                        <div style={{ display: 'flex', gap: "5px", flexDirection: 'column', marginBottom: "10px", justifyContent: "center" }}>
                            <span style={{ color: 'red', fontWeight: "bold" }}>Task Details</span>
                            <span style={{ color: "black", fontWeight: "bold", marginBottom: "10px" }}>{selectedTask ? selectedTask.title : "No Task Name"}</span>
                        </div>
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <DatePicker
                                    style={{ height: "40px", width: "100%" }}
                                    placeholder="Select Date *"
                                    value={date ? dayjs(date) : null}   // Ensures the input is controlled
                                    onChange={(date, dateString: any) => setDate(dateString)}
                                    suffixIcon={
                                        <Tooltip title="Select a date">
                                            <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                                        </Tooltip>
                                    }
                                />
                            </Col>
                            <Col xs={24} sm={12}>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    min={0}
                                    max={99}
                                    style={{ height: "40px", width: "100%" }}
                                    placeholder="Total Hours *"
                                    value={hours}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (/^\d{0,2}$/.test(value)) {  // Ensures max 2 digits
                                            setHours(value);
                                        }
                                    }}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    suffix={
                                        <Tooltip title="Total hours">
                                            <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                                        </Tooltip>
                                    }
                                />
                            </Col>
                        </Row>
                    </div>
                    <div style={{ marginTop: "20px" }}>
                        <Input.TextArea
                            rows={2} // Adjust the number of rows
                            value={desc}
                            style={{ width: "100%", paddingRight: "30px" }}
                            placeholder="Enter description *"
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>
                    {showLogTable && (
                        <div style={{ marginTop: "20px" }}>
                            <h3>Logged Time Entries</h3>
                            <Table columns={columns} dataSource={loggedTasks} rowKey="userTask_ID" pagination={false} />
                        </div>
                    )}

                </Modal>
                <Alert msg={alertMsg} open={userAlert} type={alertType} onClose={alertClose} title={"Alert"} />
            </div>
        </>
    );
};

export default UserProjects;

