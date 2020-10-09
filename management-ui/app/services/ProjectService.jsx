import * as axios from "axios";

export class ProjectService {

    static ORDER_QUOTA_UNIT_TYPE_GROSS_WEIGHT_CODE = "GROSS_WEIGHT";
    static ORDER_QUOTA_UNIT_TYPE_VOLUME_CODE = "VOLUME";
    static ORDER_QUOTA_UNIT_TYPE_LDM_CODE = "LDM";

    static retrieveOrderQuotaUnitType() {
        return axios.get("/order-template-service/lookup/project/order-quota-unit-type");
    }

    static retrieveOrderQuotaTimeType() {
        return axios.get("/order-template-service/lookup/project/order-quota-time-type");
    }

    static retrieveProjects() {
        return axios.get("/order-template-service/project");
    }

    static retrieveProject(projectId) {
        return axios.get("/order-template-service/project/" + projectId);
    }

    static deleteProject(project) {
        return axios.delete("/order-template-service/project", project);
    }

    static saveProject(project) {
        return axios.post("/order-template-service/project", project);
    }

    static updateProjectName(projectId, name) {
        let params = new URLSearchParams();
        params.append("name", name);
        return axios.post("/order-template-service/project/" + projectId + "/name", params);
    }

    static saveProjectSender(projectId, sender) {
        return axios.post("/order-template-service/project/" + projectId + "/sender", sender);
    }

    static saveProjectServiceType(projectId, serviceType) {
        return axios.post("/order-template-service/project/" + projectId + "/servicetype", serviceType);
    }

    static saveProjectLoadType(projectId, loadType) {
        return axios.post("/order-template-service/project/" + projectId + "/loadtype", loadType);
    }

    static saveProjectIncoterm(projectId, incoterm) {
        return axios.post("/order-template-service/project/" + projectId + "/incoterm", incoterm);
    }
}