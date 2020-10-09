import * as axios from 'axios';

export class TranslatorService {

    static getSupportedLocales() {
        return axios.get('/translator-service/supportedLocale');
    }

    static putTranslations(data) {
        return axios.put('/translator-service/translation', data);
    }

    static getTranslation(appName, key) {
        return axios.get('/translator-service/translation?appName=' + appName + '&key=' + key);
    }

    static updateSupportedLocale(data) {
        return axios.put('/translator-service/supportedLocale', data);
    }

    static deleteSupportedLocale(id) {
        return axios.delete('/translator-service/supportedLocale/' + id);
    }

    static getTranslationViews() {
        return axios.get('/translator-service/lookup/translation-view');
    }
    static getStatuses() {
        return axios.get('/translator-service/lookup/status');
    }
}

export class ApplicationService {

    static listAll() {
        return axios.get('/translator-service/application');
    }
    static get(id) {
        return axios.get(`/translator-service/application/${id}`);
    }
    static save(application) {
        if (application.id) {
            return axios.put(`/translator-service/application/${application.id}`, application);
        } else {
            return axios.post(`/translator-service/application`, application);
        }
    }
    static delete(id) {
        return axios.delete(`/translator-service/application/${id}`);
    }
}
export class LocaleService {

    static listByStatus(status) {
        return axios.get('/translator-service/locale/by-status', { params: { status: status } });
    }

    static listAll() {
        return axios.get('/translator-service/locale');
    }
    static get(id) {
        return axios.get(`/translator-service/locale/${id}`);
    }

    static save(locale) {
        if (locale.id) {
            return axios.put(`/translator-service/locale/${locale.id}`, locale);
        } else {
            return axios.post(`/translator-service/locale`, locale);
        }
    }

    static delete(id) {
        return axios.delete(`/translator-service/locale/${id}`);
    }

    static updateStatus(id, status) {
        return axios.put(`/translator-service/locale/${id}/status`, {}, { params: { status: status } });
    }

}
