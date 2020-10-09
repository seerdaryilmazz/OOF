import * as axios from "axios";

export class AuthorizationService {

    static getSubsidiariesOfCurrentUser() {
        return axios.get("/authorization-service/user-details/subsidiaries-current-user");
    }

    static getSubsidiaries() {
        return axios.get("/authorization-service/subsidiary");
    }

    static checkAuthorizedUserForOrder(companyId){
        return axios.get(`/authorization-service/customer-group/authorize/company/${companyId}`);
    }
    
    static getAuthorizedCompanies(){
        return axios.get(`/authorization-service/customer-group/authorize/company`);
    }

}