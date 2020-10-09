import * as axios from "axios";


export class LocationService {

    static retrieveCustomsOffices(){
        return axios.get(`/location-service/location/customs-office`);
    }

    static retriveWarehouse(query){
        return axios.post(`/location-service/location/warehouse/query`,query);
    }
}