
export class CookieUtils {

    static getCookie(name){
        let cookieValue = "";
        if (document.cookie && document.cookie != '') {
            document.cookie.split(';').forEach(cookie => {
                if(cookie.trim().substring(0, name.length + 1) == (name + '=')){
                    cookieValue = decodeURIComponent(cookie.trim().substring(name.length + 1));
                }
            });
        }
        return cookieValue;
    }
}