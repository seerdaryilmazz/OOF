var _LocalStorage = require('susam-components/utils/LocalStorage')
var localStorage = new _LocalStorage.LocalStorage("common");

export function isAuthorized(path) {
    var userMenu = localStorage.read("userMenu");
    var allMenu = localStorage.read("allMenu");
    if(0<_.findLastIndex(JSON.parse(allMenu), x => _.startsWith(x.url, path))){
        return 0 <= _.findLastIndex(JSON.parse(userMenu), x => _.startsWith(x.url, path));
    } else {
        return true;
    }
}