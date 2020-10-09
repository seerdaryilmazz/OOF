import * as axios from "axios";


export class OutlookService {

    static getLoginUrl() {
        return axios.get("/outlook-service/outlook/loginUrl");
    }
    static checkIfAccountIsValid(params) {
        return axios.get(`/outlook-service/outlook/isValid`, {params: params});
    }
    static sendMail(data) {
        return axios.post("/outlook-service/outlook/sendMail", data);
    }


}