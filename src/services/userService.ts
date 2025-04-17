import api from "./api";

export const fetchUsers = async () => {
    return await api.get("/user/Users");  // Corrected endpoint
};

export const fetchRoles = async () => {
    return await api.get("/user/Roles");  // Corrected endpoint
};

export const fetchProjects = async () => {
    return await api.get("/project/Projects");  // Corrected endpoint
};


export const fetchProjectsByModule = async () => {
    return await api.get("/project/SubProjects?$filter=project_ID eq ");  // Corrected endpoint
};

export const fetchTaskByModuleId = async () => {
    return await api.get("/project/Tasks");  // Corrected endpoint
};

export const fetchProjectsByUserID = async () => {
    return await api.get("/project/getAssignedProjects");  // Corrected endpoint
};