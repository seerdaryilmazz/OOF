import * as axios from 'axios';
import uuid from 'uuid';
import _ from 'lodash';
import {AuthorizationService} from "../../services";
import {Notify} from "susam-components/basic";

export class Constants{
    static NODE_TYPE_SUBSIDIARY = "Subsidiary";
    static NODE_TYPE_DEPARTMENT = "Department";
    static NODE_TYPE_SECTOR = "Sector";
    static NODE_TYPE_CUSTOMER = "Customer";
    static NODE_TYPE_TEAM = "Team";

    static AUTH_LEVEL_MEMBER = 100;
    static AUTH_LEVEL_SUPERVISOR = 200;
    static AUTH_LEVEL_MANAGER = 300;
}


export const UPDATE_AUTH_FIELD = "UPDATE_AUTH_FIELD";
export function updateAuthField(key, value) {
    return {
        type: UPDATE_AUTH_FIELD,
        key: key,
        value: value
    }
}
export const RECEIVE_AUTH_LOOKUPS = "RECEIVE_AUTH_LOOKUPS";
export function receiveAuthLookups(teams, departments, subsidiaries, sectors){
    return {
        type: RECEIVE_AUTH_LOOKUPS,
        teams: teams,
        departments: departments,
        subsidiaries: subsidiaries,
        sectors: sectors
    }
}
export function fetchAuthLookups(){
    return dispatch => {
        axios.all([
            AuthorizationService.getAuthTeams(),
            AuthorizationService.getAllDepartments(),
            AuthorizationService.getSubsidiaries(),
            AuthorizationService.getParentSectors()
        ]).then(axios.spread((teams, departments, subsidiaries, sectors) => {
            dispatch(receiveAuthLookups(teams.data, departments.data, subsidiaries.data, sectors.data));
        })).catch((error) => {
            Notify.showError(error);
        });
    }
}

function convertAuthorizationFromEdit(menu, auth){
    let from = {type: auth.nodeType.id};
    switch (auth.nodeType.id) {
        case Constants.NODE_TYPE_DEPARTMENT:
            from.externalId = auth.department.id;
            from.name = auth.department.name;
            break;
        case Constants.NODE_TYPE_TEAM:
            from.id = auth.team.id;
            from.name = auth.team.name;
            break;
        case Constants.NODE_TYPE_SECTOR:
            from.externalId = auth.sector.id;
            from.name = auth.sector.name;
            break;
        case Constants.NODE_TYPE_SUBSIDIARY:
            from.externalId = auth.subsidiary.id;
            from.name = auth.subsidiary.name;
            break;
        case Constants.NODE_TYPE_CUSTOMER:
            from.externalId = auth.customer.id;
            from.name = auth.customer.name;
            break;
    }
    let converted = {};
    converted.from = from;
    converted.to = {
        externalId: menu.id,
        name: menu.name,
        type: "MenuItem"
    };
    converted.level = auth.level.id;
    converted._key = uuid.v4();
    return converted;
}

function convertAuthorizationToEdit(listItem){
    let auth = {};
    auth.nodeType = {id: listItem.from.type, name: listItem.from.type};
    switch (listItem.from.type) {
        case Constants.NODE_TYPE_DEPARTMENT:
            auth.department = {};
            auth.department.id = listItem.from.externalId;
            auth.department.name = listItem.from.name;
            break;
        case Constants.NODE_TYPE_TEAM:
            auth.team = {};
            auth.team.id = listItem.from.id;
            auth.team.name = listItem.from.name;
            break;
        case Constants.NODE_TYPE_SECTOR:
            auth.sector = {};
            auth.sector.id = listItem.from.externalId;
            auth.sector.name = listItem.from.name;
            break;
        case Constants.NODE_TYPE_SUBSIDIARY:
            auth.subsidiary = {};
            auth.subsidiary.id = listItem.from.externalId;
            auth.subsidiary.name = listItem.from.name;
            break;
        case Constants.NODE_TYPE_CUSTOMER:
            auth.customer = {};
            auth.customer.id = listItem.from.externalId ;
            auth.customer.name = listItem.from.name;
            break;
    }
    auth.level = {id: listItem.level};
    auth._key = listItem._key || uuid.v4();
    return auth;
}

function convertAuthorizationFromList(menu, authList){
    if(!authList){
        return [];
    }
    return authList.map(item => {
        let converted = {};
        converted.from = item.node;
        converted.to = {
            externalId: menu.id,
            name: menu.name,
            type: "MenuItem"
        };
        converted.level = item.level;
        converted._key = item._key || uuid.v4();
        return converted;
    });
}

export function addAuthorizationToList(props){
    return dispatch => {
        let converted = convertAuthorizationFromEdit(props.menu, props.auth);
        let existing = _.find(props.authList,
            {
                from: {type: converted.from.type, name: converted.from.name},
                level: converted.level
            });
        if(existing){
            Notify.showError("There is already an authorized viewer for selected attributes");
        }else{
            dispatch(addAuthorization(props.auth, props.menu));
        }
    }
}
export const ADD_AUTHORIZATION = "ADD_AUTHORIZATION";
export function addAuthorization(auth, menu){
    return {
        type: ADD_AUTHORIZATION,
        auth: convertAuthorizationFromEdit(menu, auth)
    }
}
export const EDIT_AUTHORIZATION = "EDIT_AUTHORIZATION";
export function editAuthorization(listItem) {
    return {
        type: EDIT_AUTHORIZATION,
        auth: convertAuthorizationToEdit(listItem)
    }
}

export const CLEAN_EDIT_AUTHORIZATION = "CLEAN_EDIT_AUTHORIZATION";
export function cleanEditAuthorization() {
    return {
        type: CLEAN_EDIT_AUTHORIZATION
    }
}

export const DELETE_AUTHORIZATION = "DELETE_AUTHORIZATION";
export function deleteAuthorization(auth){
    return {
        type: DELETE_AUTHORIZATION,
        auth: auth
    }
}

export function deleteMenuItem(menuId){
    return dispatch => {
        AuthorizationService.deleteAuthorizationsFor(menuId)
            .catch(error => Notify.showError(error));
    }
}

export function confirmDeleteAuthorization(auth){
    return dispatch => {
        UIkit.modal.confirm("Are you sure?", () => {
            dispatch(deleteAuthorization(auth));
        });
    };

}

export function listAuthorization(menu){
    return dispatch => {
        return AuthorizationService.listAuthorizationsFor(menu).then(response => {
            dispatch(receiveAuthList(menu, response.data));
        }).catch(error => {
            Notify.showError(error);
        });
    }
}

export function saveAuthorization(menu, authList){
    return dispatch => {
        let authListWithMenuId = authList.map(item => {
            item.to = _.merge(item.to, {externalId: menu.id});
            return item;
        });
        let request = {
            menuItem: {externalId: menu.id, name: menu.name },
            relations: authListWithMenuId
        };

        return AuthorizationService.saveAuthorization(request).catch(error => {
            Notify.showError(error);
        });
    }
}

export const RECEIVE_AUTH_LIST = "RECEIVE_AUTH_LIST";
function receiveAuthList(menu, authList) {
    return {
        type: RECEIVE_AUTH_LIST,
        authList: convertAuthorizationFromList(menu, authList.viewers)
    }
}