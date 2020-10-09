
export class DateFormatter {

    static DEFAULT_ELEMENT_SEPERATOR = " ";


    constructor(date, timeSeparator, dateSeparator, elementSeparator) {

        this.seperator = elementSeparator ? elementSeparator : DateFormatter.DEFAULT_ELEMENT_SEPERATOR;

        this.value = date;
        this.dataArr = date.split(this.seperator);

        this.date = new Date(this.dataArr[0], dateSeparator);
        this.time = new Time(this.dataArr[1], timeSeparator);
        this.timezone = this.dataArr.length == 3 ? this.dataArr[2] : null;
    }

    format(includeYear, includeMonth, includeDay, includeHour, includeMinute, includeSecond, includeTimezone) {

        let includeDate = includeDay || includeMonth || includeYear;
        let includeTime = includeHour || includeMinute || includeSecond;

        return this.date.format(includeYear, includeMonth, includeDay)
            + ((includeDate && (includeTime || includeTimezone)) ? this.seperator : "")
            + this.time.format(includeHour, includeMinute, includeSecond)
            + (((includeDate || includeTime) && includeTimezone) ? this.seperator : "")
            + (includeTimezone ? this.timezone : "")
    }

}

class Date {

    static DEFAULT_DATE_SEPERATOR = "/";

    constructor(date, dateSeparator) {
        this.value = date;
        this.seperator = dateSeparator ? dateSeparator : Date.DEFAULT_DATE_SEPERATOR;

        let dateArr = date.split(this.seperator);
        this.day = dateArr[0];
        this.month = dateArr[1];
        this.year = dateArr[2];

    }

    format(includeYear, includeMonth, includeDay) {
        return (includeDay ? this.day : "")
            + ((includeDay && (includeMonth || includeYear)) ? this.seperator : "")
            + (includeMonth ? this.month : "")
            + (((includeDay || includeMonth) && includeYear) ? this.seperator : "")
            + (includeYear ? this.year : "")
    }

}

class Time {

    static DEFAULT_TIME_SEPARATOR = ":";

    constructor(time, timeSeparator) {
        this.value = time;
        this.seperator = timeSeparator ? timeSeparator : Time.DEFAULT_TIME_SEPARATOR;

        let timeArr = time.split(this.seperator);
        this.hour = timeArr[0];
        this.minute = timeArr[1];
        this.second = timeArr.length == 3 ? timeArr[2] : null;
    }

    format(includeHour, includeMinute, includeSecond) {
        return (includeHour ? this.hour : "")
            + ((includeHour && (includeMinute || includeSecond)) ? this.seperator : "")
            + (includeMinute ? this.minute : "")
            + (((includeHour || includeMinute) && includeSecond) ? this.seperator : "")
            + (includeSecond ? this.second : "")
    }
}
