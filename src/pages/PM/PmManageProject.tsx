import React, { useEffect, useState } from "react";
import { Collapse, Button, Spin, notification, Card, Row, Col, Modal, Input, Tooltip, Table, Select, Tag, DatePicker } from "antd";
import { DownOutlined, UserOutlined, InfoCircleOutlined, EditOutlined } from "@ant-design/icons";
import service from "../../services/adminapiservice";
import dayjs from 'dayjs';

const { Panel } = Collapse;
const { RangePicker } = DatePicker;

interface Project {
    ID: string;
    project_ID: string;
    project_name: string;
    statusFlag: boolean;
}

interface ModuleType {
    ID: string;
    name: string;
    description: string;
    statusflag: boolean;
    startDate: any;
    endDate: any;
}


interface Task {
    ID: string;
    task_name: string;
    assigned_to: string;
    status: string;
}

const PmManageProject: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
    const [modules, setModules] = useState<Record<string, ModuleType[]>>({});
    const [activeKeys, setActiveKeys] = useState<string[]>([]);

    // States for Add Module
    const [openModule, setOpenModule] = useState<boolean>(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [Tasks, setTasks] = useState<any>("");
    const [description, setDescription] = useState<string>("");
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [selectedModule, setSelectedModule] = useState<ModuleType | null>(null);

    const [openTaskModal, setOpenTaskModal] = useState<boolean>(false);
    const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    const [tname, settname] = useState<string>("");
    const [taskdesc, settaskdesc] = useState<string>("");
    const [status, setStatus] = useState<string>("Open");

    const userid = localStorage.getItem("userID");

    useEffect(() => {
        getProjectsByUserId();
    }, []);

    const getProjectsByUserId = () => {
        setLoading(true);
        service.pmgetProjectsById(userid)
            .then((response) => {
                if (response.status === 200) {
                    setProjects(response?.data?.data || []);
                }
            })
            .catch(() => notification.error({ message: "Failed to load projects" }))
            .finally(() => setLoading(false));
    };

    const toggleProjectModules = (projectId: string) => {
        if (expandedProjectId === projectId) {
            setExpandedProjectId(null);
        } else {
            setExpandedProjectId(projectId);
            if (!modules[projectId]) {
                fetchProjectModules(projectId);
            }
        }

        setActiveKeys((prevKeys) =>
            prevKeys.includes(projectId) ? prevKeys.filter((key) => key !== projectId) : [...prevKeys, projectId]
        );
    };

    const fetchProjectModules = (projectId: string) => {
        setLoading(true);
        service.getProjectModulesByid(projectId)
            .then((response) => {
                if (response.status === 200) {
                    setModules((prev) => ({ ...prev, [projectId]: response.data.value }));
                }
            })
            .catch(() => notification.error({ message: "Failed to load modules" }))
            .finally(() => setLoading(false));
    };

    const adminAddModule = () => {
        if (!selectedProjectId || !Tasks.trim()) {
            notification.error({ message: "Please select a project and enter a module name!" });
            return;
        }
        const statusflag = true;

        service.adminAddModule(selectedProjectId, Tasks, statusflag, description, startDate, endDate)
            .then((response) => {
                if (response.status === 200) {
                    notification.success({ message: "Module Saved Successfully" });
                    fetchProjectModules(selectedProjectId); // Refresh module list
                }
                setTasks("");
                setDescription("");
                setOpenModule(false);
            })
            .catch(() => notification.error({ message: "Failed to save module" }));
    };

    const updateModule = () => {
        if (!selectedModule || !Tasks.trim()) {
            notification.error({ message: "Please select a project and enter a module name!" });
            return;
        }
        const statusflag = true;

        service.updateModule(selectedModule.ID, Tasks, statusflag, description, startDate, endDate)
            .then((response) => {
                if (response.status === 200) {
                    alert("Module Updated Successfully");
                    if (selectedProjectId) {
                        fetchProjectModules(selectedProjectId);
                    }
                }
                setTasks("");
                setDescription("");
                setOpenModule(false);
            })
            .catch(() => alert({ message: "Failed to save module" }));
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
            .catch(() => alert("Failed to load tasks"))
            .finally(() => setLoading(false));
    };

    const adminAddProject = () => {
        if (!selectedModuleId || !tname || status === null) {
            alert("Please fill all required fields!");
            return;
        }

        service.adminAddTask(selectedModuleId, tname, status, taskdesc)
            .then((response) => {
                if (response.status === 200) {
                    notification.success({ message: "Task Saved Successfully" });

                    // Refresh the task list after adding a new task
                    getTasksByModuleId(selectedModuleId);

                    // Reset input fields
                    settname("");
                    settaskdesc("");
                    setStatus("Open");
                }
            })
            .catch(() => notification.error({ message: "Failed to save task" }));
    };


    const columns = [
        {
            title: "Task Name",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
        },
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
        // {
        //     title: "Action",
        //     dataIndex: "status",
        //     key: "View",
        //     render: (text: string) => (
        //         <Button>
        //             View
        //         </Button>
        //     ),
        // },
    ];

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2>Manage Clients</h2>
            </div>

            {loading ? <Spin size="large" /> : (
                <Collapse
                    activeKey={activeKeys}
                    onChange={(keys) => setActiveKeys(keys as string[])}
                    accordion
                    expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
                    style={{ background: "#fff", borderRadius: "8px", padding: "10px" }}
                >
                    {projects.map((project) => (
                        <Panel
                            header={
                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    <span>{project.project_name}</span>
                                    <span style={{ fontWeight: "bold", color: project.statusFlag ? "green" : "red" }}>
                                        {project.statusFlag ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            }
                            key={project.ID}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                <p><strong>Clent Name:</strong> {project.project_name}</p>

                                <div style={{ display: "flex", gap: "10px" }}>
                                    <Button type="primary" onClick={() => {
                                        setSelectedProjectId(project.project_ID);
                                        setOpenModule(true);
                                        setTasks("")
                                    }}>
                                        Add Project
                                    </Button>
                                    <Button type="primary" onClick={(e) => {
                                        e.stopPropagation();
                                        toggleProjectModules(project?.project_ID);
                                    }}>
                                        {expandedProjectId === project?.project_ID ? "Hide Modules" : "View Modules"}
                                    </Button>
                                </div>
                            </div>

                            {expandedProjectId === project.project_ID && (
                                <Row gutter={[16, 16]}>
                                    {modules[project.project_ID] && modules[project.project_ID].length > 0 ? (
                                        modules[project.project_ID].map((module) => (
                                            <Col span={6} key={module.ID}>
                                                <div
                                                    style={{
                                                        borderRadius: "12px",
                                                        background: "#fff",
                                                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                        padding: "16px",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: "8px",
                                                        position: "relative",
                                                        minHeight: "140px",
                                                    }}
                                                >
                                                    {/* Header */}
                                                    <div
                                                        style={{
                                                            fontWeight: "bold",
                                                            fontSize: "16px",
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            alignItems: "center",
                                                            borderBottom: "1px solid #ddd",
                                                            paddingBottom: "8px",
                                                        }}
                                                    >
                                                        <span>
                                                            {module.name.length > 15 ? module.name.slice(0, 15) + "..." : module.name}
                                                        </span>
                                                        <Tooltip title="Edit Module">
                                                            <EditOutlined
                                                                style={{ fontSize: "16px", cursor: "pointer", color: "#1890ff" }}
                                                                onClick={() => {
                                                                    setSelectedProjectId(project.project_ID);
                                                                    setSelectedModule(module);
                                                                    setTasks(module.name);
                                                                    setStartDate(module.startDate);
                                                                    setEndDate(module.endDate)
                                                                    setDescription(module.description);
                                                                    setIsEditMode(true);
                                                                    setOpenModule(true);
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </div>

                                                    {/* Content */}
                                                    <p style={{ color: "#666", margin: "4px 0" }}>
                                                        <strong>Description:</strong>{" "}
                                                        {module.description
                                                            ? module.description.length > 15
                                                                ? module.description.slice(0, 15) + "..."
                                                                : module.description
                                                            : "No description available"}
                                                    </p>

                                                    <p
                                                        style={{
                                                            fontWeight: "bold",
                                                            color: module.statusflag ? "green" : "red",
                                                            marginTop: "auto",
                                                        }}
                                                    >
                                                        {module.statusflag ? "Active" : "Inactive"}
                                                    </p>

                                                    {/* Footer */}
                                                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
                                                        <Button
                                                            onClick={() => {
                                                                setOpenTaskModal(true);
                                                                setSelectedModuleId(module?.ID);
                                                                getTasksByModuleId(module?.ID);
                                                            }}
                                                        >
                                                            View Task
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Col>
                                        ))
                                    ) : (
                                        <Col span={24}>
                                            <p style={{ textAlign: "center", color: "#888" }}>No modules available for this project.</p>
                                        </Col>
                                    )}
                                </Row>
                            )}


                        </Panel>
                    ))}
                </Collapse>
            )}

            {/* Add Module Modal */}
            <Modal
                title={isEditMode ? "Update Module" : "Add Module"}
                open={openModule}
                footer={[
                    <Button key="cancel" onClick={() => {
                        setOpenModule(false);
                        setIsEditMode(false); // Reset edit mode
                        setSelectedModule(null);
                    }}>Cancel</Button>,

                    isEditMode ? (
                        <Button key="update" type="primary" onClick={updateModule}>
                            Update
                        </Button>
                    ) : (
                        <Button key="save" type="primary" onClick={adminAddModule}>
                            Save
                        </Button>
                    )
                ]}
                onCancel={() => {
                    setOpenModule(false);
                    setIsEditMode(false); // Reset edit mode
                    setSelectedModule(null);
                }}
            >
                <Input
                    style={{ width: "100%", marginTop: "10px", height: "40px" }}
                    placeholder="Enter Module Name *"
                    value={Tasks}
                    onChange={(e) => setTasks(e.target.value)}
                    prefix={<UserOutlined />}
                    suffix={<Tooltip title="Module name"><InfoCircleOutlined /></Tooltip>}
                />
                <Input.TextArea style={{ width: "100%", marginTop: "10px", height: "40px" }}
                    placeholder="Enter Description *"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <RangePicker
                    value={
                        startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : undefined
                    }
                    onChange={(dates) => {
                        setStartDate(dates?.[0]?.format("YYYY-MM-DD") || null);
                        setEndDate(dates?.[1]?.format("YYYY-MM-DD") || null);
                    }}
                    style={{ width: "100%", marginTop: "10px", height: "40px" }}
                />
            </Modal>

            {/* Add Task Modal */}
            <Modal
                title={"Tasks"}
                width={1000}
                open={openTaskModal}
                footer={[
                    <Button key="cancel" onClick={() => {
                        setOpenTaskModal(false);
                        setIsEditMode(false); // Reset edit mode
                        setSelectedModule(null);
                    }}>Cancel</Button>
                ]}
                onCancel={() => {
                    setOpenTaskModal(false);
                }}
            >
                <Row gutter={16} align="middle">
                    <Col xs={24} sm={8} md={6} lg={6} xl={6}>
                        <Input
                            style={{ width: '100%', height: '40px', marginBottom: '20px' }}
                            placeholder="Enter Task Name"
                            value={tname}
                            onChange={(e) => settname(e.target.value)}
                            prefix={<UserOutlined />}
                            suffix={<Tooltip title="Module name"><InfoCircleOutlined /></Tooltip>}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={6} lg={6} xl={6}>
                        <Input
                            style={{ width: '100%', height: '40px', marginBottom: '20px' }}
                            placeholder="Enter Task Description"
                            value={taskdesc}
                            onChange={(e) => settaskdesc(e.target.value)}
                            prefix={<UserOutlined />}
                            suffix={<Tooltip title="Module name"><InfoCircleOutlined /></Tooltip>}
                        />
                    </Col>
                    <Col xs={24} sm={8} md={6} lg={6} xl={6}>
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
                    </Col>
                    <Col xs={24} sm={8} md={6} lg={6} xl={6}>
                        <Button style={{ width: '100%', height: '40px', marginBottom: "21px" }} onClick={adminAddProject}>Add Task</Button>
                    </Col>
                </Row>

                <Table
                    dataSource={Tasks} // Use the fetched task data
                    columns={columns}
                    rowKey="ID"
                    pagination={{ pageSize: 5 }}
                />
            </Modal>
        </div>
    );
};

export default PmManageProject;
