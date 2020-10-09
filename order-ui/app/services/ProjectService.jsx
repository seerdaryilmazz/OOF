import * as axios from 'axios';

export class ProjectService {

    static listCustomsInfo(){
        return axios.get(`/project-service/customs/lookup/option`);
    }

    static getTemplateById(id){
        return axios.get(`/project-service/template/${id}`);
    }
    static getTemplatesForCustomer(customerId, type, status){
        return axios.get('/project-service/template', {params: {customerId: customerId, type: type, status: status}});
    }

    static getDeliveryDateRulesForCustomer(customerId){
        return axios.get('/project-service/customer-delivery-date-rule', {params: {customerId: customerId}});
    }

    static updateTemplateStatus(id, status) {
        return axios.patch(`/project-service/template/${id}/status`, {id:status});
    }

    static saveTemplate(template){
        if(template.id){
            return axios.put(`/project-service/template/${template.id}`, template);
        }else{
            return axios.post("/project-service/template", template);
        }
    }
    static getTemplateForProject(project){
        return axios.get(`/project-service/${project.id}/customer-template`);
    }
    static getTemplateForProjectId(projectId){
        return axios.get(`/project-service/${projectId}/customer-template`);
    }

    static saveTemplateForProject(project, template){
        return axios.put(`/project-service/${project.id}/customer-template`, template);
    }

    static search(filter){
        return axios.get('/project-service/template', {
            params: filter
        });
    }

    static searchSenderTemplates(companyId, handlingCompanyId, handlingLocationId){
        return axios.get('/project-service/sender-template-search',
            {params: {senderId: companyId, loadingCompanyId: handlingCompanyId, loadingLocationId: handlingLocationId}});
    }

    static getTemplatesForSender(companyId){
        return axios.get('/project-service/sender-template',
            {params: {senderId: companyId}});
    }

    static saveSenderTemplate(template){
        if(template.id){
            return axios.put(`/project-service/sender-template/${template.id}`, template);
        }else{
            return axios.post("/project-service/sender-template", template);
        }
    }

    static getSenderTemplate(id) {
        return axios.get("/project-service/sender-template/" + id);
    }

    static deleteSenderTemplate(id) {
        return axios.delete("/project-service/sender-template/" + id);
    }

    static saveTemplatePackage(templatePackage){
        if(templatePackage.id){
            return axios.put(`/project-service/template-package/${templatePackage.id}`, templatePackage);
        }else{
            return axios.post("/project-service/template-package", templatePackage);
        }
    }

    static getTemplatePackage(id) {
        return axios.get("/project-service/template-package/" + id);
    }

    static deleteTemplatePackage(id) {
        return axios.delete("/project-service/template-package/" + id);
    }
    
    static saveTemplateGoods(templatePackage){
        if(templatePackage.id){
            return axios.put(`/project-service/template-goods/${templatePackage.id}`, templatePackage);
        }else{
            return axios.post("/project-service/template-goods", templatePackage);
        }
    }

    static getTemplateGoods(id) {
        return axios.get("/project-service/template-goods/" + id);
    }

    static deleteTemplateGoods(id) {
        return axios.delete("/project-service/template-goods/" + id);
    }

    static saveTemplateAdrDetail(templateAdrDetail){
        if(templateAdrDetail.id){
            return axios.put(`/project-service/template-adr/${templateAdrDetail.id}`, templateAdrDetail);
        }else{
            return axios.post("/project-service/template-adr", templateAdrDetail);
        }
    }

    static getTemplateAdrDetail(id) {
        return axios.get("/project-service/template-adr/" + id);
    }

    static deleteTemplateAdrDetail(id) {
        return axios.delete("/project-service/template-adr/" + id);
    }

    static saveTemplateFrigo(templateFrigo){
        if(templateFrigo.id){
            return axios.put(`/project-service/template-frigo/${templateFrigo.id}`, templateFrigo);
        }else{
            return axios.post("/project-service/template-frigo", templateFrigo);
        }
    }

    static getTemplateFrigo(id) {
        return axios.get("/project-service/template-frigo/" + id);
    }

    static deleteTemplateFrigo(id) {
        return axios.delete("/project-service/template-frigo/" + id);
    }

    static saveTemplateCertificate(templateCertificate){
        if(templateCertificate.id){
            return axios.put(`/project-service/template-certificate/${templateCertificate.id}`, templateCertificate);
        }else{
            return axios.post("/project-service/template-certificate", templateCertificate);
        }
    }

    static getTemplateCertificate(id) {
        return axios.get("/project-service/template-certificate/" + id);
    }

    static deleteTemplateCertificate(id) {
        return axios.delete("/project-service/template-certificate/" + id);
    }

    static getProjectCriterias(code, type){
        return axios.get('/order-template-service/order-template/' + code + '?templateType=' + type);
    }
    
    static getProjectDetailsHierarchy(code, type){
        return axios.get('/order-template-service/order-template/' + code + '/detailed?templateType=' + type);
    }

    static saveProjectCriteria(data){
        return axios.put("/order-template-service/order-template", data);
    }

    static updateProjectName(projectCode, projectName) {
        return axios.put("/order-template-service/order-template/" + projectCode + "/updatename?projectName=" + projectName, null);
    }
    static executeLoadSpecRulesForPackage(width, length, height){
        return axios.get('/order-template-service/rule/execute/load-spec-rule/for-package',
            {params: {width: width, length: length, height: height}});
    }
    static executeLoadSpecRulesForShipment(grossWeight, ldm, value){
        return axios.get('/order-template-service/rule/execute/load-spec-rule/for-shipment',
            {params: {grossWeight: grossWeight, ldm: ldm, value: value}});
    }

    static executeWarehouseRulesForLocation(locationId){
        return axios.get('/order-template-service/rule/execute/customer-warehouse-rule',
            {params: {locationId: locationId}});
    }

    static saveDeliveryDateRule(rule){
        if(rule.id){
            return axios.put(`/project-service/customer-delivery-date-rule/${rule.id}`, rule);
        }else{
            return axios.post("/project-service/customer-delivery-date-rule", rule);
        }
    }
    static deleteDeliveryDateRule(rule){
        return axios.delete(`/project-service/customer-delivery-date-rule/${rule.id}`);
    }

    static calculateDeliveryDate(request){
        return axios.post("/project-service/calculate-delivery-date", request);
    }

    static getConsigneeCustomsForCompany(companyId){
        return axios.get(`/project-service/customs-arrival`, {params: {companyId: companyId}});
    }
    static getConsigneeCustomsForCompanyAndLocation(companyId, locationId, companyType){
        return axios.get(`/project-service/customs-arrival/search`, {params: {companyId: companyId, locationId: locationId, companyType: companyType}});
    }
    static getSenderCustomsForCompany(companyId){
        return axios.get(`/project-service/customs-departure`, {params: {companyId: companyId}});
    }
    static getSenderCustomsForCompanyAndLocation(companyId, locationId, companyType){
        return axios.get(`/project-service/customs-departure/search`, {params: {companyId: companyId, locationId: locationId, companyType: companyType}});
    }
    static saveConsigneeCustoms(consigneeCustoms){
        if(consigneeCustoms.id){
            return axios.put(`/project-service/customs-arrival/${consigneeCustoms.id}`, consigneeCustoms);
        }else{
            return axios.post(`/project-service/customs-arrival`, consigneeCustoms);
        }
    }
    static saveSenderCustoms(senderCustoms){
        if(senderCustoms.id){
            return axios.put(`/project-service/customs-departure/${senderCustoms.id}`, senderCustoms);
        }else{
            return axios.post(`/project-service/customs-departure`, senderCustoms);
        }
    }
    static deleteConsigneeCustoms(consigneeCustoms){
        if(consigneeCustoms.forTR){
            return axios.delete(`/project-service/customs-arrival/tr/${consigneeCustoms.id}`);
        }else{
            return axios.delete(`/project-service/customs-arrival/default/${consigneeCustoms.id}`);
        }
    }
    static deleteSenderCustoms(senderCustoms){
        if(senderCustoms.forTR){
            return axios.delete(`/project-service/customs-departure/tr/${senderCustoms.id}`);
        }else{
            return axios.delete(`/project-service/customs-departure/default/${senderCustoms.id}`);
        }
    }

    static getTemplateRules(id, sender, consignee) {
        return axios.post(`/project-service/template-multi-party/${id}/rules`, {sender:sender, consignee: consignee});
    }
    
    static listDistinctField(field, type, status) {
        return axios.get(`/project-service/template/list/${field}`, {params: {type: type, status: status}});
    }

    static listTemplateLookups(lookupName) {
        return axios.get(`/project-service/template/lookup/${lookupName}`);
    }

}