
using { managed, cuid } from '@sap/cds/common';

namespace tasktracking;

entity Users : managed {
    key ID : UUID;
    username : String(100);
    password      : String(100) not null;
    email : String(150);
    role : Association to Roles;
}

entity Roles : managed {
    key ID : UUID;
    name : String(50);
}

entity Projects : managed {
    key ID : UUID;
    name : String(100);
    description : String(255);
    statusflag: Boolean;
     startDate: Date;
    endDate : Date;

}

entity SubProjects : managed {
    key ID : UUID;
    name : String(100);
    description : String(255);
    project : Association to Projects;
    statusflag : Boolean;
     startDate: Date;
    endDate : Date;
}

entity Tasks : managed {
    key ID : UUID;
    title : String(150);
    description : String(500);
    status : String(20); // ["In Progress", "Closed"]
    assignedTo : Association to Users;
    subProject : Association to SubProjects;
}

entity Efforts : managed {
    key ID : UUID;
    task : Association to Tasks;
    user : Association to Users;
    date : Date;
    hours : Integer;
}

// Clients
entity ProjectAssignments : managed {
    key ID : UUID;
    user : Association to Users;
    project : Association to Projects;
}

// Projects
entity ModuleAssign : managed {
    key ID : UUID;
    user : Association to Users;
    project : Association to Projects;
    module : Association to SubProjects;
    percentage :  Integer;  

}

entity TaskAssign : managed {
    key ID : UUID;
    user : Association to Users;
    project : Association to Projects;
    module : Association to SubProjects;
    Tasks : Association To Tasks;
}

entity UserTasks {
    key ID: UUID;
    user_ID: UUID;
    task_ID: UUID;
    project_ID:UUID;
    module_ID:UUID;
    date: String;
    hours: String;
    description: String;
    ticketNo : String;
   
}