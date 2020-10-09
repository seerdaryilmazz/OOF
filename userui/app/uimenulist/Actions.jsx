
import {UserService} from "../services";
import {Notify} from "susam-components/basic";
import _ from 'lodash';
import {listAuthorization, saveAuthorization, cleanEditAuthorization, deleteMenuItem} from './auth/Actions';

function convertToTree(id, list) {
    if (!list) {
        return null;
    }

    let result = [];
    list.forEach(e => {
        if (id == null && !e.parent) {
            result.push(e);
            e.children = convertToTree(e.id, list)
        } else {
            if (e.parent && e.parent.id == id) {
                result.push(e);
                e.children = convertToTree(e.id, list)
            }
        }
    });
    let sorted = _.sortBy(result, ['rank']);
    return sorted;
}

export function fetchMenuList() {
    return dispatch => {
        dispatch(setShowLoader(true));
        return UserService.getMenuList().then(response => {
            dispatch(receiveMenuList(response.data, convertToTree(null, response.data)));
        }).catch(error => {
            dispatch(setShowLoader(false));
            Notify.showError(error);
        });
    }
}

export const RECEIVE_MENU_LIST = "RECEIVE_MENU_LIST";
function receiveMenuList(menuList, menuTree) {
    return {
        type: RECEIVE_MENU_LIST,
        menuList: menuList,
        menuTree: menuTree,
        busy: false
    }
}

export const ADD_SUB_MENU = "ADD_SUB_MENU";
export function addSubMenu(menu) {
    return {
        type: ADD_SUB_MENU,
        menu: menu
    }
}

export function newSubMenu(menu){
    return dispatch => {
        dispatch(addSubMenu(menu));
        dispatch(cleanEditAuthorization());
    }
}

export const SET_HIDE_MENU_DETAILS = "SET_HIDE_MENU_DETAILS";
export function setHideMenuDetails(val) {
    return {
        type: SET_HIDE_MENU_DETAILS,
        val: val
    }
}

export const SET_SHOW_LOADER = "SET_SHOW_LOADER";
export function setShowLoader(val) {
    return {
        type: SET_SHOW_LOADER,
        val: val
    }
}

export const UPDATE_MENU_FIELD = "UPDATE_MENU_FIELD";
export function updateMenuField(name, value) {
    return {
        type: UPDATE_MENU_FIELD,
        name: name,
        value: value
    }
}

export function saveMenu(menu, authList) {
    return dispatch => {
        dispatch(setShowLoader(true));
        return UserService.saveMenu(menu).then(response => {
            Notify.showSuccess("Menu item saved");
            dispatch(saveAuthorization(response.data, authList));
            dispatch(fetchMenuList());
        }).catch(error => {
            dispatch(setShowLoader(false));
            Notify.showError(error);
        });
    }
}

export function deleteMenu(menuId) {
    return dispatch => {
        UIkit.modal.confirm("Are you sure?", () => {
            dispatch(setShowLoader(true));
            return UserService.deleteMenu(menuId).then(response => {
                Notify.showSuccess("Menu item deleted");
                dispatch(deleteMenuItem(menuId));
                dispatch(fetchMenuList());
                dispatch(setHideMenuDetails(true));
            }).catch(error => {
                dispatch(setShowLoader(false));
                Notify.showError(error);
            });
        });

    }
}

export const EDIT_MENU = "EDIT_MENU";
export function editMenu(menu) {
    return {
        type: EDIT_MENU,
        menu: menu
    }
}

export function selectMenu(menu) {
    return dispatch => {
        dispatch(editMenu(menu));
        dispatch(cleanEditAuthorization());
        dispatch(listAuthorization(menu));
    }
}

export function changeRank(menu, parent, rank) {
    return dispatch => {
        dispatch(setShowLoader(true));
        return UserService.changeRank(menu, parent, rank).then(response => {
            Notify.showSuccess("Menu order updated");
            dispatch(fetchMenuList());
            dispatch(setHideMenuDetails(true));
        }).catch(error => {
            dispatch(setShowLoader(false));
            Notify.showError(error);
        });
    }
}

