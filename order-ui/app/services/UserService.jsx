import * as axios from "axios";

export class UserService {

    static getCurrentTimeInCurrentUserTimeZone(){
        return axios.get('/user-service/time');
    }

    static getCurrentTime(timezone){
        return axios.get('/user-service/time/by-timezone', {
            params: {
                timezone: timezone
            }
        });
    }
}