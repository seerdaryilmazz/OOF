import * as axios from "axios";
import _ from 'lodash';

export class BillingService {

    static produceProvisionsOfOrderCanBeCreatedEvent(data) {
        return axios.post('/billing-service/event-producer/provisions-of-order-can-be-created', data);
    }

    static getAvailableWonQuotesByCompany(companyId) {
        return axios.get("/billing-service/common/available-won-quotes/by-company?companyId=" + companyId);
    }
}