import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory, IndexRoute, Route, Router } from 'react-router';
import { Application } from 'susam-components/layout';
import { AppLayout } from 'susam-components/oneorder/layout';
import { verifySession } from "susam-components/services/SessionVerification";
import { TemplateManagement } from './admin/template/TemplateManagement';
import Home from './Home';
import { UserPreferences } from './user/UserPreferences';

verifySession();

const appName = "notification";

ReactDOM.render(
    <Application name={appName}>
        <Router history={browserHistory}>
            <Route path="ui">
                <Route path={appName} component={AppLayout}>
                    <IndexRoute component={Home} />
                    <Route path="management" component={TemplateManagement} />
                    <Route path="user-preferences" component={UserPreferences} />
                </Route>
            </Route>
        </Router>
    </Application>
    , document.getElementById('root'));

