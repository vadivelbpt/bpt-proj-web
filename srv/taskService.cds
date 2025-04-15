using tasktracking as tt from '../db/schema';

service TaskService {
    entity Users as projection on tt.Users;
    entity Roles as projection on tt.Roles;
    entity Projects as projection on tt.Projects;
    entity SubProjects as projection on tt.SubProjects;
    entity Tasks as projection on tt.Tasks;
    entity Efforts as projection on tt.Efforts;

    action markTaskAsClosed(taskID: UUID) returns Boolean;
}
