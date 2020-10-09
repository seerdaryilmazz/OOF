import * as axios from "axios";


export class CrmSearchService {

    static search(params){
        return axios.get('/crm-search-service/search/query', {params: params});
    }
    static searchQuote(request){
        return axios.post('/crm-search-service/search/quote/query', request);
    }
    static searchQuoteHomePageStatistics(params){
        return axios.get('/crm-search-service/search/quoteHomePageStatistics', {params: params});
    }
    static searchAccounts(params) {
        return axios.get('/crm-search-service/search/account/prefix', {params: params});
    }
    static searchQuotesForHomePage(params) {
        return axios.get("/crm-search-service/search/searchQuotesForHomePage", {params: params});
    }
    static searchQuotes(params) {
        return axios.get("/crm-search-service/search/searchQuotes", {params: params});
    }
    static searchAccountsForHomePage(params) {
        return axios.post('/crm-search-service/search/searchAccountsForHomePage', params);
    }

}