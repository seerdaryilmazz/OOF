import * as axios from "axios";


export class CrmInboundService {

    static getLookup(lookup, params) {
        return axios.get(`/crm-inbound-service/inbound/lookup/${lookup}`,{params: params});
    }

    static getInbound(id) {
        return axios.get(`/crm-inbound-service/inbound/${id}`);
    }

    static findAccount(address) {
        return axios.post(`/crm-inbound-service/inbound/account`, { address: address });
    }

    static proposeQuote(params) {
        return axios.get(`/crm-inbound-service/inbound/propose-quote`, { params: params });
    }
}