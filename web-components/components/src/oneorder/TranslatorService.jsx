import * as axios from 'axios';

export class TranslatorService {

    static getTranslations(appName, locale) {
        return axios.get("/translator-service/translations/" + appName + "/" + locale);
    }

    static addNotTranslatedItems(notTranslatedItems) {
        return axios.post("/translator-service/notTranslated", notTranslatedItems);
    }
}