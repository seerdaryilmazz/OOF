import * as axios from "axios";

export class DocumentService {

    static uploadDocument(document) {
        var data = new FormData(document);
        data.append("document", document);
        var config = {
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data"
        };
        return axios.post('/order-service/document/upload', data, config);
    }

    static generateDocumentDownloadUrl(fileName, fileNameClient) {
        return '/order-service/document/download?fileName=' + fileName + '&fileNameClient=' + fileNameClient;
    }
}