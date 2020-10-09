import * as axios from "axios";

export class BillingService {

    static list() {
        return axios.get('/billing-service/event-billing-item');
    }

    static save(billingItem) {
        if (billingItem.id) {
            return axios.put('/billing-service/event-billing-item/' + billingItem.id, billingItem);
        } else {
            return axios.post('/billing-service/event-billing-item', billingItem);
        }
    }

    static delete(billingItem) {
        return axios.delete('/billing-service/event-billing-item/' + billingItem.id);
    }

    static listBillingEvents(){
        return axios.get('/billing-service/lookup/billing-event');
    }
    static listBillingItems(){
        return axios.get('/billing-service/billing-item');
    }
}