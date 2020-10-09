import * as axios from "axios";

export class CrmAccountService {

    static findPotential(id) {
        return axios.get('/crm-account-service/account/' + id + '/potential');
    }

    static updatePotential(data) {
        return axios.put('/crm-account-service/account/' + data.id + '/potential', data);
    }

}