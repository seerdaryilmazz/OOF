import * as axios from "axios";
import _ from "lodash";

export class CurrencyService {

    static findAllExchangeRatePublishers() {
        return axios.get("/currency-service/lookup/exchange-rate-publisher");
    }

    static findDistinctPublishDatesForPublisher(pageNumber, pageSize, publisher) {
        return axios.get("/currency-service/exchange-rate/publish-dates?pageNumber=" + pageNumber + "&pageSize=" + pageSize + "&publisherCode=" + publisher.code);
    }

    static findExchangeRates(params) {

        return axios.get("/currency-service/exchange-rate", {params: params});
    }

    static getExchangeRatesFromPublisherAndSave(publisher, publishDate) {
        return axios.post("/currency-service/exchange-rate?publisherCode=" + publisher.code + "&publishDate=" + publishDate);
    }

}