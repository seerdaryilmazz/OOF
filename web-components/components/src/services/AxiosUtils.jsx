import { Notify } from '../basic';
import * as axios from 'axios';

export default function axiosInstance() {
    var uiBlocker = null;
    
    const instance = axios.create();
    instance.interceptors.request.use(function (config) {
        if (!uiBlocker || !uiBlocker.isActive()) {
            uiBlocker = Notify.blockUI()
        }
        return config;
    }, function (error) {
        uiBlocker && uiBlocker.hide();
        return Promise.reject(error);
    });

    // Add a response interceptor
    instance.interceptors.response.use(function (response) {
        uiBlocker && uiBlocker.hide();
        return response;
    }, function (error) {
        uiBlocker && uiBlocker.hide();
        return Promise.reject(error);
    });
    return instance
}