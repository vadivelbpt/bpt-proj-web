import React, { useEffect, useState } from "react";
import { Table, message } from "antd";
import { fetchRoles } from "../../services/userService";

const RolePage: React.FC = () => {
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        fetchRoles()
            .then((res) => setRoles(res.data.value))
            .catch(() => message.error("Failed to load roles"));
    }, []);

    const columns = [
        { title: "ID", dataIndex: "ID", key: "ID" },
        { title: "Role Name", dataIndex: "name", key: "name" },
    ];

    return (
        <div>
            <h2>Manage Roles</h2>
            <Table dataSource={roles} columns={columns} rowKey="ID" />
        </div>
    );
};

export default RolePage;
