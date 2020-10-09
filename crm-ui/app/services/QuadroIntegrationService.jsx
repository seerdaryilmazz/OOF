import * as axios from "axios";

export class QuadroIntegrationService {

    static getCompanyInfoData(params){
        return axios.get("/quadro-integration-service/order-list", {params: params})
    }
}