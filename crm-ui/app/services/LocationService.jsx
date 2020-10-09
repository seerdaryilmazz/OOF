import * as axios from "axios";


export class LocationService {

    static retrieveWarehouses(ownerType, customsType, companyType, customsOfficeId, countryCode, point){
        let params = {
            ownerType: ownerType,
            customsType: customsType,
            companyType: companyType,
            customsOfficeId: customsOfficeId,
            countryCode: countryCode,
            postalCode: point
        }
        return axios.get(`/location-service/location/customs/warehouses`, {params: params});
    }

    static queryWarehouses(query){
        return axios.post(`/location-service/location/warehouse/query`,query);
    }

    static retrieveCustomsOffices(){
        return axios.get(`/location-service/location/customs-office`);
    }

    static getCountryByIso(iso) {
        return axios.get(`/location-service/country/by-iso/${iso}`);
    }
}