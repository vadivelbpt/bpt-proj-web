import React, { useEffect, useState } from "react";
import { Table, message, Button, Modal, Input, Select, Spin } from "antd";
import { ColumnsType } from "antd/es/table";
import { fetchRoles, fetchUsers } from "../../services/userService";
import Alert from "../../components/Alert";
import service from "../../services/adminapiservice";

// ✅ Define allowed alert types
type AlertType = "error" | "info" | "success" | "yesorno";

// ✅ Define user data type
interface User {
    ID: string;
    username: string;
    email: string;
    role: { name: string };
}


const { Option } = Select;

const UserPage: React.FC = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    type AlertType = "error" | "info" | "success" | "yesorno";

    const [userAlert, setUserAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState<AlertType>("info");
    const [alertClose, setAlertClose] = useState<() => void>(() => () => { });

    const [openModal, setOpenModal] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [roleID, setRoleID] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers()
            .then((res) => setUsers(res.data.value))
            .catch(() => message.error("Failed to load users"));
    }, []);

    useEffect(() => {
        fetchRoles()
            .then((res) => setRoles(res.data.value))
            .catch(() => message.error("Failed to load roles"));
    }, []);
    const openAlert = () => {
        setUserAlert(true);
        setAlertType("info");
        setAlertMsg("To Edit Contact Super Admin");
        setAlertClose(() => () => setUserAlert(false));
    };

    // ✅ Define columns properly with `ColumnsType<User>`
    const columns: ColumnsType<User> = [
        {
            title: "S. No",
            key: "serialNumber",
            render: (_: any, __: User, index: number) => index + 1,
        },
        { title: "user_ID", dataIndex: "user_ID", key: "user_ID" },
        { title: "Username", dataIndex: "username", key: "username" },
        { title: "Email", dataIndex: "email", key: "email" },
        // { title: "Role", dataIndex: ["role", "name"], key: "role" },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: User) => (
                <Button type="primary" onClick={openAlert}>
                    Edit
                </Button>
            ),
        },
    ];

    const handleSave = () => {
        if (!username || !email || !password || !roleID) {
            message.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        service.AddUser(username, email, password, roleID)
            .then((response) => {
                if (response.status === 200) {
                    setOpenModal(false);
                    setUserAlert(true);
                    setAlertType("success");
                    setAlertMsg("User Saved Successfully");
                    setAlertClose(() => () => setUserAlert(false));
                } else if (response.status === 409) {
                    setUserAlert(true);
                    setAlertType("error");
                    setAlertMsg("Unable to Save User");
                    setAlertClose(() => () => setUserAlert(false));
                }

                fetchUsers().then((res) => setUsers(res.data.value));
            })
            .catch(() => message.error("Failed to save user"))
            .finally(() => setLoading(false));
    };


    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                <h2>Manage Users</h2>
                <Button type="primary" onClick={() => setOpenModal(true)}>Add User</Button>
            </div>

            <Table dataSource={users} columns={columns} rowKey="ID" />

            <Modal title="Add User" visible={openModal} onCancel={() => { setOpenModal(false), setUsername(""), setPassword(""), setEmail("") }} footer={
                <>
                    <Button type="primary" onClick={handleSave}>
                        {loading ? "Saving..." : "Save"}
                    </Button>
                    <Button onClick={() => { setOpenModal(false), setUsername(""), setPassword(""), setEmail("") }}>
                        Close
                    </Button>
                </>
            }>
                <div style={{ gap: "20px", marginTop: "20px" }}>
                    <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ flex: "1 1 300px", height: "40px", marginBottom: 20 }} />
                    <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: "1 1 300px", height: "40px", marginBottom: 20 }} />
                    <Input.Password placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ flex: "1 1 300px", height: "40px", marginBottom: 20 }} />
                    <Select placeholder="Select Role" value={roleID} onChange={(value) => setRoleID(value)} style={{ width: "100%" }}>
                        {roles.map((role: any) => (
                            <Option key={role.ID} value={role.ID}>{role.name}</Option>
                        ))}
                    </Select>
                </div>
            </Modal>
            <Alert msg={alertMsg} open={userAlert} type={alertType} onClose={alertClose} title={"Alert"} />
        </div>
    );
};

export default UserPage;
function setRoles(value: any): any {
    throw new Error("Function not implemented.");
}

