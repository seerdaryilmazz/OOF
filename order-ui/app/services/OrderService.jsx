import * as axios from "axios";

export class OrderRequestService {

    static SPOT = "SPOT";
    static CONTRACTED = "CONTRACTED";

    static save(data){
        return axios.post('/order-service/transport-order-req/', data);
    }

    static get(id){
        return axios.get('/order-service/transport-order-req/' + id);
    }

    static getByOrderId(orderId){
        return axios.get('/order-service/transport-order-req/by-order-id?orderId=' + orderId);
    }

    static getLast10CreatedByCurrentUser() {
        return axios.get('/order-service/transport-order-req/current-user-last-10');
    }

    static getJustOrderId(id) {
        return axios.get('/order-service/transport-order-req/' + id + '/get-just-order-id');
    }
}
export class OrderService {
    static save(order) {
        if(order.id) {
            return axios.put('/order-service/transport-order/' + order.id, order);
        } else {
            return axios.post('/order-service/transport-order', order);
        }
    }
    static create(order) {
        return axios.post('/order-service/order', order);
    }

    static updateServiceType(orderId, request) {
        return axios.patch(`/order-service/order/${orderId}/service-type`, request);
    }
    
    static updateStatus(orderId, request) {
        return axios.patch(`/order-service/order/${orderId}/status`, request);
    }

    static updateTruckLoadType(orderId, request) {
        return axios.patch(`/order-service/order/${orderId}/truck-load-type`, request);
    }

    static updateCustomerOrderNumbers(shipmentId, value){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/customer-order-numbers`, value);
    }
    static updateSenderOrderNumbers(shipmentId, value){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/sender-order-numbers`, value);
    }
    static updateLoadingOrderNumbers(shipmentId, value){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/loading-order-numbers`, value);
    }
    static updateConsigneeOrderNumbers(shipmentId, value){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/consignee-order-numbers`, value);
    }
    static updateUnloadingOrderNumbers(shipmentId, value) {
        return axios.patch(`/order-service/order-shipment/${shipmentId}/unloading-order-numbers`, value);
    }
    static updateReadyDate(shipmentId, request){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/ready-date`, request);
    }
    static updateLoadingAppointment(shipmentId, request){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/loading-appointment`, request);
    }
    static updateUnloadingAppointment(shipmentId, request){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/unloading-appointment`, request);
    }
    static deleteUnloadingAppointment(shipmentId){
        return axios.delete(`/order-service/order-shipment/${shipmentId}/unloading-appointment`);
    }
    static updateIncoterm(shipmentId, request){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/incoterm`, request);
    }
    static updatePaymentMethod(shipmentId, request){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/payment-method`, request);
    }
    static updateValueOfGoods(shipmentId, request){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/value-of-goods`, request);
    }
    static updateShipmentUnits(shipmentId, request){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/shipment-units`, request);
    }
    static updateShipmentDefinitionOfGoods(shipmentId, request){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/definition-of-goods`, request);
    }
    static setInsurance(shipmentId){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/set-insurance`);
    }
    static removeInsurance(shipmentId){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/remove-insurance`);
    }

    static deleteOrderDocument(orderId, documentId){
        return axios.delete(`/order-service/order/${orderId}/documents/${documentId}`);
    }
    static saveOrderDocuments(orderId, documents){
        return axios.patch(`/order-service/order/${orderId}/documents`, documents);
    }

    static deleteOrderShipmentDocument(shipmentId, documentId){
        return axios.delete(`/order-service/order-shipment/${shipmentId}/documents/${documentId}`);
    }

    static saveOrderShipmentDocuments(shipmentId, documents){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/documents`, documents);
    }

    static updateConsigneeOrderNumbers(id, value){
        return axios.patch(`/order-service/order-shipment/${id}/consignee-order-numbers`, value);
    }

    static getSenderOrderNumbers(id){
        return axios.get(`/order-service/order-shipment/${id}/sender-order-numbers`);
    }

    static getLoadingOrderNumbers(id){
        return axios.get(`/order-service/order-shipment/${id}/loading-order-numbers`);
    }
    
    static getConsigneeOrderNumbers(id){
        return axios.get(`/order-service/order-shipment/${id}/consignee-order-numbers`);
    }

    static getUnloadingOrderNumbers(id) {
        return axios.get(`/order-service/order-shipment/${id}/unloading-order-numbers`);
    }

    static getCustomerOrderNumbers(id){
        return axios.get(`/order-service/order-shipment/${id}/customer-order-numbers`);
    }
    static getShipmentDocuments(id){
        return axios.get(`/order-service/order-shipment/${id}/documents`);
    }
    static getOrderDocuments(id){
        return axios.get(`/order-service/order/${id}/documents`);
    }

    static deleteShipmentAdrDetails(shipmentId, id){
        return axios.delete(`/order-service/order-shipment/${shipmentId}/adr-details/${id}`);
    }
    static saveShipmentAdrDetails(shipmentId, shipmentAdrDetails){
        if(shipmentAdrDetails.id){
            return axios.patch(`/order-service/order-shipment/${shipmentId}/adr-details/${shipmentAdrDetails.id}`, shipmentAdrDetails);
        }
        return axios.post(`/order-service/order-shipment/${shipmentId}/adr-details/`, shipmentAdrDetails);
    }

    static saveDepartureCustoms(shipmentId, customsDetails){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/departure-customs`, customsDetails);
    }

    static saveArrivalCustoms(shipmentId, customsDetails){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/arrival-customs`, customsDetails);
    }

    static saveVehicleRequirements(shipmentId, requirements){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/vehicle-requirements`, requirements);
    }
    static saveEquipmentRequirement(shipmentId, requirement){
        if(requirement.id){
            return axios.patch(`/order-service/order-shipment/${shipmentId}/equipment-requirement`, requirement);
        }
        return axios.post(`/order-service/order-shipment/${shipmentId}/equipment-requirement`, requirement);

    }
    static deleteEquipmentRequirement(shipmentId, requirementId){
        return axios.delete(`/order-service/order-shipment/${shipmentId}/equipment-requirement/${requirementId}`);
    }

    static saveHealthCertificates(shipmentId, healthCertificates){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/health-certificates`, healthCertificates);
    }

    static saveTemperatureLimits(shipmentId, limits){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/temperature-limits`, limits);
    }
    
    static saveManufacturer(shipmentId, manufacturer){
        return axios.patch(`/order-service/order-shipment/${shipmentId}/manufacturer`, manufacturer);
    }

    static deleteManufacturer(shipmentId){
        return axios.delete(`/order-service/order-shipment/${shipmentId}/manufacturer`);
    }

    static confirmOrder(id, readyAtDate) {
        return axios.post('/order-service/transport-order/' + id + "/confirm", {readyAtDate: readyAtDate});
    }
    static confirmOrderRequest(id, readyAtDate) {
        var params = new URLSearchParams();
        params.append('readyAtDate', readyAtDate);
        return axios.post('/order-service/transport-order-req/' + id + "/confirm", params);
    }

    static list() {
        return axios.get('/order-service/transport-order');
    }

    static get(id) {
        return axios.get('/order-service/transport-order/' + id);
    }

    static getOrderById(id) {
        return axios.get('/order-service/order/' + id);
    }

    static getWithRuleSetDetails(id) {
        return axios.get('/order-service/transport-order/' + id + '/rule-set-details');
    }

    static getLookupsForCreateOrder(){
        return axios.get('/order-service/lookup/for-create-order');
    }

    static getServiceTypes() {
        return axios.get('/order-service/lookup/service-type/');
    }
    static getIncoTerms() {
        return axios.get('/order-service/lookup/incoterm/');
    }
    static getCurrencies(){
        return axios.get('/order-service/lookup/currency-type');
    }
    static getPaymentMethods(){
        return axios.get('/order-service/lookup/payment-method/');
    }
    static getTruckLoadTypes(){
        return axios.get('/order-service/lookup/truck-load-type/');
    }
    static getNewShipmentCode(){
        return axios.get("/order-service/shipment/new-shipment-code");
    }
    static getAdrClasses(){
        return axios.get('/order-service/lookup/adr-class/');
    }
    static getPackageTypes(){
        return axios.get("/order-service/lookup/package-type");
    }
    static getPackageTypesAndGroups(){
        return axios.get("/order-service/lookup/package-type/with-groups");
    }
    static getPackageTypeRestrictions(id){
        return axios.get(`/order-service/lookup/package-type/${id}/restrictions`);
    }
    static getPackageGroups() {
        return axios.get("/order-service/lookup/package-group");
    }
    static getAdrPackageTypes(){
        return axios.get("/order-service/lookup/adr-package-type");
    }
    static searchAdrClassDetails(unNumber){
        return axios.get(`/order-service/adr-class-details/${unNumber}`);
    }
    static getAdrUNIdDetails(idList){
        return axios.get(`/order-service/adr-class-details/list/${idList.join(",")}`);
    }
    static getHealthCertificateTypes(){
        return axios.get("/order-service/lookup/doc-type/health-certificates");
    }
    static getAdrDocumentTypes(){
        return axios.get("/order-service/lookup/doc-type/dangerous-goods");
    }
    static getCustomsOperationTypes(){
        return axios.get("/order-service/lookup/customs-operation-type");
    }
    static getShipmentDocumentTypes(){
        return axios.get("/order-service/lookup/doc-type/filter", {params: {exclude: "HEALTH_CERTIFICATE, DANGEROUS_GOODS"}});
    }
    static checkPackageDimension(type, packageType, value){
        return axios.get(`/order-service/package-type/restriction/${type}/${packageType}/${value}`);
    }
    static checkPackageGrossWeight(packageType, value){
        return checkPackageDimension('checkGrossWeight', packageType, value);
    }
    static checkPackageNetWeight(packageType, value){
        return checkPackageDimension('checkNetWeight', packageType, value);
    }
    static checkPackageVolume(packageType, value){
        return checkPackageDimension('checkVolume', packageType, value);
    }
    static checkPackageWidth(packageType, value){
        return checkPackageDimension('checkWidth', packageType, value);
    }
    static checkPackageLength(packageType, value){
        return checkPackageDimension('checkLength', packageType, value);
    }
    static checkPackageHeight(packageType, value){
        return checkPackageDimension('checkHeight', packageType, value);
    }

    static shipmentSearch(config) {
        return axios.post('/order-service/search/shipment', config);
    }

    static shipmentsSearch(config) {
        return axios.post('/order-service/search/shipments', config);
    }

    static listResponsibilitySegments(config, includePlanned) {
        return axios.post('/order-service/responsibility-segments?includePlanned=' + includePlanned, config);
    }

    static calculateLoadingMeter(width, length, stackSize, count){
        return axios.get('/order-service/shipment/calculate-ldm?length='+ length + '&width=' + width + '&stackSize=' + stackSize + '&count=' + count);
    }

    static calculateLoadingMeterAndVolume(width, length, height, stackSize, count){
        return axios.get('/order-service/shipment/calculate-volume-ldm',
            {params: {length: length, width: width, height: height, stackSize: stackSize, count: count}});
    }

    static calculatePayWeight(weight, volume, ldm){
        return axios.get('/order-service/shipment/calculate-pw?weight=' + weight + '&volume=' + volume + '&ldm=' + ldm);
    }

    static getTransportTypes(){
        return axios.get('/order-service/lookup/transport-type');
    }

    static getPermissionTypes(){
        return axios.get('/order-service/lookup/permission-type');
    }

    static getVehicleDetailTypes(vehicleType) {
        return axios.get('/order-service/lookup/vehicle-detail-type/byVehicleType/' + vehicleType);
    }

    static getVehicleTypes() {
        return axios.get('/order-service/lookup/vehicle-type');
    }

    static getVehicleFeatures() {
        return axios.get('/order-service/lookup/vehicle-features');
    }
    static getVehicleFeaturesForCreateOrder() {
        return axios.get('/order-service/lookup/vehicle-features/filter/create-order');
    }

    static getTransportOrder(id) {
        return axios.get('/order-service/transport-order/' + id);
    }

    static getEquipmentTypes(){
        return axios.get('/order-service/lookup/equipment-type');
    }

    static getShipment(id) {
        return axios.get('/order-service/shipment/' + id);
    }
    static getShipmentByShipmentCode(shipmentCode) {
        return axios.get(`/order-service/order`, {params:{shipmentCode: shipmentCode}});
    }

    static getDocumentTypes() {
        return axios.get('/order-service/lookup/doc-type/');
    }

    static getDocumentTypesFiltered(includeTypes, excludeTypes) {
        return axios.get('/order-service/lookup/doc-type/filter', {params: {exclude: excludeTypes, include: includeTypes}});
    }

    static getMyShipments(){
        return axios.get('/order-service/transport-order/my-shipments');
    }

    static getBarcodes(shipmentId){
        return axios.get('/order-service/barcode/' + shipmentId);
    }

    static isVehicleFeaturesConflict(requestData){
        return axios.post('/order-service/vehicle-feature/validate/feature-confliction', requestData);
    }
    static validateVehicleFeatureSets(required, notAllowed){
        return axios.get('/order-service/vehicle-feature/validate/feature-set',
            {params: {requiredFeatures: required.join(","), notAllowedFeatures: notAllowed.join(",")}});
    }
    static validateVehicleFeatures(features){
        return axios.get('/order-service/vehicle-feature/validate/features',
            {params: {features: features.join(",")}});
    }

    static isVehicleAppropriate(requestData){
        return axios.post('/order-service/vehicle-feature/validate/vehicle-appropriate', requestData);
    }

    static listAdrClassDetails(ids){
        return axios.get(`/order-service/adr-class-details/list/${ids}`);
    }

    static uploadFile(file){
        let data = new FormData();
        data.append("file", file);
        return axios.post('/order-service/order/documents/upload', data);
    }


}