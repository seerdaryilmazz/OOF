import React from "react";
import ReactDOM from "react-dom";
import ReactDefaultBatchingStrategy from "react-dom/lib/ReactDefaultBatchingStrategy";
import ReactUpdates from "react-dom/lib/ReactUpdates";
import { browserHistory, IndexRoute, Route, Router } from "react-router";
import { Application } from "susam-components/layout";
import { AppLayout } from "susam-components/oneorder/layout";
import { verifySession } from "susam-components/services/SessionVerification";
import { AccountOperations } from "./account";
import { AccountMerge } from "./account-merge/AccountMerge";
import { MergeAccountWithAccount } from "./account-merge/MergeAccountWithAccount";
import { AccountManager } from './account/AccountManager';
import { ActivityManagement } from './activity/ActivityManagement';
import { AgreementManagement } from "./agreement";
import { AgreementQueue } from "./agreement-queue";
import { AgreementList } from "./agreement/AgreementList";
import { BillingItemManage } from "./billing-item";
import { Crm } from './Crm';
import { Home } from './Home';
import { InboundMail } from "./inbound/InboundMail";
import { LeadManagement } from "./lead";
import { LeadList } from "./lead/LeadList";
import { OpportunityManagement } from "./opportunity/OpportunityManagement";
import { QuoteExportQueue } from "./quote-export/QuoteExportQueue";
import { QuoteImportQueue } from "./quote-import/QuoteImportQueue";
import { QuoteManagement } from './quote/QuoteManagement';
import { Report } from './report/Report';
import { Search } from "./search/Search";
import { ServiceTypeManage } from "./service-type";
import { SpotQuotePdfSettings } from "./spotQuotePdfSetting/SpotQuotePdfSettings";
import { ReportErrorService } from "./services/ReportErrorService";

verifySession();

const appName = "crm";

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
        <Crm>
            <Router history={browserHistory}>
                <Route path="ui" >
                    <Route path={appName} component={AppLayout} title="crm" >
                        <IndexRoute component={Home}/>
                        <Route path="account" options={{mode: 'new'}} component = {AccountManager} />
                        <Route path="account/:accountId/view" options={{mode: 'view'}} component={AccountManager}/>
                        <Route path="account/:accountId/edit" options={{mode: 'edit'}} component={AccountManager}/>
                        <Route path="account/operations" component = {AccountOperations} />
                        <Route path="quote/new/:type/:serviceArea/:accountId(/:potentialId)" options={{mode: 'new'}} component={QuoteManagement}/>
                        <Route path="quote/view/:quoteId" options={{mode: 'view'}} component={QuoteManagement}/>
                        <Route path="quote/edit/:quoteId" options={{mode: 'edit'}} component={QuoteManagement}/>
                        <Route path="activity/new/:accountId" options={{mode: 'new'}} component={ActivityManagement}/>
                        <Route path="activity/view/:activityId" options={{mode: 'view'}} component={ActivityManagement}/>
                        <Route path="search/:query" component={Search}/>
                        <Route path="report" component = {Report} />
                        <Route path="spot-quote-pdf-setting" component={SpotQuotePdfSettings} />
                        <Route path="quote/export-queue" component={QuoteExportQueue} />
                        <Route path="quote/import-queue" component={QuoteImportQueue} />
                        <Route path="agreement" component={AgreementList}/>
                        <Route path="agreement/new/:type" options={{mode: 'new'}} component={AgreementManagement}/>
                        <Route path="agreement/view/:agreementId" options={{mode: 'view'}} component={AgreementManagement}/>
                        <Route path="lead" component={LeadList}/>
                        <Route path="lead/view/:leadId" options={{mode: 'view'}} component={LeadManagement}/>
                        <Route path="lead/edit/:leadId" options={{mode: 'edit'}} component={LeadManagement}/>
                        <Route path="agreement/queue" component={AgreementQueue}/>
                        <Route path="inbound-mail/:id" component={InboundMail}/>
                        <Route path="account/:itemId/merge" component = {AccountMerge} />
                        <Route path="account/:mergeAccountId/merge-with-account/:editAccountId" component = {MergeAccountWithAccount} />
                        <Route path="opportunity/new" options={{mode: 'new'}} component={OpportunityManagement}/>
                        <Route path="opportunity/view/:opportunityId" options={{mode: 'view'}} component={OpportunityManagement} />
                        <Route path="service-type" component={ServiceTypeManage} />
                        <Route path="billing-item" component={BillingItemManage} />
                    </Route>
                </Route>
            </Router>
        </Crm>
    </Application>
    , document.getElementById('root'));