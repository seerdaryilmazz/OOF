import * as axios from "axios";

export class KartoteksService {

    static getCompany(id){
        return axios.get(`/kartoteks-service/company/${id}`);
    }

    static getCountries() {
        return axios.get("/kartoteks-service/country/all");
    }
}