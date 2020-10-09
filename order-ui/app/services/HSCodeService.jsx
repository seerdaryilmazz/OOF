import * as axios from "axios";

export class HSCodeService {

    static search(filter) {
        return axios.get('/order-service/lookup/hscode-extended/search', { params: filter });
    }
    
    static searchById(id) {
        return axios.get(`/order-service/lookup/hscode-extended/search-by-id?id=${id}`);
    }

    static searchBase(code) {
        return axios.get(`/order-service/search/hscode/byCode?code=${code}`);
    }

    static list() {
        return axios.get('/order-service/lookup/hscode-extended');
    }
    
    static get(id) {
        return axios.get(`/order-service/lookup/hscode-extended/${id}`);
    }

    static save(hscode) {
        if (hscode.id) {
            return axios.put('/order-service/lookup/hscode-extended/' + hscode.id, hscode);
        } else {
            return axios.post('/order-service/lookup/hscode-extended', hscode);
        }
    }

    static delete(hscode) {
        return axios.delete('/order-service/lookup/hscode-extended/' + hscode.id);
    }
}