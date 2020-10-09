import * as axios from "axios";

export class ConfigurationManagementService {
    static listOptions(){
        return axios.get(`/configuration-management-service/option`);
    }
}