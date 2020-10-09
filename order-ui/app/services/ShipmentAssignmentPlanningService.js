import * as axios from "axios";

export class ShipmentAssignmentPlanningService {

    static getShipmentAssignments(shipmentId) {
        return axios.get('/order-planning-service/shipment-assignment-plan/by-shipment-id/' + shipmentId);

    }
    static saveShipmentAssignmentPlan(shipmentAssignmentPlan){
        return axios.put('/order-planning-service/shipment-assignment-plan', shipmentAssignmentPlan);
    }

    static getMyShipmentSegments(){
        return axios.get('/order-planning-service/shipment-segment/my-unplanned');
    }

    static getMyColDistShipmentSegments(){
        return axios.get('/order-planning-service/shipment-segment/my-unplanned/col-dist');
    }

    static getMyLinehaulShipmentSegments(){
        return axios.get('/order-planning-service/shipment-segment/my-unplanned/linehaul');
    }

    static getMyFTLShipmentSegments(){
        return axios.get('/order-planning-service/shipment-segment/my-unplanned/ftl');
    }

    static divideSegments(request) {
        return axios.post('/order-planning-service/shipment-segment/divide', request);
    }

    static mergeableSegments(segmentId) {
        return axios.get('/order-planning-service/shipment-segment/' + segmentId + '/mergeable-segments');
    }

    static mergeSegments(request) {
        return axios.post('/order-planning-service/shipment-segment/merge', request);
    }

    static divideAssignments(request) {
        return axios.post('/order-planning-service/shipment-assignment-plan/divide', request);
    }

    static mergeAssignments(request) {
        return axios.post('/order-planning-service/shipment-assignment-plan/merge', request);
    }

    static updateWarehouse(request) {
        return axios.post('/order-planning-service/shipment-assignment-plan/update-warehouse', request);
    }

    static updateResponsible(request) {
        return axios.post('/order-planning-service/shipment-assignment-plan/update-responsible', request);
    }
}