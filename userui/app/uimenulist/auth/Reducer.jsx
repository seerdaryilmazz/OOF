import * as Actions from "./Actions";
import _ from 'lodash';

const init = {
    teams: [],
    departments: [],
    subsidiaries: [],
    sectors: [],
    nodeTypes: [
        {
            id: Actions.Constants.NODE_TYPE_SUBSIDIARY,
            name: Actions.Constants.NODE_TYPE_SUBSIDIARY
        },
        {
            id: Actions.Constants.NODE_TYPE_DEPARTMENT,
            name: Actions.Constants.NODE_TYPE_DEPARTMENT
        },
        {
            id: Actions.Constants.NODE_TYPE_SECTOR,
            name: Actions.Constants.NODE_TYPE_SECTOR
        },
        {
            id: Actions.Constants.NODE_TYPE_CUSTOMER,
            name: Actions.Constants.NODE_TYPE_CUSTOMER
        },
        {
            id: Actions.Constants.NODE_TYPE_TEAM,
            name: Actions.Constants.NODE_TYPE_TEAM
        }
    ],
    authLevels: [
        {
            id: Actions.Constants.AUTH_LEVEL_MEMBER,
            name: "Member"
        },
        {
            id: Actions.Constants.AUTH_LEVEL_SUPERVISOR,
            name: "Supervisor"
        },
        {
            id: Actions.Constants.AUTH_LEVEL_MANAGER,
            name: "Manager"
        }
    ],
    auth: {node:{}},
    authList: []
};


export function authState(state = init, action) {
    switch (action.type) {

        case Actions.UPDATE_AUTH_FIELD:
        {
            let auth = _.cloneDeep(state.auth);
            _.set(auth, action.key, action.value);
            return Object.assign({}, state, {
                auth: auth
            });
        }

        case Actions.RECEIVE_AUTH_LOOKUPS:
            return Object.assign({}, state, {
                teams: action.teams,
                departments: action.departments,
                subsidiaries: action.subsidiaries,
                sectors: action.sectors
            });

        case Actions.RECEIVE_AUTH_LIST:
            return Object.assign({}, state, {
                authList: action.authList
            });

        case Actions.EDIT_AUTHORIZATION:
            return Object.assign({}, state, {
                auth: action.auth
            });

        case Actions.CLEAN_EDIT_AUTHORIZATION:
            return Object.assign({}, state, {
                auth: init.auth,
                authList: init.authList
            });

        case Actions.ADD_AUTHORIZATION:
        {
            let authList = _.cloneDeep(state.authList);
            authList.push(action.auth);
            return Object.assign({}, state, {
                authList: authList
            });
        }

        case Actions.DELETE_AUTHORIZATION:
        {
            let authList = _.cloneDeep(state.authList);
            _.remove(authList, {_key: action.auth._key});
            return Object.assign({}, state, {
                authList: authList
            });
        }


        default:
            return state;
    }
}