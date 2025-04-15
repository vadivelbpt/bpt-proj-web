using tasktracking as tt from '../../db/schema';

service UserService {
    entity Users as projection on tt.Users;
    entity Roles as projection on tt.Roles;
    action addRole(name: String) returns UUID;
    action addUser(username: String, email: String, password: String, roleID: UUID) returns UUID;

    action getUsersByRoleId(role_ID: UUID) returns Users;

}

