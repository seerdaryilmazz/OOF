export class AxiosUtils {
    static getErrorMessage(msg) {
        if (msg && msg.response && msg.response.data) {
            if (msg.response.data.args) {
                return {message: msg.response.data.message, args: msg.response.data.args};
            }
            if (msg.response.data.message) {
                return {message: msg.response.data.message};
            }
            return {message: msg.response.data};
        } else {
            return {message: msg};
        }
    }
}