import * as axios from "axios";

export class TaskService {

    static IN_PROGRESS = "INPROGRESS";
    static NEW = "NEW";
    static COMPLETED = "COMPLETED";

    static TYPE_CONFIRMORDER = "ConfirmOrder";
    static TYPE_HANDLE_PROVISION_CREATION_FAILURE = "HandleProvisionCreationFailure";
    static TYPE_SALES_BOX = "SalesBox";

    static getTaskDetails(id){
        return axios.get('/task-service/' + id);
    }
    static getMyActiveTasks(){
        return axios.get('/task-service/myactivetasks');
    }
    static getMyActiveTasksPaged(params) {
        return axios.get('/task-service/myactivetasks/paged', {params: params});
    }
    static completeTask(taskId){
        return axios.put('/task-service/' + taskId + '/complete');
    }

    static completeTaskWithNewParams(taskId, params) {
        return axios.put('/task-service/' + taskId + '/completeWithNewParams', params);
    }

    static getNextStates(taskId){
        return axios.get('/task-service/' + taskId + '/nextstates');
    }
    static changeStatusInProgress(taskId){
        return axios.put('/task-service/' + taskId + '/changestatus?taskStatus=' + TaskService.IN_PROGRESS);
    }

    static claim(taskId) {
        return axios.put('/task-service/' + taskId + '/claim');
    }

    static respond(taskId, approvalResult){
        return axios.put('/task-service/' + taskId + '/respond/' + approvalResult);
    }
}