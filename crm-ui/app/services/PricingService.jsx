import * as axios from 'axios';

export class PricingService {
    static query(path, subsidiaryId, parameters) {
        return axios.post(`/pricing-service/${path}/query`, parameters, { params: { 'subsidiary.id': subsidiaryId } });
    }
}