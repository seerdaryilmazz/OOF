import _ from "lodash";
import {TranslatorService} from "../oneorder/services";

export class Translator {

    constructor(app) {
        this.messages = {};
        this.defaultLocale = "en";
        this.localStorageKey = "locale";
        this.messagesStorageKey = "oneorder.common.messages.";
        this.notTranslatedStorageKey = "notTranslated";
        this.app = app;
        this.readLocaleFromStorage();
        var MessageFormat = require('messageformat');
        this.mf = new MessageFormat(this.locale);
        this.startNotTranslatedValuesSyncTimer();
    }

    readLocaleFromStorage() {
        this.locale = this.getLocale();
        this.onChangeLocale && this.onChangeLocale(this.locale);
    }

    getLocale() {
        var selectedLocale = localStorage.getItem(this.localStorageKey);
        if (!selectedLocale) {
            selectedLocale = this.defaultLocale;
        }
        return selectedLocale;
    }

    getLanguage() {
        let language = this.getLocale().split("_");
        return language[0].toUpperCase();
    }

    setLocale(locale) {
        localStorage.setItem(this.localStorageKey, locale);
        this.readLocaleFromStorage();
        this.loadTranslations();
    }

    loadTranslations() {
        let messages = localStorage.getItem(this.messagesStorageKey + this.app);
        this.messages = messages ? JSON.parse(messages) : {};

        TranslatorService.getTranslations(this.app, this.locale).then(response => {
            this.messages = response.data;
            localStorage.setItem(this.messagesStorageKey + this.app, JSON.stringify(this.messages));
            this.onMessagesReceived && this.onMessagesReceived();
        }).catch(error => {
            console.log(error);
        });
    }

    translate(text, params, postTranslationCaseConverter) {
        if (!text) {
            return "";
        }
        let key = _.toLower(text);
        if (this.locale == this.defaultLocale) {
            return this.mf.compile(text)(params);
        } else if (this.messages[key]) {
            let adjustedLocale = this.adjustLocaleForJavascript(this.locale);
            switch (postTranslationCaseConverter) {
                case(1):
                    return this.mf.compile(this.messages[key])(params).toLocaleUpperCase(adjustedLocale);
                case(0):
                    return this.mf.compile(this.messages[key])(params).toLocaleLowerCase(adjustedLocale);
                default:
                    return this.mf.compile(this.messages[key])(params);
            }
        } else {
            this.addNotTranslate(key, this.locale, this.app);
            return this.mf.compile(text)(params);
        }
    }

    adjustLocaleForJavascript(locale) {
        return locale.replace("_", "-");
    }

    getNotTranslatedItems() {
        let notTranslatedItems = localStorage.getItem(this.notTranslatedStorageKey);

        if (notTranslatedItems) {
            notTranslatedItems = JSON.parse(notTranslatedItems);
        } else {
            notTranslatedItems = [];
        }

        return notTranslatedItems;
    }

    addNotTranslate(key, locale, appName) {
        let notTranslatedItems = this.getNotTranslatedItems();

        let newNotTranslated = {
            key,
            locale,
            appName
        };

        if (!_.find(notTranslatedItems, newNotTranslated)) {
            notTranslatedItems.push(newNotTranslated);
            localStorage.setItem(this.notTranslatedStorageKey, JSON.stringify(notTranslatedItems));
        }
    }

    sendNotTranslatedItems() {
        let notTranslatedItems = this.getNotTranslatedItems();
        if (notTranslatedItems.length > 0) {
            console.log("Sending not translated items");
            console.log(notTranslatedItems);
            TranslatorService.addNotTranslatedItems(notTranslatedItems).then(response => {
                localStorage.removeItem(this.notTranslatedStorageKey);
            }).catch(error => {
                console.log(error);
            });
        }
    }

    startNotTranslatedValuesSyncTimer() {
        this.sendNotTranslatedItems();
        setInterval(() => {
            this.sendNotTranslatedItems();
        }, 1000 * 60 * 60 /* 1 hour */);
    }
}