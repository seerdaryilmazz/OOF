import * as axios from "axios";


export class CrmAccountService {

    static getAccounts() {
        return axios.get("/crm-account-service/account");
    }

    static getAccountById(accountId) {
        return axios.get(`/crm-account-service/account/${accountId}`);
    }

    static getAccountsByGlobalAccountId(globalAccountId,params){
        return axios.get(`/crm-account-service/account/byGlobalAccountId/${globalAccountId}`,{params: params});
    }
    static deleteMultipleGlobalAccountId(id){
        return axios.put(`/crm-account-service/account/deleteMultipleGlobalAccountId/${id}`);
    }

    static saveAccount(data){
        if(data.id){
            return axios.put(`/crm-account-service/account/${data.id}`, data);
        }else{
            return axios.post("/crm-account-service/account", data);
        }
    }
    static checkIfCompanyHasAccount(companyId){
        return axios.get(`/crm-account-service/account/check-if-company-has-account?companyId=${companyId}`);
    }

    static updateAccountsWithCriteria(data){
        return axios.put(`/crm-account-service/account/update-with-criteria`, data);
    }

    static createPotential(accountId, potential) {
        return axios.post(`/crm-account-service/potential/${accountId}`, potential);
    }

    static updatePotential(accountId, potential) {
        return axios.put(`/crm-account-service/potential/${accountId}`, potential);
    }

    static shiftValidityStartDateOfPotential(potentialId, numberOfDays) {
        return axios.put(`/crm-account-service/potential/${potentialId}/shiftValidityStartDate?numberOfDays=` + numberOfDays, null);
    }
    static validateAccount(account){
        return axios.put('/crm-account-service/account/validate-account', account);
    }

    static deletePotential(potentialId) {
        return axios.delete(`/crm-account-service/potential/${potentialId}`);
    }

    static deleteAccount(accountId) {
        return axios.delete(`/crm-account-service/account/${accountId}`);
    }
    static deleteAccountByOwner(accountId) {
        return axios.delete(`/crm-account-service/account/${accountId}/by-owner`);
    }

    static searchForPotentials(searchConfig){
        return axios.post('/crm-account-service/potential/search', searchConfig);
    }

    static retrievePotentials(accountId){
        return axios.get(`/crm-account-service/potential/search-potentials/${accountId}`);
    }

    static getPotentialById(potentailId) {
        return axios.get(`/crm-account-service/potential/${potentailId}`);
    }

    static deletePotential(potentailId) {
        return axios.delete(`/crm-account-service/potential/${potentailId}`);
    }

    static saveContact(accountId, contact) {
        return axios.post(`/crm-account-service/contact/${accountId}`, contact);
    }

    static saveMultipleContact(accountId, contacts) {
        return axios.post(`/crm-account-service/contact/multipleContacts/${accountId}`, contacts);
    }

    static retrieveContacts(accountId,params) {
        return axios.get(`/crm-account-service/contact/byAccount/${accountId}`, {params: params});
    }

    static deleteContact(contactId) {
        return axios.delete(`/crm-account-service/contact/${contactId}`);
    }

    static searchAccounts(params){
        return axios.get('/crm-account-service/account/search', {params: params});
    }

    static mergeAccountWithAccount(mergeAccount, otherAccount){
        return axios.put(`/crm-account-service/account/${mergeAccount.account.id}/merge-with/${otherAccount.id}`, mergeAccount);
    }
    
    static getCompanyBlockage(companyId){
        return axios.get('/crm-account-service/account/company-blockage', {params: {companyId: companyId}});
    }

    static checkForDuplicate(params){
        return axios.get(`/crm-account-service/potential/duplicate-control`, {params: params});
    }

    static getCompanyCrInfo(companyId){
        return axios.get('/crm-account-service/account/company-cr-info', {params: {companyId: companyId}});
    }
}