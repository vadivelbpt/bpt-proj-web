import React, { useEffect, useState } from "react";
import { Table, message, Button, Modal, DatePicker, Select, Input } from "antd";
import { fetchUsers } from "../../services/userService";
import service from "../../services/adminapiservice";
import dayjs from "dayjs";
import { SearchOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const { RangePicker } = DatePicker;


interface User {
    ID: any;
    username: string;
    user_ID: any
}

const AdmReport: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [reportData, setReportData] = useState([]); // Full report data
    const [filteredData, setFilteredData] = useState([]); // Filtered data
    const [searchText, setSearchText] = useState<string>('');

    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [loading, setLoading] = useState(false)

    // Load Users from API
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

    const handleViewReport = (username: string, userID: string) => {
        setStartDate("");setEndDate("");setSelectedProject(null);setSelectedModule(null);
        setSelectedUser(username);
        setIsModalVisible(true);

        service.getTaskByreport(userID)
            .then((response) => {
                if (response?.status === 200 && response?.data?.value?.length > 0) {
                    const data = response?.data?.value[0]?.data || [];
                    setReportData(data);
                    setFilteredData(data); // Set initial filtered data
                }
                else {
                    setReportData([]);
                    setFilteredData([]);
                }
            })
            .catch(() => message.error("Failed to load user reports"));
    };

    const handleFilter = () => {
        let filtered = reportData;

        if (startDate && endDate) {
            filtered = filtered.filter((item: any) => {
                const itemDate = dayjs(item.date);
                return itemDate.isAfter(dayjs(startDate).subtract(1, "day")) && itemDate.isBefore(dayjs(endDate).add(1, "day"));
            });
        }

        if (selectedProject) {
            filtered = filtered.filter((item: any) => item.project_name === selectedProject);
        }

        if (selectedModule) {
            filtered = filtered.filter((item: any) => item.module_name === selectedModule);
        }

        setFilteredData(filtered);
    };

    const handleDownloadExcel = async () => {
        if (filteredData.length === 0) {
            message.warning("No data available to download!");
            return;
        }
        setLoading(true);
        try {
            const formattedData = filteredData.map((item: any, index: number) => ({
                "S. No": index + 1,
                "Date": item.date || "N/A",
                "Project Name": item.project_name || "N/A",
                "Module Name": item.module_name || "N/A",
                "Task Name": item.task_name || "N/A",
                "Task Description": item.description || "-",
                "Hours": item.hours !== null && item.hours !== undefined ? `${item.hours} Hr` : "0 Hr",
            }));

            // Create worksheet & workbook
            const ws = XLSX.utils.json_to_sheet(formattedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Report");
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Save file
            XLSX.writeFile(wb, `Report_${selectedUser || "User"}.xlsx`);
            message.success("Excel downloaded successfully!");
        } catch (error) {
            message.error("Failed to download Excel");
        } finally {
            setLoading(false);
        }
    };

    // User Table Columns
    const columns = [
        {
            title: "S. No",
            dataIndex: "serialNumber",
            key: "serialNumber",
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "user_ID",
            dataIndex: "user_ID",
            key: "user_ID",
            render: (text: string) => (text.length > 5 ? text.slice(0, 5) + "..." : text),
        },
        { title: "Username", dataIndex: "username", key: "username" },
        { title: "Email", dataIndex: "email", key: "email" },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: {
                user_ID: string; username: string; ID: string
            }) => (
                <Button type="primary" onClick={() => handleViewReport(record?.username, record?.user_ID)}>
                    View Report
                </Button>
            ),
        },
    ];

    // Report Table Columns with Null Handling
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
            title: "Task Description",
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
    ];

    const projectOptions = Array.from(new Set(reportData.map((item: any) => item.project_name)));
    const moduleOptions = Array.from(new Set(reportData.map((item: any) => item.module_name)));

    const filteredTasks = users.filter(users =>
        users.username.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2>Reports</h2>
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

            {/* Report Modal */}
            <Modal
                title={`Report for ${selectedUser}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={1300}
            >
                {/* Filter Section */}
                <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                    <RangePicker
                        onChange={(dates) => {
                            setStartDate(dates?.[0]?.format("YYYY-MM-DD") || null);
                            setEndDate(dates?.[1]?.format("YYYY-MM-DD") || null);
                        }}
                        style={{ width: "250px" }}
                    />
                    <Select
                        placeholder="Select Client"
                        style={{ width: "250px" }}
                        value={selectedProject}
                        onChange={(value) => setSelectedProject(value)}
                        allowClear
                    >
                        {projectOptions.map((project) => (
                            <Select.Option key={project} value={project}>
                                {project}
                            </Select.Option>
                        ))}
                    </Select>

                    <Select
                        placeholder="Select Project"
                        style={{ width: "250px" }}
                        value={selectedModule}
                        onChange={(value) => setSelectedModule(value)}
                        allowClear
                    >
                        {moduleOptions.map((module) => (
                            <Select.Option key={module} value={module}>
                                {module}
                            </Select.Option>
                        ))}
                    </Select>

                    <Button type="primary" onClick={handleFilter}>
                        Apply Filters
                    </Button>
                    <Button type="primary" onClick={handleDownloadExcel} disabled={loading}>
                        {loading ? "Downloading..." : "Download Excel"}
                    </Button>
                </div>

                {/* Filtered Report Table */}
                <Table
                    dataSource={filteredData}
                    columns={reportColumns}
                    rowKey="ID"
                    // pagination={true}
                    locale={{ emptyText: "No Records Found" }} // Handles empty data case
                />

            </Modal>
        </div>
    );
};

export default AdmReport;
