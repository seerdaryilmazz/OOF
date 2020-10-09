import * as axios from "axios";

export class ReportErrorService {

    static log(url, error){
        let request = {
            url: url,
            message: error.message,
            name: error.name,
            stack: error.stack
        };
        return axios.post('/client-error-report-service/report', request);
    }

}