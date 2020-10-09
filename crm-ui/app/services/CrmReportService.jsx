import * as axios from "axios";


export class CrmReportService {

    static enquireForQuoteCount(enquiryDate, frequency, tags){
        let params = {
            enquiryDate: enquiryDate,
            frequency: frequency,
            tags: tags
        };
        return axios.get('/crm-report-service/report/quote/query', {params: params});
    }
}