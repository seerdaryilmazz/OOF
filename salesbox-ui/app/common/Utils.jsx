import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

export class Utils {

    static getToday() {
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    }

    static formatDate(date) {

        let day = date.getDate();
        let month = date.getMonth() + 1; // January is 0.
        let year = date.getFullYear();

        if (day < 10) {
            day = "0" + day;
        }

        if (month < 10) {
            month = "0" + month;
        }

        return day + "/" + month + "/" + year;
    }
}