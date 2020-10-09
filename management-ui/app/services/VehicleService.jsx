import * as axios from "axios";

export class VehicleService {

    static getTrailerProperties() {
        return axios.get("/vehicle-service/lookup/trailer-property");
    }

    static retrieveTrailerModels() {
        return axios.get("/vehicle-service/trailer/model");
    }

    static retrieveContainerModels() {
        return axios.get("/vehicle-service/container/model");
    }

    static retrieveCarrierTypes() {
        return axios.get("/vehicle-service/lookup/carrier-type");
    }

    static retrieveVehicleEquipmentTypes() {
        return axios.get('/vehicle-service/vehicle-equipment-type');
    }

    static retrieveMotorVehicleBrands(){
        return axios.get('/vehicle-service/lookup/motor-vehicle-brand');
    }

    static getProfileTypes() {
        return axios.get('/vehicle-service/lookup/profile-type');
    }
}