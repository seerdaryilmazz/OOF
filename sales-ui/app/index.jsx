import React from "react";
import ReactDOM from "react-dom";
import { browserHistory, IndexRoute, Route, Router } from "react-router";
import { Application } from "susam-components/layout";
import { AppLayout } from "susam-components/oneorder/layout";
import { verifySession } from "susam-components/services/SessionVerification";
import { BillingItemPriceManagement } from './billingItem/BillingItemPriceManagement';
import { LineManagement } from './calculator/line/LineManagement';
import { PriceManagement } from './calculator/price/PriceManagement';
import { PriceUpdateManagement } from './calculator/price/PriceUpdateManagement';
import { RegionManagement } from './calculator/region/RegionManagement';
import { PricingCustomsOfficeList } from './customs/PricingCustomsOfficeList';
import { Home } from './Home';
import { ForeignRegionManagement, ForeignRegionPriceManagement, LinehaulManagement, LocalRegionManagement, LocalRegionPriceManagement, PayweightManagement, PricingLogManagement, ProfitMarginManagement, SurchargeManagement, TariffGroupManagement } from "./price";
import NotAuthorized from './security/NotAuthorized';
import { isAuthorized } from './security/route';
import { QuoteValidationTest } from "./validator/QuoteValidationTest";

verifySession();

const appName = "sales";

function checkAuthorization(nextState, replaceState) {
    let pathname = nextState.location.pathname;
    if (!_.startsWith(pathname, `/ui/${appName}/not-authorized`) && !isAuthorized(pathname)) {
        replaceState(`/ui/${appName}/not-authorized`);
    }
}
ReactDOM.render(
    <Application name={appName}>
        <Router history={browserHistory}>
            <Route path="ui" onEnter={checkAuthorization}>
                <Route path={appName} component={AppLayout} title="sales" >
                    <IndexRoute component={Home} />
                    <Route path="region" component={RegionManagement} />
                    <Route path="line" component={LineManagement} />
                    <Route path="price" component={PriceManagement} />
                    <Route path="price-update" component={PriceUpdateManagement} />
                    <Route path="billing-item-price" component={BillingItemPriceManagement} />
                    <Route path="pricing-customs-offices" component={PricingCustomsOfficeList} />
                    <Route path="quote-validator" component={QuoteValidationTest} />
                    <Route path="not-authorized" component={NotAuthorized} />
                    <Route path="pricing/tariff-group" component={TariffGroupManagement} />
                    <Route path="pricing/payweight" component={PayweightManagement} />
                    <Route path="pricing/local-region" component={LocalRegionManagement} />
                    <Route path="pricing/foreign-region" component={ForeignRegionManagement} />
                    <Route path="pricing/local-region/price" component={LocalRegionPriceManagement} />
                    <Route path="pricing/foreign-region/price" component={ForeignRegionPriceManagement} />
                    <Route path="pricing/foreign-region/price" component={ForeignRegionPriceManagement} />
                    <Route path="pricing/linehaul" component={LinehaulManagement} />
                    <Route path="pricing/profit-margin" component={ProfitMarginManagement} />
                    <Route path="pricing/surcharge" component={SurchargeManagement} />
                    <Route path="pricing/log" component={PricingLogManagement} />
                </Route>
            </Route>
        </Router>
    </Application>
    , document.getElementById('root'));