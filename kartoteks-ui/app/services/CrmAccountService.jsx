import * as axios from "axios";

export class CrmAccountService {

    static findAccountByCompany(companyId, throwExceptionIfNotFound) {
        let params = {
            companyId: companyId,
            throwExceptionIfNotFound: throwExceptionIfNotFound
        };
        return axios.get('/crm-account-service/account/byCompany', {params: params});
    }

}