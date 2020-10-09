import * as axios from "axios";

export class CommonService {

    static retrievePackageGroups() {
        return axios.get("/order-service/lookup/package-group");
    }

    static retrievePackageTypes(group) {
        return axios.get("/order-service/lookup/package-type/byPackageGroupId/" + group.id);
    }

    static retrieveVehiclePermissionTypes() {
        return axios.get("/order-template-service/lookup/vehicle-permission-type");
    }

    static retrieveVehicleFeatures() {
        return axios.get("/order-template-service/lookup/vehicle-features");
    }

    static retrieveRangeTypes() {
        return axios.get("/order-template-service/lookup/range-type");
    }

    static retrieveApprovalTypes() {
        return axios.get("/order-template-service/lookup/approval-type");
    }

    static retrieveApprovalTypesExtended() {
        return axios.get("/order-template-service/lookup/approval-type-extended");
    }

    static retrieveWarehouseZoneTypes() {
        return axios.get("/location-service/lookup/warehouse-zone-type");
    }

    static retrieveWarehouseRampProperties() {
        return axios.get("/location-service/lookup/warehouse-ramp-property");
    }

    static retrieveWarehouseRampUsageTypes() {
        return axios.get("/location-service/lookup/warehouse-ramp-usage-type");
    }

    static retrieveWarehouseRampOperationTypes() {
        return axios.get("/location-service/lookup/warehouse-ramp-operation-type");
    }

    static retrieveWarehousePackageHandlingTypes() {
        return axios.get("/order-template-service/lookup/warehouse-package-handling-type");
    }

    static retrieveApprovalWorkflows() {
        return axios.get("/order-template-service/lookup/approval-workflow");
    }

    static retrieveDSLTypes() {
        return axios.get("/order-template-service/lookup/dsl-type");
    }

    static retrieveTruckLoadSubTypes() {
        return axios.get("/order-template-service/lookup/truck-load-sub-type");
    }

    static retrieveOrderPlanningOperationType() {
        return axios.get("/order-template-service/lookup/order-planning-operation-type");
    }

    static retrieveRegionCategory() {
        return axios.get("/order-template-service/lookup/region-category");
    }

    static retrieveExhaustEmissionTypes() {
        return axios.get("/order-template-service/lookup/exhaust-emission-type");
    }

    static retrieveLoadSpecs() {
        return axios.get("/order-template-service/lookup/load-spec");
    }

    static getHSCode(code){
        return axios.get("/order-service/search/hscode/byCode", {params: {code: code}});
    }

    static getDaysOfWeek(){
        return axios.get('/location-service/lookup/day-of-week');
    }
    static getPriorities(){
        return axios.get('/order-planning-service/lookup/priority');
    }
    static getServiceTypes() {
        return axios.get('/order-service/lookup/service-type/');
    }
    static getADRClasses() {
        return axios.get('/order-service/lookup/adr-class');
    }
    static getTruckLoadTypes(){
        return axios.get('/order-service/lookup/truck-load-type/');
    }

    static retrieveVehicleFeaturesForCarrier() {
        return axios.get("/order-service/lookup/vehicle-features/filter/carrier");
    }

    static validateVehicleFeatures(features) {
        return axios.get("/order-service/vehicle-feature/validate/features", {params: {features: features.join(",")}});
    }

    static getEquipmentTypes(){
        return axios.get('/order-service/lookup/equipment-type');
    }

}