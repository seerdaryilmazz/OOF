import { createHashHistory } from 'history';
import React from "react";
import ReactDOM from "react-dom";
import { Route, Router, useRouterHistory } from "react-router";
import { Application } from "susam-components/layout";
import { AppLayout } from "susam-components/oneorder/layout";
import { verifySession } from "susam-components/services/SessionVerification";
import { Home } from './Home';
import { AgreementManagement} from "./agreement/AgreementManagement";

verifySession();

const appName = "agreement";
const appHistory = useRouterHistory(createHashHistory)({ queryKey: false });

ReactDOM.render(
    <Application name={appName}>
        <Router history={appHistory}>
            <Route path="ui" >
                <Route path={appName} component={AppLayout} title="agreement" >
                    <Route path="/" component={Home}/>
                    <Route path="/new/:type" options={{mode: 'new'}} component={AgreementManagement}/>
                    <Route path="/view/:agreementId" options={{mode: 'view'}} component={AgreementManagement}/>
                </Route>
            </Route>
        </Router>
    </Application>
    , document.getElementById('root'));