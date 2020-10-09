import * as axios from 'axios';

export class GoogleTranslateService {
    static translate(text, from, to) {
        return axios.post('/google-translate-service/translate', {from: from, to: to, q: text});
    }
}
