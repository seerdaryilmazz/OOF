import * as axios from "axios";

export class CurrencyService {

    static findCurrencies() {
        return axios.get('/currency-service/lookup/currency');
    }
}