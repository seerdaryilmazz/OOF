import * as axios from "axios";

export class LookupService{

    static getCountries(){
        return axios.get('/crm-account-service/lookup/country');
    }
    static getCountryByIso(iso){
        return axios.get('/crm-account-service/lookup/country/byIso', {params: {iso: iso}});
    }
    static getCountyPoints(iso, type){
        return axios.get(`/crm-account-service/lookup/country-point/byCountry/${iso}`, {params: {type: type}});
    }
    static getAllCountryPointsByType(type){
        return axios.get(`/crm-account-service/lookup/country-point/listByType`, {params: {type:type}});
    }
    static getShipmentLoadingType(serviceArea){
        return axios.get(`/crm-account-service/lookup/shipment-loading-type/${serviceArea}`);
    }
    static getFrequencyTypes(){
        return axios.get('/crm-account-service/lookup/frequency-type');
    }

    static getTransportingCompanies(type){
        return axios.get(`/crm-quote-service/quote/transporting-companies-by-type`, {params: {type: type}});
    }

    static getChargeableVolumes(shipmentLoadingType){
        if(shipmentLoadingType){
            return axios.get(`/crm-account-service/lookup/chargeable-volume/${shipmentLoadingType}`);
        }
        return axios.get(`/crm-account-service/lookup/chargeable-volume`);
    }
    static getContainerTypes(){
        return axios.get(`/crm-account-service/lookup/container-type`);
    }
    static getChargeableWeights(){
        return axios.get(`/crm-account-service/lookup/chargeable-weight`);
    }
    static getIncotermExplanation(){
        return axios.get(`/crm-account-service/lookup/incoterm-explanation`);
    }
    static getLoadWeightTypes(){
        return axios.get('/crm-account-service/lookup/load-weight-type');
    }
    static getSegmentTypes(){
        return axios.get(`/crm-account-service/lookup/segment-type`);
    }
    static getAccountTypes(){
        return axios.get(`/crm-account-service/lookup/account-type`);
    }
    static getTotalLogisticsPotentials(){
        return axios.get(`/crm-account-service/lookup/total-logistics-potential`);
    }
    static getCustomsTypes(){
        return axios.get('/crm-account-service/lookup/customs-type');
    }
    static getQuoteTypes(){
        return axios.get(`/crm-quote-service/lookup/quote-type`);
    }
    static getQuoteTypeByCode(code){
        return axios.get(`/crm-quote-service/lookup/quote-type/${code}`);
    }
    static getServiceAreaByCode(code){
        return axios.get(`/kartoteks-service/business-segment-type/code/${code}`);
    }
    static getQuoteStatuses(code){
        return axios.get(`/crm-quote-service/lookup/quote-status`);
    }
    static getQuoteStatusByCode(code){
        return axios.get(`/crm-quote-service/lookup/quote-status/${code}`);
    }
    static getStackabilityTypes(){
        return axios.get(`/crm-quote-service/lookup/stackability-type`);
    }
    static getServiceTypes(serviceArea, category){
        return axios.get(`/crm-quote-service/lookup/service-type`, {params: {serviceArea: serviceArea, category: category}});
    }
    static getExtraServiceTypes(serviceArea, subsidiaryId){
        return axios.get(`/crm-quote-service/lookup/service-type/extra-service`, {params: {serviceArea: serviceArea, subsidiaryId: subsidiaryId}});
    }
    static getLoadTypes(serviceArea){
        return axios.get(`/crm-quote-service/lookup/load-type/${serviceArea}`, serviceArea);
    }
    static getBillingItems(serviceArea){
        return axios.get(`/crm-quote-service/lookup/billing-item/serviceArea/${serviceArea}`, serviceArea);
    }
    static getRiskFactors(){
        return axios.get(`/crm-quote-service/lookup/risk-factor`);
    }
    static getPaymentTypes(){
        return axios.get(`/crm-quote-service/lookup/payment-type`);
    }
    static getPaymentDueDays(){
        return axios.get(`/crm-quote-service/lookup/payment-due-days`);
    }
    static getLostReasons(){
        return axios.get(`/crm-quote-service/lookup/lost-reason`);
    }
    static getServiceAreas(){
        return axios.get("/kartoteks-service/business-segment-type");
    }
    static getLoadingTypes(serviceArea){
        return axios.get(`/crm-quote-service/lookup/loading-type/`,{params: {serviceArea: serviceArea}});
    }
    static getDeliveryTypes(operation , serviceArea){
        return axios.get(`/crm-quote-service/lookup/delivery-type`, {params: {operation,serviceArea}});
    }
    static getVehicleType(){
        return axios.get(`/crm-quote-service/lookup/vehicle-type`);
    }
    static getClearanceResponsibles(activity, operation, incoterm){
        let params = {
            activity: activity,
            operation: operation,
            incoterm: incoterm
        };
        return axios.get(`/crm-quote-service/lookup/clearance-responsible`, {params: params});
    }
    static getCustomsClearanceTypes(activity, operation){
        let params = {
            activity: activity,
            operation: operation
        };
        return axios.get(`/crm-quote-service/lookup/customs-clearance-type`, {params: params});
    }
    static getTransportationTypes(){
        return axios.get(`/crm-quote-service/lookup/transportation-type`);
    }
    static getCalculationTypes(shipmentLoadingType){
        return axios.get(`/crm-quote-service/lookup/calculation-type/${shipmentLoadingType}`, shipmentLoadingType);
    }
    static getCustomsServiceTypes(){
        return axios.get(`/crm-quote-service/lookup/customs-service-type`);
    }
    static getIncoterms(){
        return axios.get(`/order-service/incoterm`);
    }
    static getPackageTypes(){
        return axios.get(`/order-service/lookup/package-type`);
    }
    static getVehicleFeatures() {
        return axios.get('/order-service/lookup/vehicle-features/filter/create-order');
    }
    static getActivityScopes(){
        return axios.get(`/crm-activity-service/lookup/activity-scope`);
    }
    static getActivityTools(){
        return axios.get(`/crm-activity-service/lookup/activity-tool`);
    }
    static getActivityStatus(){
        return axios.get(`/crm-activity-service/lookup/activity-status`);
    }
    static getActivityTypes(){
        return axios.get(`/crm-activity-service/lookup/activity-type`);
    }
    static getActivityTypesByTool(activityTool){
        return axios.get(`/crm-activity-service/lookup/activity-type/by-tool`, {params: {activityTool:activityTool}});
    }
    static getShowAs(){
        return axios.get(`/crm-activity-service/lookup/show-as`);
    }
    static getExistenceTypes(){
        return axios.get(`/crm-quote-service/lookup/existence-type`);
    }
    static getCurrencies(){
        return axios.get(`/crm-quote-service/lookup/currency`);
    }
    static getUnitOfMeasures(scope){
        return axios.get(`/crm-quote-service/lookup/unit-of-measure`, {params: {scope: scope}});
    }
    static getRoundTypes(){
        return axios.get(`/crm-quote-service/lookup/round-type`);
    }
    static getHangingGoodsCategories(){
        return axios.get(`/crm-quote-service/lookup/hanging-goods-category`);
    }
    static getNoteTypes(){
        return axios.get(`/note-service/lookup/note-type`);
    }
    static getContactDepartments(){
        return axios.get("/kartoteks-service/contact-department");
    }
    static getContactTitles(){
        return axios.get("/kartoteks-service/contact-title");
    }
    static getPhoneTypeList(){
        return axios.get('/kartoteks-service/phone-type');
    }
    static getUsageTypeList(){
        return axios.get('/kartoteks-service/usage-type');
    }
    static getParentSectors(){
        return axios.get("/kartoteks-service/sector");
    }
    static getSubSectors(parentId){
        return axios.get(`/kartoteks-service/sector/${parentId}/subsectors`);
    }
    static getGenders(){
        return {data: [{id: "FEMALE", name: "Female"}, {id: "MALE", name: "Male"}]};
    }
    static searchLinkedinProfiles(firstName, lastName){
        return axios.get('/linkedin-search-service/search', {params: {firstname: firstName, lastname: lastName}});
    }
    static getAgreementTypes() {
        return axios.get(`/agreement-service/lookup/agreement-type`);
    }
    static getRenewalDateTypes() {
        return axios.get(`/agreement-service/lookup/renewal-date-type`);
    }
    static getAgreementCategoryByCode(code) {
        return axios.get(`/agreement-service/lookup/agreement-category/${code}`);
    }
    static getStampTaxPayer() {
        return axios.get(`/agreement-service/lookup/stamp-tax-payer`);
    }
    static getApographType() {
        return axios.get(`/agreement-service/lookup/apograph-type`);
    }
    static getInsuranceTypes(){
        return axios.get(`/agreement-service/lookup/insurance-type`);
    }
    static getEkolOrCustomer(){
        return axios.get(`/agreement-service/lookup/ekol-or-customer`);
    }
    static getResponsbilityTypes() {
        return axios.get(`/agreement-service/lookup/responsibility-type`);
    }
    static getBasedOnTypes(){
        return axios.get(`/agreement-service/lookup/basedOn-type`);
    }
    static getBillingItemsByServiceAreas(serviceAreas){
        return axios.post(`/crm-quote-service/lookup/billing-item/serviceAreas`, serviceAreas);
    }
    static getOpportunityExistenceTypes(){
        return axios.get(`/crm-opportunity-service/lookup/existence-type`);
    }
    static getOpportunityFrequencyTypes(){
        return axios.get(`/crm-opportunity-service/lookup/frequency-type`);
    }
    static getOpportunityCloseReasonTypes(){
        return axios.get(`/crm-opportunity-service/lookup/close-reason-type`);
    }
    static getOpportunityCloseTypes(){
        return axios.get("/crm-opportunity-service/lookup/close-type")
    }
    static getOpportunityStatuses(){
        return axios.get("/crm-opportunity-service/lookup/opportunity-status")
    }
}