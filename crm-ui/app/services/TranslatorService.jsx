import * as axios from 'axios';

export class TranslatorService {

    static findActiveSupportedLocales() {
        return axios.get("/translator-service/locale/by-status?status=ACTIVE");
    }
}