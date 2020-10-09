import * as axios from "axios";


export class OrderService {

    static validateVehicleFeatures(features){
        return axios.get('/order-service/vehicle-feature/validate/features',
            {params: {features: features.join(",")}});
    }

    static calculateVolume(params) {
        return axios.get('/order-service/shipment/calculate-volume', {params: params});
    }

    static calculateLdm(params) {
        return axios.get('/order-service/shipment/calculate-ldm', {params: params});
    }
}