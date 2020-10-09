import * as axios from "axios";
import _ from "lodash";

export class CurrencyService {

    static findAllExchangeRatePublishers() {
        return axios.get("/currency-service/lookup/exchange-rate-publisher");
    }

    static findDistinctPublishDatesForPublisher(pageNumber, pageSize, publisher) {
        return axios.get("/currency-service/exchange-rate/publish-dates?pageNumber=" + pageNumber + "&pageSize=" + pageSize + "&publisherCode=" + publisher.code);
    }

    static findExchangeRates(pageNumber, pageSize, publisher, publishDate, fromCurrency, toCurrency) {

        let params = [];

        if (!_.isNil(pageNumber)) params.push("pageNumber=" + pageNumber);
        if (!_.isNil(pageSize)) params.push("pageSize=" + pageSize);
        if (!_.isNil(publisher)) params.push("publisherCode=" + publisher.code);
        if (!_.isNil(publishDate)) params.push("publishDate=" + publishDate);
        if (!_.isNil(fromCurrency)) params.push("fromCurrencyCode=" + fromCurrency.code);
        if (!_.isNil(toCurrency)) params.push("toCurrencyCode=" + toCurrency.code);

        return axios.get("/currency-service/exchange-rate" + (params.length > 0 ? "?" + params.join("&") : ""));
    }

    static getExchangeRatesFromPublisherAndSave(publisher, publishDate) {
        return axios.post("/currency-service/exchange-rate?publisherCode=" + publisher.code + "&publishDate=" + publishDate);
    }

}