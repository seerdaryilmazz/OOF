import * as axios from "axios";

export class EmailService {

    static getMails(ids) {
        return axios.get(`/email-service/list-by-id`, {params: {ids: ids}});
    }

  

}