import * as axios from "axios";

export class PlanningService {

    static warehouses() {
        return axios.get('/order-planning-service/warehouse');
    }
}