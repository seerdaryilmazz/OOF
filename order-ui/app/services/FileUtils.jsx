
export class FileUtils {

    static pickFileIcon(filename){
        let extensionIndex = filename.lastIndexOf(".");
        let extension = filename.substring(extensionIndex);
        let iconClassName = "";
        switch(extension){
            case ".pdf":
                iconClassName = "uk-icon-file-pdf-o";
                break;
            case '.xls':
            case '.xlsx':
                iconClassName = "uk-icon-file-excel-o";
                break;
            case '.doc':
            case '.docx':
                iconClassName = "uk-icon-file-word-o";
                break;
            case '.txt':
                iconClassName = "uk-icon-file-text-o";
                break;
            case '.jpeg':
            case '.jpg':
            case '.png':
                iconClassName = "uk-icon-file-image-o";
                break;
            case '.zip':
                iconClassName = "uk-icon-file-archive-o";
                break;
            default:
                iconClassName = "uk-icon-file-o";

        }
        return iconClassName;
    }
}