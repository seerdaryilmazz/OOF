import React from "react";
import ReactDOM from "react-dom";
import ReactDefaultBatchingStrategy from "react-dom/lib/ReactDefaultBatchingStrategy";
import ReactUpdates from "react-dom/lib/ReactUpdates";
import { browserHistory, IndexRoute, Route, Router } from "react-router";
import { Application } from "susam-components/layout";
import { AppLayout } from "susam-components/oneorder/layout";
import { verifySession } from "susam-components/services/SessionVerification";
import { CompanyCard } from './company/card/CompanyCard';
import { CompanyReferences } from './company/CompanyReferences';
import { EditCompany } from './company/EditCompany';
import { MergeCompanyWithCompany } from './company/MergeCompanyWithCompany';
import { MergeCompanyWithQueue } from './company/MergeCompanyWithQueue';
import { MoveLocation } from './company/MoveLocation';
import { NewCompany } from './company/NewCompany';
import { NewCompanyFromQueue } from './company/NewCompanyFromQueue';
import { EditCompanyShortNames } from "./company/short-name/EditCompanyShortNames";
import { CompanySearchHome } from './CompanySearchHome';
import { Home } from './Home';
import { KpiAssignment } from './KpiAssignment';
import { ExportQueue } from './queue/ExportQueue';
import { ImportCompany } from './queue/ImportCompany';
import { ImportQueue } from './queue/ImportQueue';
import { NextImportQueue } from './queue/NextImportQueue';
import { TestImportQueue } from './queue/TestImportQueue';
import { BrowseCompany } from './search/BrowseCompany';
import { SearchCompany } from './search/SearchCompany';
import { ReportErrorService } from "./services/ReportErrorService";
import { Settings } from './settings/Settings';

verifySession();

const appName = "kartoteks";

let currentLocation;
browserHistory.listen((location, action) => {
    currentLocation = location;
});

let isHandlingError = false;
const ReactTryCatchBatchingStrategy = {
    // this is part of the BatchingStrategy API. simply pass along
    // what the default batching strategy would do.
    get isBatchingUpdates () { return ReactDefaultBatchingStrategy.isBatchingUpdates; },

    batchedUpdates (...args) {
        try {
            ReactDefaultBatchingStrategy.batchedUpdates(...args);
        } catch (error) {
            if (isHandlingError) {
                // our error handling code threw an error. just throw now
                throw error;
            }

            isHandlingError = true;
            try {
                let url = `${currentLocation.pathname}${currentLocation.search}${currentLocation.hash}`;
                ReportErrorService.log(url, error).then(response => {
                    console.log("reported error");
                }).catch(error => {
                    console.error("reporting error", error);
                });
            } finally {
                isHandlingError = false;
            }
        }
    },
};

ReactUpdates.injection.injectBatchingStrategy(ReactTryCatchBatchingStrategy);

ReactDOM.render(
    <Application name={appName}>
        <Router history={browserHistory}>
            <Route path="ui">
                <Route path={appName} component={AppLayout} title="onecard" >
                    <IndexRoute  component={Home}/>
                    <Route path="test-import-queue" component={TestImportQueue}/>
                    <Route path="import-queue" component={ImportQueue}/>
                    <Route path="import-queue-next" component={NextImportQueue}/>
                    <Route path="import-queue/:queueId" component={ImportCompany}/>
                    <Route path="company/:companyId/merge" component={ImportCompany}/>
                    <Route path="company/new-from-queue/:queueId" component={NewCompanyFromQueue}/>
                    <Route path="company/new" component={NewCompany}/>
                    <Route path="company/:companyId/edit" component={EditCompany}/>
                    <Route path="company/:companyId/merge-with-queue/:queueId" component={MergeCompanyWithQueue}/>
                    <Route path="company/:companyId/merge-with-other/:companyToMergeId" component={MergeCompanyWithCompany}/>
                    <Route path="company/:companyId" component={CompanyCard}/>
                    <Route path="company/:companyId/refs" component={CompanyReferences}/>
                    <Route path="company/:companyId/move-location" component={MoveLocation}/>
                    <Route path="search/:query" component={SearchCompany}/>
                    <Route path="browse" component={BrowseCompany}/>
                    <Route path="kpi-assignment" component={KpiAssignment}/>
                    <Route path="settings" component={Settings}/>
                    <Route path="export-queue" component = {ExportQueue} />
                    <Route path="edit-short-names" component = {EditCompanyShortNames} />
                    <Route path="company-search" component = {CompanySearchHome} />
                </Route>
                <Route path={appName} >
                    <Route path="crm-company/new" options={{mode: 'crm'}} component={NewCompany}/>
                </Route>
            </Route>
        </Router>
    </Application>
    , document.getElementById('root'));

