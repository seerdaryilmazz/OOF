import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory, IndexRoute, Route, Router } from 'react-router';
import { Application } from 'susam-components/layout';
import { AppLayout } from 'susam-components/oneorder/layout';
import { verifySession } from "susam-components/services/SessionVerification";
import { TranslationManagement } from './TranslateManager/TranslationManagement';
import { UpdateTranslation } from './UpdateTranslation';

verifySession();

const appName = "translator";

ReactDOM.render(
    <Application name={appName}>
        <Router history={browserHistory}>
            <Route path="ui">
                <Route path={appName} component={AppLayout}>
                    <IndexRoute component={UpdateTranslation}/>
                    <Route path="manage" component={TranslationManagement} />
                </Route>
            </Route>
        </Router>
    </Application>
    , document.getElementById('root'));

