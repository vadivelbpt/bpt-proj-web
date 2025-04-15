using tasktracking as tt from '../../db/schema';

service AuthService {
    entity Users as projection on tt.Users;
    entity Roles as projection on tt.Roles;

    action login(username: String, password: String) returns String; // Returns JWT Token
}
