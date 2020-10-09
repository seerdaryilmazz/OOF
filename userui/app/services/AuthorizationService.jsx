import * as axios from "axios";

export class AuthorizationService {

    //1--
    static NODE_TYPE_SUBSIDIARY = "Subsidiary";
    static NODE_TYPE_DEPARTMENT = "Department";
    static NODE_TYPE_SECTOR = "Sector";
    static NODE_TYPE_CUSTOMER = "Customer";
    static NODE_TYPE_TEAM = "Team";
    static NODE_TYPE_CUSTOMER_GROUP = "CustomerGroup";

    static AUTH_LEVEL_MEMBER = 100;
    static AUTH_LEVEL_SUPERVISOR = 200;
    static AUTH_LEVEL_MANAGER = 300;

    static AUTH_LEVEL_MEMBER_LABEL = "Member";
    static AUTH_LEVEL_SUPERVISOR_LABEL = "Supervisor";
    static AUTH_LEVEL_MANAGER_LABEL = "Manager";

    static MEMBERSHIP_LEVEL_MEMBER = AuthorizationService.AUTH_LEVEL_MEMBER;
    static MEMBERSHIP_LEVEL_SUPERVISOR = AuthorizationService.AUTH_LEVEL_SUPERVISOR;
    static MEMBERSHIP_LEVEL_MANAGER = AuthorizationService.AUTH_LEVEL_MANAGER;

    static MEMBERSHIP_LEVEL_MEMBER_LABEL = AuthorizationService.AUTH_LEVEL_MEMBER_LABEL;
    static MEMBERSHIP_LEVEL_SUPERVISOR_LABEL = AuthorizationService.AUTH_LEVEL_SUPERVISOR_LABEL;
    static MEMBERSHIP_LEVEL_MANAGER_LABEL = AuthorizationService.AUTH_LEVEL_MANAGER_LABEL;

    //2--
    static getAllNodeLabelsForAuthorization() {
        return [
            {id: AuthorizationService.NODE_TYPE_SUBSIDIARY, name: AuthorizationService.NODE_TYPE_SUBSIDIARY},
            {id: AuthorizationService.NODE_TYPE_DEPARTMENT, name: AuthorizationService.NODE_TYPE_DEPARTMENT},
            {id: AuthorizationService.NODE_TYPE_SECTOR, name: AuthorizationService.NODE_TYPE_SECTOR},
            {id: AuthorizationService.NODE_TYPE_CUSTOMER, name: AuthorizationService.NODE_TYPE_CUSTOMER},
            {id: AuthorizationService.NODE_TYPE_TEAM, name: AuthorizationService.NODE_TYPE_TEAM},
            {id: AuthorizationService.NODE_TYPE_CUSTOMER_GROUP, name: "Customer Service Portfolio"},
        ];
    }

    //3--
    static getUserByNode(node){
        return axios.get(`/authorization-service/auth/user/byNodeId/${node.id}`);
    } 
    
    //4--
    static getActiveUserByNode(node){
        return axios.get(`/authorization-service/auth/user/byNodeId/${node.id}/active`);
    } 


    static getUserDetails(username){
        return axios.get(`/authorization-service/user-details/${username}`);
    }

    static saveUser(user){
        return axios.put(`/authorization-service/user-details/${user.name}`, user);
    }

    static saveUserMemberships(username, memberships){
        return axios.put(`/authorization-service/user-details/${username}/memberships`, memberships);
    }

    static getNode(id){
        return axios.get(`/authorization-service/node/${id}`);
    }
    static getNode(externalId, nodeType){
        return axios.get(`/authorization-service/node/${nodeType}/${externalId}`);
    }

    static getAllDepartments() {
        return axios.get("/authorization-service/lookup/department");
    }

    static getAuthTeams() {
        return axios.get("/authorization-service/auth/team/");
    }

    static getCompaniesOwnedByEkol() {
        return axios.get('/kartoteks-service/company/owned-by-ekol');
    }
    static getParentSectors() {
        return axios.get('/kartoteks-service/sector');
    }
    static saveAuthorization(menuItemRequest){
        return axios.post('/authorization-service/auth/menu-item/menu', menuItemRequest);
    }
    static listAuthorizationsFor(menu){
        return axios.get('/authorization-service/auth/menu-item/menu/' + menu.id);
    }

    static deleteAuthorizationsFor(menuId){
        return axios.delete('/authorization-service/auth/menu-item/menu/' + menuId);
    }
    static getSubsidiaries() {
        return axios.get("/authorization-service/subsidiary/");
    }

}

export class TeamService {
    static saveOrUpdate(team){
        if(team.id){
            return axios.put(`/authorization-service/team/${team.id}`, team);
        } else {
            return axios.post(`/authorization-service/team`, team);
        }
    }

    static updateStatus(team){
        return axios.put(`/authorization-service/team/${team.id}/status`, team);
    }
    
    static getByName(teamName, ignoreCase){
        return axios.get(`/authorization-service/team/by-name/${teamName}`, { params: { ignoreCase: ignoreCase } });
    }

    static get(team){
        return axios.get(`/authorization-service/team/${team.id}`);
    }
    
    static getNode(team){
        return axios.get(`/authorization-service/team/${team.id}/node`);
    }
    
    static list(status) {
        let params = _.isArray(status) ? { params: { status: status.join(',') } } : null;
        return axios.get(`/authorization-service/team`, params);
    }
}