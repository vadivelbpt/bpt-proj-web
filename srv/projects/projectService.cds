using tasktracking as tt from '../../db/schema';

service projectService {
    entity Projects as projection on tt.Projects;
    entity Tasks as projection on tt.Tasks;
    entity SubProjects as projection on tt.SubProjects;
    entity Users as projection on tt.Users;
    entity ProjectAssignments as projection on tt.ProjectAssignments;
    entity UserTasks as projection on tt.UserTasks;

    entity ModuleAssign as projection on tt.ModuleAssign;
    entity TaskAssign as projection on tt.TaskAssign;


    action addUserTask(user_ID: UUID, task_ID: UUID,project_ID:UUID,module_ID:UUID, date: Date, hours: String, description: String, ticketNo : String) returns String;
    action updateUserTask(ID:UUID, user_ID: UUID, task_ID: UUID,project_ID:UUID,module_ID:UUID, date: Date, hours: String, description: String, ticketNo : String) returns String;
    action getUserTasks(user_ID: UUID) returns array of UserTasks;


    action addProject(name: String, description: String, statusflag: Boolean) returns UUID;
    action updateProject(ID: UUID, name: String, description: String, statusflag: Boolean) returns UUID;
    action getTasksByModuleIds(module_ids: many UUID) returns many Tasks;
    action getUserTasksForTask(user_ID: UUID,task_ID:UUID) returns array of UserTasks;
    

    action updateTask(
    task_ID: UUID,
    module_ID: UUID,
    title: String,
    description : Boolean,
    status: String
) returns String;

    action addTasks(
        subproject_id: UUID,    
        Tasks: many TaskInput
    ) returns String;

    type TaskInput {
        tasksname: String;
        description: String;
        status: String;
    }    

    action addModules(
        project_id      : UUID,
        subProjectNames : many SubProjectInput
    ) returns String;

    action updateSubModules( 
        ID: UUID,
        name: String,
        description : String,
        statusflag : Boolean,
         startDate: Date, 
         endDate : Date
    ) returns String;

    type SubProjectInput {
        name : String;
        description : String;
        statusflag : Boolean;
        startDate: Date;
        endDate : Date;
    }

   
    action getAssignedProjects(
        user_ID : UUID
    ) returns ProjectAssignments;

     type UserTaskResponse {
        userName: String;
        taskName: String;   
        moduleName: String;
    }

  // asssign Project to PM  

action assignProjectToUser(
    user_ID : UUID,
    project_IDs : array of projectInput
) returns String;

type projectInput {
    ID   : UUID;   // Add ID to identify the project
}

// Assign Modules to Team lead

action assignModules(
    user_ID : UUID, 
    module_IDs : array of userInput
) returns String;

type userInput {
    ID   : UUID;   // Add ID to identify the project
}

 action getAssignedModules(
        user_ID : UUID
    ) returns ModuleAssign;

action getUsersByModuleId(
        module_ID : UUID
    ) returns ModuleAssign;

action assignTasks(
    user_ID : UUID,
    task_IDs : array of taskInput
) returns String;

type taskInput {
    ID   : UUID;   // Add ID to identify the project
}

action getAssignedTasks(
        user_ID : UUID
    ) returns TaskAssign;

}
