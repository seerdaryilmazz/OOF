import * as axios from 'axios';

export class NotTranslatedService {

    static delete(id){
        return axios.delete(`/translator-service/not-translated/${id}`)
    }

    static search(filter) {
        return axios.get('/translator-service/not-translated/search', {params: filter});
    }
}