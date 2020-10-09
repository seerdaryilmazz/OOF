import * as axios from "axios";

export class AuthorizationService {

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

    static getUserByNode(node){
        return axios.get(`/authorization-service/auth/user/byNodeId/${node.id}`);
    } 
    
    static getActiveUserByNode(node){
        return axios.get(`/authorization-service/auth/user/byNodeId/${node.id}/active`);
    } 

    static getGraph(node, params){
        return axios.get(`/authorization-service/graph/${node.id}`, {params: params});
    }

    static getAllDepartments() {
        return axios.get("/authorization-service/lookup/department");
    }

    static deleteDepartment(departmentId) {
        return axios.delete("/authorization-service/lookup/department/" + departmentId);
    }

    static saveDepartment(department) {
        if(department.id){
            return this.updateDepartment(department);
        }else{
            return this.addDepartment(department);
        }
    }

    static addDepartment(department) {
        return axios.post("/authorization-service/lookup/department", department);
    }

    static updateDepartment(department) {
        return axios.put("/authorization-service/lookup/department/" + department.id, department)
    }

    static getAuthTeams() {
        return axios.get("/authorization-service/auth/team/");
    }
    
    static mergeInheritRelation(inheritRelation) {
        return axios.post("/authorization-service/relation/inherit", inheritRelation);
    }
    
    static deleteInheritRelation(fromId, toId) {
        return axios.delete("/authorization-service/relation/inherit", { params: { fromId: fromId, toId: toId } });
    }

    static mergeAuthorizedRelation(authorizedRelation) {
        return axios.post("/authorization-service/relation/authorized", authorizedRelation);
    }

    static mergeMemberOfRelation(memberOfRelation) {
        return axios.post("/authorization-service/relation/memberOf", memberOfRelation);
    }

    static deleteMemberOfRelation(fromId, toId) {
        return axios.delete("/authorization-service/relation/memberOf", { params: { fromId: fromId, toId: toId } });
    }

    static getAllOperations() {
        return axios.get("/authorization-service/operation");
    }

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

    static searchOperation(filter){
        return axios.get("/authorization-service/operation/search",
            {params: {
                name: filter.name,
                description: filter.description,
                startDate: filter.dateRange ? filter.dateRange.startDate : null,
                endDate: filter.dateRange ? filter.dateRange.endDate : null
        }});
    }
    static saveOperation(operation){
        return axios.put("/authorization-service/operation/" + operation.name, operation);
    }
    static getAuthorizations(operation){
        return axios.get("/authorization-service/auth/operation/search", {params:{name: operation.name}});
    }
    static saveAuthorization(operation, authList){
        return axios.post("/authorization-service/auth/operation/save", {operation: operation, authorizations: authList});
    }
    static deleteAuthorization(auth){
        return axios.delete("/authorization-service/operation", operation);
    }

    static getSubsidiariesOfCurrentUser() {
        return axios.get("/authorization-service/user-details/subsidiaries-current-user");
    }

    static getSubsidiaries() {
        return axios.get("/authorization-service/subsidiary/");
    }

    static getSubsidiary(id) {
        return axios.get("/authorization-service/subsidiary/" + id);
    }

    static saveSubsidiary(subsidiary) {
        if (!_.isNil(subsidiary.id)) {
            return axios.put("/authorization-service/subsidiary/" + subsidiary.id, subsidiary);
        } else {
            return axios.post("/authorization-service/subsidiary", subsidiary);
        }
    }

    static deleteSubsidiary(id) {
        return axios.delete("/authorization-service/subsidiary/" + id);
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

    static getSubsidiaries(){
        return axios.get("/authorization-service/subsidiary");
    }
    
    static getInheritedAuthorizedOperations(id){
        return axios.get(`/authorization-service/auth/operation/inherited/${id}`);
    }
    
    static getAuthorizedOperations(id){
        return axios.get(`/authorization-service/auth/operation/authorized/${id}`);
    }

    static getNode(id){
        return axios.get(`/authorization-service/node/${id}`);
    }
    static getNode(externalId, nodeType){
        return axios.get(`/authorization-service/node/${nodeType}/${externalId}`);
    }
    static getDepartmentTeams(departmentCode, params){
        return axios.get(`/authorization-service/department-management/${departmentCode}/teams`, {params: params});
    }
    static getDepartmentByCode(departmentCode){
        return axios.get(`/authorization-service/lookup/department/by-code/${departmentCode}`);
    }
}

export class CustomerGroupService {

    static getByInheritedEntity(entity){
        return axios.get(`/authorization-service/customer-group/by-inherited/${entity.externalId}`);
    }
    
    static getAll(){
        return axios.get(`/authorization-service/customer-group`);
    }

    static get(id){
        return axios.get(`/authorization-service/customer-group/${id}`);
    }

    static search(filter) {
        return axios.get(`/authorization-service/customer-group/search`, {
            params: {
                groupName: filter.groupName,
                companyName: filter.companyName
            }
        });
    }

    static create(item){
        return axios.post(`/authorization-service/customer-group`, item);
    }
    
    static update(id, item){
        return axios.put(`/authorization-service/customer-group/${id}`, item);
    }

    static delete(item){
        return axios.delete(`/authorization-service/customer-group/${item.id}`);
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