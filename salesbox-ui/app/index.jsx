import React from "react";
import ReactDOM from "react-dom";
import { browserHistory, IndexRoute, Route, Router } from "react-router";
import { Application } from "susam-components/layout";
import { AppLayout } from "susam-components/oneorder/layout";
import { verifySession } from "susam-components/services/SessionVerification";
import { Relations } from './accountOwnerSalesBoxOwnerRelation/Relations';
import { Home } from './Home';
import { Regions } from './region/Regions';
import { SalesBoxCancelReasons } from './salesBoxCancelReason/SalesBoxCancelReasons';
import { SalesDemands } from './salesDemand/SalesDemands';

verifySession();

const appName = "salesbox";

ReactDOM.render(
    <Application name={appName}>
        <Router history={browserHistory}>
            <Route path="ui" >
                <Route path={appName} component={AppLayout} title="Salesbox">
                    <IndexRoute component={Home}/>
                    <Route path="region" component={Regions}/>
                    <Route path="sales-demand" component={SalesDemands}/>
                    <Route path="account-owner-sales-box-owner-relation" component={Relations}/>
                    <Route path="sales-box-cancel-reason" component={SalesBoxCancelReasons}/>
                </Route>
            </Route>
        </Router>
    </Application>
    , document.getElementById('root'));

