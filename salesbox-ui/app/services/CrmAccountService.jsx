import * as axios from "axios";

export class CrmAccountService {

    static findCountries() {
        return axios.get('/crm-account-service/lookup/country');
    }

    static findCountryPoints(countryIso, type) {
        return axios.get('/crm-account-service/lookup/country-point/byCountry/' + countryIso + '?type=' + type);
    }

    static findShipmentLoadingTypes(serviceArea) {
        return axios.get('/crm-account-service/lookup/shipment-loading-type/' + serviceArea);
    }

    static findLoadWeightTypes() {
        return axios.get('/crm-account-service/lookup/load-weight-type');
    }
}