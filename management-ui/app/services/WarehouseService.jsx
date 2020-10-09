import * as axios from "axios";

export class WarehouseService {

    static list() {
       return axios.get("/location-service/location/warehouse");
    }

    static get(warehouseId) {
        return axios.get("/location-service/location/warehouse/" + warehouseId);
    }

    static save(warehouse) {
        if (warehouse.id) {
            return axios.put("/location-service/location/warehouse/" + warehouse.id, warehouse);
        } else {
            return axios.post("/location-service/location/warehouse", warehouse);
        }
    }

    static delete(warehouseId) {
        return axios.delete("/location-service/location/warehouse/" + warehouseId);
    }

    static validateWarehouseZones(warehouse) {
        return axios.post("/location-service/location/warehouse/validate/zone", warehouse);
    }

    static validateWarehouseRamps(warehouse) {
        return axios.post("/location-service/location/warehouse/validate/ramp", warehouse);
    }

    static getWarehouseOwnerTypes() {
        return axios.get("/location-service/lookup/warehouse-owner-type");
    }

    static getWarehouseByCompanyLocation(companyLocationId) {
        return axios.get("/location-service/location/warehouse/bycompanylocation/" + companyLocationId);
    }

    static retrieveWarehousesNameIdPair() {
        return axios.get('/location-service/location/warehouse/idnamepair');
    }

    static listRampsToBeRemoved(warehouse) {
        return axios.post("/location-service/location/warehouse/ramp/listtoberemoved", warehouse);
    }

    static search(terms){
        return axios.post("/location-service/location/warehouse/search", terms);
    }


}