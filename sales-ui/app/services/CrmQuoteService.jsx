import * as axios from "axios";

export class CrmQuoteService{

    static getBillingItems(serviceArea){
        return axios.get(`/crm-quote-service/lookup/billing-item/serviceArea/${serviceArea}`, serviceArea);
    }
}