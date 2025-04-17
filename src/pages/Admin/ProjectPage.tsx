import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Tooltip, Select, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { InfoCircleOutlined, UserOutlined } from '@ant-design/icons';
import { fetchProjects } from '../../services/userService';

interface ModuleType {
    id: number;
    name: string;
}

interface DataType {
    key: React.Key;
    name: string;
    age: any;
    address: string;
    modules: ModuleType[];
}

const ProjectPage: React.FC = () => {

    const [open, setOpen] = useState<boolean>(false);
    const [openModule, setOpenModule] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchProjects()
            .then((res) => {
                console.log(res, "Project dto")
                setProjects(res.data.value)
            })

            .catch(() => message.error("Failed to load roles"));
    }, []);

    const data: DataType[] = [
        {
            key: 1,
            name: 'Project 1',
            age: 'Active',
            address: 'New York No. 1 Lake Park',
            modules: [
                { id: 1, name: 'Module A' },
                { id: 2, name: 'Module B' }
            ],
        },
        {
            key: 2,
            name: 'Project 2',
            age: 'Active',
            address: 'London No. 1 Lake Park',
            modules: [
                { id: 3, name: 'Module C' }
            ],
        },
        {
            key: 3,
            name: 'Project 3',
            age: 'Active',
            address: 'Sydney No. 1 Lake Park',
            modules: [
                { id: 4, name: 'Module D' },
                { id: 5, name: 'Module E' }
            ],
        },
    ];

    const filteredData = data.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));

    const columns: TableColumnsType<DataType> = [
        { title: 'Client Name', dataIndex: 'name', key: 'name' },
        {
            title: 'Status',
            dataIndex: 'age',
            key: 'status',
            render: (age) => (
                <a style={{ color: "green" }}>
                    Active
                </a>
            ),
        },
        {
            title: 'Projects',
            dataIndex: '',
            key: 'x',
            render: () => <Button onClick={() => setOpenModule(true)}>+</Button>,
        },
        {
            title: 'Action',
            dataIndex: '',
            key: 'x',
            render: () => <Button type='primary' onClick={() => setOpen(true)}>Edit</Button>,
        },
    ];

    const showModal = () => {
        setOpen(true);
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Manage Clients</h2>
                <Button type="primary" onClick={showModal}>Add Project</Button>
            </div>

            {/* <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Input
                    placeholder="Search by Name"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: 16, width: 300 }}
                />
            </div> */}


            <Table<DataType>
                columns={columns}
                expandable={{
                    expandedRowRender: (record) => (
                        <div>
                            {record.modules.map((module, index) => (
                                <div style={{ marginBottom: "10px" }}>
                                    <li key={module.id}>{index + 1}. {module.name}</li>
                                </div>
                            ))}
                        </div>
                    ),
                }}
                dataSource={filteredData}
            />

            <Modal
                title="Add Project"
                open={open}
                footer={
                    <>
                        <Button type="primary" onClick={() => { setOpen(false); message.success('Project saved!'); }}>
                            Save
                        </Button>
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    </>
                }
                onCancel={() => setOpen(false)}
            >
                <div style={{ marginTop: "20px" }}>
                    <Input
                        style={{ height: '40px', marginBottom: '20px' }}
                        placeholder="Enter Project Name *"
                        prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        suffix={<Tooltip title="Project name"><InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} /></Tooltip>}
                    />

                    <Input
                        style={{ height: '40px', marginBottom: '20px' }}
                        placeholder="Enter description"
                        prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        suffix={<Tooltip title="Project description"><InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} /></Tooltip>}
                    />

                    <Select
                        style={{ width: '100%', height: '40px', marginBottom: '20px' }}
                        showSearch
                        placeholder="Status *"
                        filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                        options={[{ value: '1', label: 'Active' }, { value: '2', label: 'Inactive' }]}
                    />
                </div>
            </Modal>

            <Modal
                title="Add Module"
                open={openModule}
                footer={
                    <>
                        <Button type="primary" onClick={() => { setOpenModule(false); message.success('Module saved!'); }}>
                            Save
                        </Button>
                        <Button onClick={() => setOpenModule(false)}>Close</Button>
                    </>
                }
                onCancel={() => setOpenModule(false)}
            >
                <div style={{ marginTop: "20px" }}>
                    <Input
                        style={{ height: '40px', marginBottom: '20px' }}
                        placeholder="Enter Module Name *"
                        prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                        suffix={<Tooltip title="Module name"><InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} /></Tooltip>}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default ProjectPage;
