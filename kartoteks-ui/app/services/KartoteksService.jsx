import * as axios from "axios";

export class ImportQueueService {

    static testImportQueue(data) {
        return axios.post('/kartoteks-service/import-queue', data);
    }

    static list(params) {
        return axios.get('/kartoteks-service/import-queue', {params: params});
    }

    static queueStatus() {
        return axios.get('/kartoteks-service/import-queue-status');
    }

    static getQueueItem(id){
        return axios.get('/kartoteks-service/import-queue/' + id);
    }
    static completeQueueItem(id, company){
        return axios.put(`/kartoteks-service/import-queue/${id}/complete`, company);
    }

    static getNextQueueItem(){
        return axios.get('/kartoteks-service/import-queue/next-item');
    }
    static getCompanyFromQueue(id){
        return axios.get(`/kartoteks-service/import-queue/${id}/company`);
    }
    static topPriorityQueue(){
        return axios.get('/kartoteks-service/import-queue/top-priority');
    }
    static myStats(){
        return axios.get('/kartoteks-service/import-queue/my-stats');
    }
    static userStats(){
        return axios.get('/kartoteks-service/import-queue/user-stats');
    }
    static burnDown(period){
        return axios.get('/kartoteks-service/import-queue/burn-down', {params: {period: period}});
    }
    static stats(){
        return axios.get('/kartoteks-service/import-queue/stats');
    }

    static startQueueImport(id){
        return axios.get(`/kartoteks-service/import-queue/${id}/start`);
    }
}

export class ExportQueueService {
    static list(params) {
        return axios.get('/kartoteks-service/export-queue', {params: params});
    }
    static execute(queueId) {
        return axios.post(`/kartoteks-service/export-queue/${queueId}/execute`, null);
    }
    static queueStatus() {
        return axios.get('/kartoteks-service/export-queue-status');
    }

}

export class CompanyService{
    static getCompany(id){
        return axios.get(`/kartoteks-service/company/${id}`);
    }
    static saveCompany(company){
        if(company.id){
            let url = '/kartoteks-service/company/' + company.id;
            return axios.put(url, company);
        }else{
            let url = '/kartoteks-service/company';
            return axios.post(url, company);
        }
    }
    static ensureUpdateIsAllowed(id) {
        let url = '/kartoteks-service/company/' + id +'/ensure-update-is-allowed';
        return axios.get(url);
    }
    static mergeCompanyWithCompany(company, otherCompany){
        return axios.put(`/kartoteks-service/company/${company.id}/merge-with/${otherCompany.id}`, company);
    }
    static moveLocationToCompany(location, company){
        return axios.post(`/kartoteks-service/location/${location.id}/move-to/${company.id}`, null);
    }
    static deleteCompany(id){
        return axios.delete(`/kartoteks-service/company/${id}`);
    }
    static ensureCompanyCanBeDeleted(id, checkCompanyIdMapping) {
        return axios.get('/kartoteks-service/company/' + id + '/ensure-can-be-deleted?checkCompanyIdMapping=' + checkCompanyIdMapping);
    }
    static forceDeleteCompany(id){
        return axios.delete(`/kartoteks-service/company/${id}/force-delete`);
    }
    static validateCompany(company){
        return axios.put('/kartoteks-service/company/validate-company', company);
    }
    static validateLocations(locations){
        return axios.put('/kartoteks-service/company/validate-locations', locations);
    }
    static validateSectors(sectors){
        return axios.put('/kartoteks-service/company/validate-sectors', sectors);
    }
    static validateLocation(location){
        return axios.put('/kartoteks-service/location/validate', location);
    }
    static ensureLocationCanBeDeleted(id) {
        return axios.get('/kartoteks-service/location/' + id + '/ensure-can-be-deleted');
    }
    static validateContacts(contacts){
        return axios.put('/kartoteks-service/company/validate-contacts', contacts);
    }
    static validateContact(contact){
        return axios.put('/kartoteks-service/contact/validate', contact);
    }
    static searchPrefix(params){
        return axios.get('/kartoteks-service/search', {params: params});
    }
    static moreLikeThis(params){
        return axios.get('/kartoteks-service/search/more-like-this', {params: params});
    }
    static search(params){
        return axios.get('/kartoteks-service/search/query', {params: params});
    }
    static searchByCountry(params){
        return axios.get('/kartoteks-service/search/by-country', {params: params});
    }
    static countryAggregates(){
        return axios.get('/kartoteks-service/search/aggregate-country');
    }
    static getTaxOffice(code){
        return axios.get('/kartoteks-service/tax-office/' + code);
    }
    static searchGooglePlaces(query){
        return axios.get('/kartoteks-service/google-places/search', {params: {query: query}});
    }
    static searchCountry(countryName){
        return axios.get('/kartoteks-service/google-places/search', {params: {query: countryName, type: "country"}});
    }
    static getGooglePlaceDetails(placeId){
        return axios.get('/kartoteks-service/google-places/details', {params: {placeId: placeId}});
    }
    static autoCompleteGooglePlaces(query,region){
        return axios.get('/kartoteks-service/google-places/auto-complete', {params: {query: query, region: region}});
    }
    static reverseGeocode(lat, lng){
        return axios.get('/kartoteks-service/google-places/reverse-geocode', {params: {lat: lat, lng: lng}});
    }
    static reverseGeocodePlace(placeId){
        return axios.get('/kartoteks-service/google-places/reverse-geocode-place', {params: {placeId: placeId}});
    }
    static timezone(lat, lng){
        return axios.get('/kartoteks-service/google-places/timezone', {params: {lat: lat, lng: lng}});
    }
    static generateShortName(id, name){
        return axios.get('/kartoteks-service/company/short-name', {params: {companyId: id, name: name}});
    }
    static generateLocationShortName(locationId, name, city, district, otherLocationNames){
        return axios.get('/kartoteks-service/location/short-name', {params: {locationId: locationId, companyShortName: name, city: city, district: district, exclude: otherLocationNames}});
    }
    static updateShortNames(companyId, request){
        return axios.patch(`/kartoteks-service/company/${companyId}/update-short-name`, request);
    }
    static exportCompany(company){
        return axios.get(`/kartoteks-service/company/${company.id}/export`);
    }
}

export class LookupService{
    static PERSONAL = "PERSONAL";
    static TR = "TR";
    static getGenders(){
        return {data: [{id: "FEMALE", name: "Female"}, {id: "MALE", name: "Male"}]};
    }
    static getCountryList(){
        return axios.get('/kartoteks-service/country/all');
    }
    static getCompanyTypeList(){
        return axios.get('/kartoteks-service/company-type');
    }
    static getLocationTypeList(){
        return axios.get('/kartoteks-service/location-type');
    }
    static getTaxOfficeList(){
        return axios.get('/kartoteks-service/tax-office');
    }
    static getSalesPortfolioList(){
        return axios.get('/kartoteks-service/sales-portfolio');
    }
    static getPhoneTypeList(){
        return axios.get('/kartoteks-service/phone-type');
    }
    static getUsageTypeList(){
        return axios.get('/kartoteks-service/usage-type');
    }
    static getCompanySegmentTypeList(){
        return axios.get('/kartoteks-service/company-segment-type');
    }
    static getBusinessSegmentTypes(){
        return axios.get("/kartoteks-service/business-segment-type");
    }
    static getContactDepartments(){
        return axios.get("/kartoteks-service/contact-department");
    }
    static getContactTitles(){
        return axios.get("/kartoteks-service/contact-title");
    }
    static getParentSectors(){
        return axios.get("/kartoteks-service/sector");
    }
    static getSubSectors(parentId){
        return axios.get(`/kartoteks-service/sector/${parentId}/subsectors`);
    }
    static getCompanyRoleTypes(){
        return axios.get("/kartoteks-service/company-role-type");
    };
    static getEmployeeCustomerRelations(){
        return axios.get("/kartoteks-service/employee-customer-relation");
    };
    static getCompanyRelationTypes(){
        return axios.get("/kartoteks-service/company-relation-type");
    }
    static searchGoogleForImages(text){
        return axios.get('/google-image-service/search', {params: {q: text}});
    }
    static verifyTaxOfficeAndID(params){
        return axios.get('/taxoffice-verify-service/verify', {params: params});
    }
    static verifyEORINumber(params){
        return axios.get('/taxoffice-verify-service/verify-eori', {params: params});
    }
    static searchLinkedinProfiles(firstName, lastName){
        return axios.get('/linkedin-search-service/search', {params: {firstname: firstName, lastname: lastName}});
    }
    static getPropertyValue(propertyKey) {
        return axios.get('/kartoteks-service/property/' + propertyKey);
    }
}

