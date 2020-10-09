import * as axios from "axios";

export class TaskService {

    static IN_PROGRESS = "INPROGRESS";
    static NEW = "NEW";
    static COMPLETED = "COMPLETED";

    static getMyActiveTasksPaged(params) {
        return axios.get('/task-service/myactivetasks/paged', {params: params});
    }

    static claim(taskId) {
        return axios.put('/task-service/' + taskId + '/claim');
    }

    static changeStatusInProgress(taskId) {
        return axios.put('/task-service/' + taskId + '/changestatus?taskStatus=' + TaskService.IN_PROGRESS);
    }

    static getTaskDetails(id){
        return axios.get('/task-service/' + id);
    }

    static completeTaskWithNewParams(taskId, params) {
        return axios.put('/task-service/' + taskId + '/completeWithNewParams', params);
    }
}