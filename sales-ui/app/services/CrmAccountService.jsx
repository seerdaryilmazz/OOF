import * as axios from "axios";

export class CrmAccountService{

    static listCountries(){
        return axios.get(`/crm-account-service/lookup/country`);
    }
}