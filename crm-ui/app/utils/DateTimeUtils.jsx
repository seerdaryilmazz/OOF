import _ from "lodash";

export class DateTimeUtils {

    static formatDateTime(date) {

        let day = date.getDate();
        let month = date.getMonth() + 1; // January is 0.
        let year = date.getFullYear();
        let hour = date.getHours();
        let minute = date.getMinutes();

        if (day < 10) {
            day = "0" + day;
        }

        if (month < 10) {
            month = "0" + month;
        }

        if (hour < 10) {
            hour = "0" + hour;
        }

        if (minute < 10) {
            minute = "0" + minute;
        }

        return day + "/" + month + "/" + year + " " + hour + ":" + minute;
    }

    /**
     * DateTime component'inin tarih kısmı girilip saat kısmı girilmemiş olabilir veya
     * tarih kısmı girilmeyip saat kısmı girilmiş olabilir. Her iki kısmın da girildiğinden
     * emin olmak için bu fonksiyonu kullanabiliriz.
     */
    static isDateTimeComplete(dateTime) {

        let isComplete = false;

        if (!_.isEmpty(dateTime)) {
            let first16Chars = dateTime.substr(0, 16);
            let regex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}( )[0-9]{2}(:)[0-9]{2}$/;
            isComplete = regex.test(first16Chars);
        }

        return isComplete;
    }

    static translateToDateObject(date, separator){
        /** dd/MM/yyyy , dd-MM-YYYY formatındaki tarihler için */
        let parts=date.split(separator);
        return new Date(parts[2],parts[1]-1,parts[0]);
    }
}