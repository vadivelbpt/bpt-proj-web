import { Descriptions } from 'antd';
import Password from 'antd/es/input/Password';
import axios from 'axios';
// const baseURL = process.env.VITE_API_BASE_URL;
// #SignUp&Login flow

// const baseURL = "http://192.168.2.155:4004/odata/v4"
const baseURL = import.meta.env.VITE_API_BASE_URL

console.log(baseURL,"BaseURL");

const getProjectModulesByid = async (id: any) => {
    const api = axios.create({
        baseURL: baseURL,

    });
    return api.get("/project/SubProjects?$filter=project_ID eq " + id)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.log(error)
            return error;
        });
}

const getProjectsById = (userId: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/getAssignedModules",
        {
            user_ID: userId
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const pmgetProjectsById = (userId: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/getAssignedProjects",
        {
            user_ID: userId
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const getTasksByModuleId = (moduleId: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/getTasksByModuleIds",
        {
            module_ids: [moduleId]
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const addProjectToUser = (payload: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/assignProjectToUser", payload

    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const addProjectToUsers = (selectedUser: any, selectedProjectID?: any, modulesPayload?: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project//assignModules",
        {
            user_ID: selectedUser,
            // project_ID: selectedProjectID,
            // module_ID: selectedModule
            module_IDs: modulesPayload
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const getTaskByreport = (userId: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/getUserTasks",
        {
            user_ID: userId
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const adminAddProject = (userId: any, description: any, status: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/addProject",
        {
            name: userId,
            description: description,
            statusflag: status

        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};
const adminAddModule = (project_id: any, subProjectNames: any, statusflag: any, description: any,startDate:any,endDate:any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/addModules",
        {
            project_id: project_id,
            subProjectNames: [{ name: subProjectNames, statusflag: statusflag, description: description,startDate:startDate,endDate:endDate }],

        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const updateModule = (ID: any, subProjectNames: any, statusflag: any, description: any,startDate:any,endDate:any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/updateSubModules",
        {
            ID: ID,
            name: subProjectNames,
            description: description,
            statusflag: statusflag,
            startDate:startDate,
            endDate:endDate
            
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const adminAddTask = (moduleId: any, subProjectNames: any, status: any, description: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/addTasks",
        {
            subproject_id: moduleId,
            Tasks: [{ tasksname: subProjectNames, status: status, description: description }],
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const userAddTimeLog = (userId: any, taskId: any, projectId: any, moduleId: any, date: any, hours: any, description: any, ticketno: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/addUserTask",
        {
            user_ID: userId,
            task_ID: taskId,
            project_ID: projectId,
            module_ID: moduleId,
            date: date,
            hours: hours,
            description: description,
            ticketNo:ticketno
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const updateTimeLog = (ID:any,userId: any, taskId: any, projectId: any, moduleId: any, date: any, hours: any, description: any, ticketno: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/updateUserTask",
        {
            ID:ID,
            user_ID: userId,
            task_ID: taskId,
            project_ID: projectId,
            module_ID: moduleId,
            date: date,
            hours: hours,
            description: description,
            ticketNo:ticketno
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};


const adminReportByUser = (userId: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/getUserTasks",
        {
            user_ID: userId
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const adminTaskUpdate = (taskId: any, moduleId: any, taskname: any, status: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/updateTask",
        {
            task_ID: taskId,
            module_ID: moduleId,
            title: taskname,
            status: status
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const usergettaskById = (taskId: any, userId: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/project/getUserTasksForTask",
        {
            task_ID: taskId,
            user_ID: userId
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const AddUser = (username: any, emailId: any, password: any, roleID: any) => {
    const api = axios.create({
        baseURL: baseURL,
    });
    return api.post("/user/addUser",
        {
            username: username,
            email: emailId,
            password: password,
            roleID: roleID
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error;
        });
};

const service = {
    adminAddProject,
    adminAddModule,
    getProjectModulesByid,
    getProjectsById,
    getTasksByModuleId,
    addProjectToUser,
    getTaskByreport,
    adminAddTask,
    userAddTimeLog,
    adminReportByUser,
    addProjectToUsers,
    adminTaskUpdate,
    usergettaskById,
    AddUser,
    updateModule,
    pmgetProjectsById,
    updateTimeLog
}

export default service;