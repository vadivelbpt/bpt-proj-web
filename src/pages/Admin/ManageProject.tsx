import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, Tooltip, message, Select, Avatar, Descriptions, Spin } from 'antd';
import { PlusOutlined, InfoCircleOutlined, UserOutlined, ProjectOutlined, SnippetsOutlined, ApartmentOutlined, } from '@ant-design/icons';
import { fetchProjects } from '../../services/userService';
import service from '../../services/adminapiservice';
import Alert from '../../components/Alert';

interface ModuleType {
    id: any;
    name: string;
}

interface Project {
    [x: string]: any;
    key: React.Key;
    name: any;
    age: any;
    address: any;
    modules: ModuleType[];
}

const AdmProjects: React.FC = () => {

    const [openProject, setOpenProject] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const [openModule, setOpenModule] = useState<boolean>(false);

    const [projects, setProjects] = useState<Project[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [projectName, setPojectName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [Tasks, setTasks] = useState<string>("");

    const [pname, setPName] = useState<string>("");
    const [desc, setDesc] = useState<string>("");
    const [status, setStatus] = useState<boolean | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    type AlertType = "error" | "info" | "success" | "yesorno";

    const [userAlert, setUserAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState<AlertType>("info");
    const [alertClose, setAlertClose] = useState<() => void>(() => () => { });
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects()
            .then((res) => {
                console.log(res, "Project dto")
                setProjects(res.data.value)

            })
            .catch(() => message.error("Failed to load roles"));
    }, []);

    const getProjectModulesByid = (projectId: any) => {
        service.getProjectModulesByid(projectId)
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.data, "Project By Id")
                    setModules(response.data.value);
                }
            })
    }

    const handleProjectClick = (projectId: any, projectName: string) => {
        console.log("Selected Project ID:", projectId);
        setSelectedProjectId(projectId);
        setPojectName(projectName);
        getProjectModulesByid(projectId);
    };

    const adminAddProject = () => {
        if (!pname || !desc || status == null) {

            alert("Please fill all required fields!");
            return;
        }
        setLoading(true)
        service.adminAddProject(pname, desc, status)
            .then((response) => {
                if (response.status === 200) {
                    setPName(""),
                        setDesc(""),
                        setStatus(null)
                    setUserAlert(true);
                    setAlertType("info"); // ✅ Now it's a valid type
                    setAlertMsg("Client Saved Succesfully");
                    setAlertClose(() => () => setUserAlert(false));
                    setOpenProject(false);
                    fetchProjects().then((res) => setProjects(res.data.value));
                }
            })
            .catch(() => message.error("Failed to save client"))
            .finally(() => setLoading(false));

    };

    const adminAddModule = () => {
        if (selectedProjectId == null || !Tasks) {
            alert("Please select a project and fill all required fields!");
            return;
        }
        setLoading(true)
        const statusflag = true
        service.adminAddModule(selectedProjectId, Tasks, statusflag, description, startDate, endDate)
            .then((response) => {
                if (response.status === 200) {

                    setUserAlert(true);
                    setAlertType("info");
                    setAlertMsg("Project Saved Successfully");
                    setAlertClose(() => () => setUserAlert(false));
                }
                setTasks("");
                setOpenModule(false);
                getProjectModulesByid(selectedProjectId);
            })
            .catch(() => message.error("Failed to save Project"))
            .finally(() => setLoading(false));
    };
    return (
        <div>
            {/* <div style={{ display: "flex", marginLeft: "20px" }}>
                <Input
                    placeholder="Search Project"
                    style={{ marginBottom: 16, width: 300 }}
                    prefix={<SearchOutlined style={{ color: "rgba(0,0,0,0.45)" }} />} // Add search icon
                />
            </div> */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2>Manage Clients</h2>
            </div>
            <div style={{ display: 'flex', gap: '20px', height: '100vh', background: '#f4f5f7' }}>
                {/* Projects Column */}
                <Card title={<><span>Client</span> <Button type="text" icon={<PlusOutlined />} onClick={() => setOpenProject(true)} /></>} style={{ flex: 1, border: '2px solid #FCE7F3', borderRadius: '10px', height: '650px', overflowY: 'auto', padding: '10px' }}>
                    {projects.map(project => (
                        <Card key={project.key} style={{ border: '2px solid #D4E4FC', marginBottom: '10px', borderRadius: '8px', cursor: "pointer" }} onClick={() => handleProjectClick(project.ID, project.name)}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <p><ProjectOutlined style={{ marginRight: '8px' }} />{project.name}</p>
                                <p style={{ color: project.statusflag ? "green" : "red" }}>
                                    {project.statusflag ? "Active" : "Inactive"}
                                </p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", marginTop: "5px", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "10px", color: "black", marginRight: "8px" }}>
                                    Last Updated Date: <span style={{ color: "orange" }}>
                                        {new Intl.DateTimeFormat('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                        }).format(new Date(project.createdAt))}
                                    </span>

                                </span>
                                <Avatar size={20} icon={<UserOutlined />} style={{ backgroundColor: "#87d068" }} />
                            </div>

                        </Card>
                    ))}
                </Card>

                {/* Modules Column */}
                <Card
                    title={
                        <>
                            <span>Projects</span>
                            {projectName &&
                                <>
                                    <span style={{ fontSize: "14px", color: "gray", marginLeft: "10px" }}>(Client Name: {projectName})</span>
                                    <Button type="text" icon={<PlusOutlined />} onClick={() => setOpenModule(true)} />
                                </>
                            }

                        </>
                    }
                    style={{ flex: 1, border: '2px solid #FCE7F3', borderRadius: '10px', height: '650px', overflowY: 'auto', padding: '10px' }}>
                    {modules.length > 0 ? (
                        modules.map(module => (
                            <Card key={module.id} style={{ border: '2px solid #FFEDD5', marginBottom: '10px', borderRadius: '8px' }}>
                                <div style={{ display: "flex" }}>
                                    <ApartmentOutlined />  <p style={{ marginLeft: "10px" }}>{module.name}</p>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p style={{ textAlign: "center", color: "gray" }}>No Projects available</p>
                    )}
                </Card>

                {/* Modals */}
                <Modal
                    title="Add Client"
                    open={openProject}
                    footer={
                        <>
                            <Button type="primary" onClick={() => { adminAddProject(); }} disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                            </Button>
                            <Button onClick={() => {
                                setOpenProject(false),
                                    setPName(""),
                                    setDesc(""),
                                    setStatus(null)
                            }}>Close</Button>
                        </>
                    }
                    onCancel={() => {
                        setOpenProject(false),
                            setPName(""),
                            setDesc(""),
                            setStatus(null)
                    }}
                >
                    <div style={{ marginTop: "20px" }}>
                        <Input
                            style={{ height: '40px', marginBottom: '20px' }}
                            value={pname}
                            onChange={(e) => setPName(e.target.value)}
                            placeholder="Enter Client Name *"
                            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            suffix={<Tooltip title="Project name"><InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} /></Tooltip>}
                        />

                        <Input
                            style={{ height: '40px', marginBottom: '20px' }}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Enter description"
                            prefix={<SnippetsOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            suffix={<Tooltip title="Project description"><InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} /></Tooltip>}
                        />
                        <Select
                            style={{ width: '100%', height: '40px', marginBottom: '20px' }}
                            showSearch
                            placeholder="Status *"
                            value={status === true ? '1' : status === false ? '2' : undefined} // Ensure proper value mapping
                            onChange={(value) => setStatus(value === '1')} // ✅ Convert '1' to true, '2' to false
                            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                            options={[
                                { value: '1', label: 'Active' },
                                { value: '2', label: 'Inactive' }
                            ]}
                        />

                    </div>
                </Modal>
                {/* #Module */}
                <Modal
                    title={
                        <>
                            <span>Add Project  - </span>
                            <span style={{ color: "#888", fontStyle: "italic" }}>
                                {projectName || "Choose Project Before Add"}
                            </span>

                        </>
                    }
                    open={openModule}
                    footer={
                        <>
                            <Button type="primary" onClick={() => { adminAddModule() }} disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                            </Button>
                            <Button onClick={() => setOpenModule(false)}>Close</Button>
                        </>
                    }
                    onCancel={() => setOpenModule(false)}
                >
                    <div style={{ marginTop: "20px" }}>
                        <Input
                            style={{ height: '40px', marginBottom: '20px' }}
                            placeholder="Enter Project Name *"
                            value={Tasks}
                            onChange={(e) => setTasks(e.target.value)}
                            prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            suffix={<Tooltip title="Module name"><InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} /></Tooltip>}
                        />
                    </div>
                    <div style={{ marginTop: "0px" }}>
                        <Input
                            style={{ height: '40px', marginBottom: '10px' }}
                            placeholder="Enter Description*"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            prefix={<SnippetsOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                            suffix={<Tooltip title="Description"><InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} /></Tooltip>}
                        />
                    </div>
                </Modal>
            </div>
            <Alert msg={alertMsg} open={userAlert} type={alertType} onClose={alertClose} title={"Alert"} />
        </div>
    );
};

export default AdmProjects;