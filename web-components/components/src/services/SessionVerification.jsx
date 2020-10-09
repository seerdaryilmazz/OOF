import * as axios from 'axios';

var loginPopup = null;
export function verifySession() {
    axios.interceptors.response.use(undefined, error => {
        if (!error.response 
            || (error.response.status === 403 && error.response.data.message !== 'Access is denied')) {
            let left = (window.innerWidth - 480) / 2
            let top = 300
            if(!loginPopup || loginPopup.closed){
                loginPopup = window.open("/login-success", "_blank", `menubar=no,status=no,toolbar=no,scrollbars=no,left=${left}, top=${top},resizable=no,width=480,height=480`);
                throw new Error("Session is expired");
            }
        }
        throw error;
    });
}