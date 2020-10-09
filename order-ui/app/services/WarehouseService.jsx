import * as axios from "axios";

export class WarehouseService {
    static retrieveWarehouses() {
        return axios.get('/location-service/location/warehouse');
    }
    static getWarehouse(id) {
        return axios.get('/location-service/location/warehouse/' + id);
    }
    static getBarcodePrinting(shipmentId){
        return axios.get('/warehouse-service/barcode/' + shipmentId + '/printing');
    }
    static getBarcodeHistory(shipmentId){
        return axios.get('/warehouse-service/barcode/' + shipmentId + '/history');
    }
    static getInventoryItem(shipmentId, warehouseId){
        return axios.get('/warehouse-service/inventory/' + shipmentId + '/' + warehouseId);
    }

}