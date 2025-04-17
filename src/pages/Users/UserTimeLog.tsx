import React, { useEffect, useState } from "react";
import { Table, message, Button, Modal, Input, Row, Col, InputNumber, DatePicker, Select } from "antd";
import service from "../../services/adminapiservice";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Alert from "../../components/Alert";

interface User {
    ID: any;
    username: string;
    user_ID: any;
}

interface Project {
    ID: string;
    project_ID: string;
    project_name: string;
    statusFlag: boolean;
}

interface TaskType {
    ID: string;
    title: string;
    status: string;
    description: string | null;
}

interface Project {
    ID: string;
    project_ID: string;
    project_name: string;
    statusFlag: boolean;
    modules?: { module_ID: string; module_name: string }[]; // Add this line
}


const UserTimeLog: React.FC = () => {

    const { Option } = Select;

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [ticketno, setTicketNo] = useState<string>('');
    const [disc, setDisc] = useState<string>('');
    const [hours, setHours] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [isEditing, setIsEditing] = useState(false);


    type AlertType = "error" | "info" | "success" | "yesorno";

    // Selected Data for Modal
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [selectedDescription, setSelectedDescription] = useState<string | null>(null);

    const [selectedProjectID, setSelectedProjectID] = useState<string | null>(null);
    const [selectedModuleID, setSelectedModuleID] = useState<string | null>(null);
    const [selectedDescriptionID, setSelectedTaskID] = useState<string | null>(null);

    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [selectedUserTaskId, setSelectedUserTaskId] = useState<string | null>(null);

    const [modules, setModules] = useState<{ module_ID: string; module_name: string }[]>([]);
    const [userAlert, setUserAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState<AlertType>("info");
    const [alertClose, setAlertClose] = useState<() => void>(() => () => { });


    const userid = localStorage.getItem("userID");

    useEffect(() => {
        setLoading(true);
        handleViewReport();
    }, []);

    useEffect(() => {
        getProjectsByUserId();
    }, []);

    useEffect(() => {
        getProjectsByUserId();
    }, []);

    const getProjectsByUserId = () => {
        service.getProjectsById(userid)
            .then((response) => {
                if (response.status === 200) {
                    setProjects(response.data.data);
                }
            })
            .catch(() => message.error("Failed to load projects"));
    };

    const handleAddTask = () => {
        setIsEditing(false); // Set to false for adding
        setSelectedProject(null);
        setSelectedModule(null);
        setSelectedTask(null);
        setSelectedDescription(null);
        setDate("");
        setHours("");
        setTicketNo("");
        setIsModalVisible(true);
    };

    const handleProjectChange = (projectId: string) => {
        console.log(projectId)
        setSelectedProject(projectId);
        setSelectedModule(null);
        setSelectedTask(null);
        const selectedProjectData = projects.find(proj => proj.project_ID === projectId);
        if (selectedProjectData?.modules) {
            setModules(selectedProjectData.modules);
        } else {
            setModules([]);
        }
        setTasks([]);
    };


    const handleModuleChange = (moduleId: string) => {
        setSelectedModule(moduleId);
        setSelectedTask(null);
        getTasksByModuleId(moduleId);
    };

    const getTasksByModuleId = (moduleId: string) => {
        service.getTasksByModuleId(moduleId)
            .then((response) => {
                if (response.status === 200) {
                    setTasks(response?.data?.value[0]?.data || []);
                }
            })
            .catch(() => message.error("Failed to load tasks"));
    };

    const handleViewReport = () => {
        setLoading(true)
        service.getTaskByreport(userid)
            .then((response) => {
                if (response?.status === 200 && response?.data?.value?.length > 0) {
                    const data = response?.data?.value[0]?.data || [];
                    setReportData(data);
                    setFilteredData(data);
                } else {
                    setReportData([]);
                    setFilteredData([]);
                }
            })
            .catch(() => message.error("Failed to load user reports"))
            .finally(() => setLoading(false))
    };

    const handleViewDetails = (record: {
        project_name: string;
        module_name: string;
        description: string;
        date?: string;
        hours?: string;
        ticketNo?: string;
        task_name?: string;
        userTask_ID?: any;
        project_ID?:any;
        module_ID?:any;
    }) => {
        console.log(record,"record ")
        setIsEditing(true); // Set to true for editing

        setSelectedProject(record.project_name || null);
        setSelectedModule(record.module_name || null);
        setSelectedTask(record.task_name || null);
         
        setSelectedDescription(record.description || null);
        setDate(record.date || "");
        setHours(record.hours || "0"); // Default to "0" if missing
        setTicketNo(record.ticketNo || ""); // Default to empty string if missing
        setIsModalVisible(true);
        setDisc(record.description || "");
        setSelectedUserTaskId(record.userTask_ID || null);
    };


    const reportColumns = [
        {
            title: "S. No",
            dataIndex: "serialNumber",
            key: "serialNumber",
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            render: (text: string | null) => (text ? text : "N/A"),
        },
        {
            title: "Client Name",
            dataIndex: "project_name",
            key: "project_name",
            render: (text: string | null) => (text ? text : "N/A"),
        },
        {
            title: "Project Name",
            dataIndex: "module_name",
            key: "module_name",
            render: (text: string | null) => (text ? text : "N/A"),
        },
        {
            title: "Task Name",
            dataIndex: "task_name",
            key: "task_name",
            render: (text: string | null) => (text ? text : "N/A"),
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (text: string | null) => (text ? text : "-"),
        },
        {
            title: "Hours",
            dataIndex: "hours",
            key: "hours",
            render: (text: number | null) => (text !== null && text !== undefined ? `${text} Hr` : "0 Hr"),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: { project_name: string; module_name: string; description: string }) => (
                <Button onClick={() => handleViewDetails(record)}>View</Button>
            ),
        },
    ];

    const handleUpdateTask = () => {
        setLoading(true);
        service.updateTimeLog(selectedUserTaskId, userid, selectedTask, selectedProject, selectedModule, date, hours, selectedDescription, ticketno)
            .then((response) => {
                if (response.status === 200) {
                    console.log("TimeLogSaved")
                    setUserAlert(true);
                    setAlertType("success");
                    setAlertMsg("Time Log Saved Successfully");
                    setAlertClose(() => () => setUserAlert(false));
                    setDate("");
                    setHours("");
                    setDisc("");
                    setIsModalVisible(false)
                    handleViewReport();
                }
            })
            .catch(() => message.error("Failed to save time log"))
            .finally(() => setLoading(false));
    }

    const handleSaveTask = () => {
        setLoading(true);
        service.userAddTimeLog(userid, selectedTask, selectedProject, selectedModule, date, hours, selectedDescription, ticketno)
            .then((response) => {
                if (response.status === 200) {
                    setUserAlert(true);
                    setAlertType("success");
                    setAlertMsg("Time Log Saved Successfully");
                    setAlertClose(() => () => setUserAlert(false));
                    setDate("");
                    setHours("");
                    setDisc("");
                    setIsModalVisible(false)
                    handleViewReport();
                }
            })
            .catch(() => message.error("Failed to save time log"))
            .finally(() => setLoading(false));
    }


    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2>Time Log</h2>
                <Button onClick={handleAddTask}>Add</Button>
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

            <Table
                dataSource={filteredData}
                columns={reportColumns}
                rowKey="ID"
                locale={{ emptyText: "No Records Found" }}
            />

            {/* View Task Details Modal */}
            <Modal
                title={isEditing ? "Update Time Log" : "Add Time Log"} // Dynamic title
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>
                        Close
                    </Button>,
                    <Button loading={loading} key="save" type="primary" onClick={() => isEditing ? handleUpdateTask() :

                        handleSaveTask()}>
                        {/* <Button key="save" type="primary" onClick={() => isEditing ? handleUpdateTask() : handleSaveTask()}> */}

                        {isEditing ? "Update" : "Save"}
                    </Button>,
                ]}
                width={1000}
            >
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                        <span><strong>Client Name:</strong></span>
                        <Select
                            placeholder="Select Client"
                            value={selectedProject}
                            onChange={handleProjectChange}
                            style={{ width: "100%", height: "40px", marginTop: "10px" }}
                        >
                            {projects.map(proj => (
                                <Option key={proj.project_ID} value={proj.project_ID}>
                                    {proj.project_name}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} md={8}>
                        <span><strong>Project Name:</strong></span>
                        <Select
                            placeholder="Select Project"
                            value={selectedModule}
                            onChange={handleModuleChange}
                            style={{ width: "100%", height: "40px", marginTop: "10px" }}
                            disabled={!selectedProject}
                        >
                            {modules.map(mod => (
                                <Option key={mod.module_ID} value={mod.module_ID}>
                                    {mod.module_name}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} md={8}>
                        <span><strong>Task:</strong></span>
                        <Select
                            placeholder="Select Task"
                            value={selectedTask}
                            onChange={(value) => setSelectedTask(value)}
                            style={{ width: "100%", height: "40px", marginTop: "10px" }}
                            disabled={!selectedModule}
                        >
                            {tasks.map(task => (
                                <Option key={task.ID} value={task.ID}>
                                    {task.title}
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} sm={8}>
                        <span><strong>Date:</strong></span>
                        <DatePicker
                            value={date ? dayjs(date) : null} // Ensure correct DatePicker format
                            format="YYYY-MM-DD"
                            style={{ width: "100%", height: "40px", marginTop: "10px" }}
                            onChange={(_, dateString) => setDate(dateString as string)} // Explicitly cast to string
                        />
                    </Col>

                    <Col xs={24} sm={8}>
                        <span><strong>Hours:</strong></span>
                        <InputNumber
                            value={hours ? Number(hours) : 0} // Ensure it's always a number
                            style={{ width: "100%", height: "40px", marginTop: "10px" }}
                            onChange={(value) => setHours(value?.toString() || "0")} // Convert to string, default to "0"
                        />
                    </Col>

                    <Col xs={24} sm={8}>
                        <span><strong>Ticket No:</strong></span>
                        <Input
                            value={ticketno}
                            style={{ width: "100%", height: "40px", marginTop: "10px" }}
                            onChange={(e) => setTicketNo(e.target.value)}
                        />
                    </Col>

                    <Col xs={24}>
                        <span><strong>Description:</strong></span>
                        <Input.TextArea
                            value={selectedDescription || ""}
                            rows={3}
                            style={{ width: "100%", marginTop: "10px" }}
                            onChange={(e) => setSelectedDescription(e.target.value)}
                        />
                    </Col>
                </Row>
            </Modal>
            <Alert msg={alertMsg} open={userAlert} type={alertType} onClose={alertClose} title={"Alert"} />

        </div>
    );
};

export default UserTimeLog;