import * as axios from "axios";


export class CrmSearchService {

    static search(params){
        return axios.get('/crm-search-service/search/query', {params: params});
    }
    static searchDocument(request, document = 'quote'){
        return axios.post(`/crm-search-service/search/${document}/query`, request);
    }
    static searchDocumentAslist(request, document = 'quote'){
        return axios.post(`/crm-search-service/search/${document}/query-list`, request);
    }
    static searchQuoteHomePageStatistics(params){
        return axios.get('/crm-search-service/search/quoteHomePageStatistics', {params: params});
    }
    static searchAccountHomePageStatistics(){
        return axios.get('/crm-search-service/search/accountHomePageStatistics');
    }
    static searchAccounts(params) {
        return axios.get('/crm-search-service/search/account/prefix', {params: params});
    }
    static searchQuotesForHomePage(params) {
        return axios.post("/crm-search-service/search/searchQuotesForHomePage", params);
    }
    static searchQuotes(params) {
        return axios.post("/crm-search-service/search/searchQuotes", params);
    }
    static searchAccountsForHomePage(params) {
        return axios.post('/crm-search-service/search/searchAccountsForHomePage', params);
    }
    static moreLikeThis(params) {
        return axios.get('/crm-search-service/search/more-like-this', {params:params});
    }
    static searchOpportunitiesForHomePage(params){
        return axios.post('/crm-search-service/search/searchOpportunitiesForHomePage', params)
    }
    static searchOpportunityHomePageStatistics(){
        return axios.get('/crm-search-service/search/opportunityHomePageStatistics');
    }
}