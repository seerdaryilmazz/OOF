import _ from 'lodash';
import { AxiosUtils } from "../utils/AxiosUtils";
export class Notify {

    static translateMessage(message, args) {
        let text = _.isString(message) ? message : (message.message ? message.message : message);
        return Notify.translator ? Notify.translator.translate(text, args) : message;
    }

    static showError(error, logError) {
        let message = AxiosUtils.getErrorMessage(error);
        let errorTemplate = '<i class="uk-icon-exclamation uk-icon-medium" style="color:white;padding-right:10px;"></i>';
        if(logError){
            console.log(error)
        }
        UIkit.notify(errorTemplate + Notify.translateMessage(message.message, message.args), {status: 'danger'});
    }

    static showSuccess(msg, args) {
        let successTemplate = '<i class="uk-icon-check uk-icon-medium" style="color:white;padding-right:10px;"></i>';
        UIkit.notify(successTemplate + Notify.translateMessage(msg, args), {status: 'success'});
    }

    static showInformation(msg, args){
        let informationTemplate = '<i class="material-icons" style="color:white; padding-right:10px">info</i>';
        UIkit.notify(informationTemplate + Notify.translateMessage(msg, args), { status: 'info' });
    }

    static confirm(msg, func, args) {
        UIkit.modal.confirm(Notify.translateMessage(msg, args), func, {labels: {'Ok': Notify.translateMessage('ok'), 'Cancel': Notify.translateMessage('cancel')}});
    }

    static blockUI() {
        let content =   ''
                +       '<div style="position:absolute;left:50%;top:50%;">'
                +           '<div class="content-preloader preloader-active" style="width:72px; height:72px">'
                +               '<div class="md-preloader">'
                +                   '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" height="72" width="72" viewBox="0 0 75 75">'
                +                       '<circle cx="37.5" cy="37.5" r="33.5" stroke-width="7" />'
                +                   '</svg>'
                +               '</div>'
                +           '</div>'
                +       '</div>'
        let dialog = UIkit.modal.dialog(content ,{bgclose: false, keyboard: false, modal: true, center: true});
        dialog.element.find('.uk-modal-dialog').css('background','transparent').css('box-shadow','unset');
        return dialog.show();
    }
}