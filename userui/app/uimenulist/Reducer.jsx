import * as Actions from "./Actions";

const init = {
    menuList: [],
    menuTree: [],
    menu: {
        name: "",
        url: ""
    },
    hideMenuDetails: true,

};

export function menuList(state = init, action) {
    switch (action.type) {

        case Actions.SET_SHOW_LOADER:
            return Object.assign({}, state, {
                busy: action.val
            });

        case Actions.RECEIVE_MENU_LIST:
            return Object.assign({}, state, {
                menuList: action.menuList,
                menuTree: action.menuTree,
                busy: action.busy
            });

        case Actions.ADD_SUB_MENU:
            let parent = null;
            if(action.menu){
                parent = {id: action.menu.id, name: action.menu.name};
            }
            let menu = Object.assign({}, _.cloneDeep(init.menu), {
                parent: parent
            });

            return Object.assign({}, state, {
                menu: menu,
                hideMenuDetails: false
            });

        case Actions.SET_HIDE_MENU_DETAILS:
            return Object.assign({}, state, {
                hideMenuDetails: action.val
            });

        case Actions.UPDATE_MENU_FIELD:
            let menu2 = _.cloneDeep(state.menu);
            menu2[action.name] = action.value;
            return Object.assign({}, state, {
                menu: menu2
            });

        case Actions.EDIT_MENU:
            return Object.assign({}, state, {
                menu: action.menu,
                hideMenuDetails: false
            });

        default:
            return state;
    }
}
