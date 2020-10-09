import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { browserHistory, Route, Router, IndexRoute } from "react-router";
import { applyMiddleware, createStore } from "redux";
import createLogger from "redux-logger";
import thunkMiddleware from "redux-thunk";
import { Application } from "susam-components/layout";
import { AppLayout } from "susam-components/oneorder/layout";
import { verifySession } from "susam-components/services/SessionVerification";
import { reducer } from "./Reducer";
import { UIMenuList } from "./uimenulist/UIMenuList";
import { UserManagement } from "./user-management/UserManagement";

verifySession();

const appName = "user";
const loggerMiddleware = createLogger();
const store = createStore(reducer,
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware 
    ));

ReactDOM.render(
    <Provider store={store}>
        <Application name={appName}>
            <Router history={browserHistory}>
                <Route path="ui">
                    <Route path={appName} component={AppLayout}>
                        <IndexRoute component={UserManagement} />
                        <Route path="menu" component={UIMenuList}/>
                    </Route>
                </Route>
            </Router>
        </Application>
    </Provider>,
    document.getElementById('root')
);