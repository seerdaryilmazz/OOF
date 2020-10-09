import * as axios from "axios";
import _ from "lodash";

export class FileService {

    static uploadFile(data) {
        return axios.post('/file-service/upload', data);
    }

    static generateDownloadUrl(id) {
        return '/file-service/' + id + '/download';
    }
}