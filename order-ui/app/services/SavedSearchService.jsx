import * as axios from "axios";

export class SavedSearchService {

    static getMySavedSearches() {
        return axios.get('/order-service/mySavedSearches');
    }

    static getMySavedSearch(id) {
        return axios.get('/order-service/mySavedSearches/id');
    }

    static addMySavedSearch(data) {
        return axios.post('/order-service/mySavedSearches', data);
    }

    static updateMySavedSearch(id, data) {
        return axios.put('/order-service/mySavedSearches/' + id, data);
    }

    static deleteMySavedSearch(id) {
        return axios.delete('/order-service/mySavedSearches/' + id);
    }
}