import * as axios from "axios";

export class VehicleService {

    static trailers() {
        return axios.get('/vehicle-service/trailer/bycountryiso?countryIso=TR');
    }

    static allTrailers() {
        return axios.get('/vehicle-service/trailer');
    }

    static allAvailableTrailers(){
        return axios.get('/vehicle-location-service/trailer');
    }

    static trailerProperties() {
        return axios.get('/vehicle-service/lookup/trailer-property');
    }

    static truckProperties() {
        return axios.get('/vehicle-service/lookup/truck-property');
    }
}