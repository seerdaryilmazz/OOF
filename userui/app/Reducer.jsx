import {combineReducers} from "redux";
import {menuList} from "./uimenulist/Reducer";
import {authState} from "./uimenulist/auth/Reducer";

export const reducer = combineReducers({
    menuList,
    authState
})
