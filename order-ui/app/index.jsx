import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory, IndexRoute, Route, Router } from 'react-router';
import { Application } from 'susam-components/layout';
import { NotFound } from 'susam-components/oneorder/error';
import { AppLayout, AppLayoutMaximized } from 'susam-components/oneorder/layout';
import { ModalWrapper } from "susam-components/oneorder/ModalWrapper";
import { verifySession } from "susam-components/services/SessionVerification";
import { Approval } from './approval/Approval';
import { CreateOrder } from './create-order/CreateOrder';
import { OrderExportInfo } from './create-order/customs/OrderExportInfo';
import { SelectTemplate } from './create-order/SelectTemplate';
import { CompanyCustomsDefinition } from "./customs-rule/CompanyCustomsDefinition";
import { DeliveryDateRuleManagement } from './delivery-date-rule/DeliveryDateRuleManagement';
import Home from './Home';
import { HSCode } from "./hscode/HSCode";
import { OrderList } from './list-orders/OrderList';
import { OrderExportQueue } from "./order-export/OrderExportQueue";
import { OrderPage } from './order-page/OrderPage';
import { OrderPageEasy } from './order-page/OrderPageEasy';
import { OrderRuleSetPage } from './order-page/OrderRuleSetPage';
import { OrderPlanning } from './order-planning/OrderPlanning';
import { FindNode } from './order-template/findnode/FindNode';
import { OrderTemplateNodePage } from './order-template/nodecreate/OrderTemplateNodePage';
import { OrderTemplatePage } from './order-template/template/OrderTemplatePage';
import { OrderRouteConstraint } from './orderinfo/OrderRouteConstraint';
import { OrderVehicleEquipmentInfo } from './orderinfo/OrderVehicleEquipmentInfo';
import { PackageGroup } from './package-group/PackageGroup';
import { PackageType } from './package-type/PackageType';
import { Planning } from './planning/Planning';
import { PlanningForColDist } from './planning/PlanningForColDist';
import { PlanningForFtl } from './planning/PlanningForFtl';
import { PlanningForLinehaul } from './planning/PlanningForLinehaul';
import { PlanningSearch } from './planningSearch/PlanningSearch';
import { OrderRequest } from './preOrder/OrderRequest';
import { OrderRequestList } from './preOrder/OrderRequestList';
import { SearchPlanning } from './search-planning/SearchPlanning';
import { ShipmentsSearch } from './search-shipment/ShipmentsSearch';
import NotAuthorized from './security/NotAuthorized';
import { isAuthorized } from './security/route';
import { SenderTemplateManagement } from './sender-rule/SenderTemplateManagement';
import { ShipmentImportQueue } from './shipment-import/ShipmentImportQueue';
import { TestImportQueue } from './shipment-import/TestImportQueue';
import { ShipmentSearch } from './shipment-search/ShipmentSearch';
import { OrderTemplateManagement } from './template/order/TemplateManagement';
import { Test } from './Test';
import { TrailerPlanning, TrailerPlanningForColDist, TrailerPlanningForFTL, TrailerPlanningForLinehaul } from './trailer-planning/TrailerPlanning';
import { TrailerPlanningList } from './trailer-planning/TrailerPlanningList';
import { TrailerPlanningMap } from './trailer-planning/TrailerPlanningMap';
import { CustomerRepresentativeHome } from './user-home/CustomerRepresentativeHome';
import { DataEntryHome } from './user-home/DataEntryHome';
import { PortfolioOwnerHome } from './user-home/PortfolioOwnerHome';
import { SalesBoxOwnerHome } from './user-home/SalesBoxOwnerHome';
import { VehiclePlanningHome } from './user-home/VehiclePlanningHome';
import { Order } from "./view-order/Order";

verifySession();

const appName = "order";

const ModalComponents = {
    "sender-template": SenderTemplateManagement,
    "customs-rules": CompanyCustomsDefinition,
    "delivery-date-rules": DeliveryDateRuleManagement
}

function checkAuthorization(nextState, replaceState){
    let pathname = nextState.location.pathname;
    if(!_.startsWith(pathname, `/ui/${appName}/not-authorized`) && !isAuthorized(pathname)){
        replaceState(`/ui/${appName}/not-authorized`);
    }
}

ReactDOM.render(
    <Application name = {appName}>
        <Router history = {browserHistory}>
            <Route path="ui" onEnter={checkAuthorization}>
                <Route path={appName}>
                    <Route path="modal-:component" options={{components: ModalComponents}} component = {ModalWrapper} />
                </Route>
                <Route path={appName} component={AppLayoutMaximized}>
                    <Route path="trailer-planning" component = {TrailerPlanning} />
                    <Route path="trailer-planning-col-dist" component = {TrailerPlanningForColDist} />
                    <Route path="trailer-planning-linehaul" component = {TrailerPlanningForLinehaul} />
                    <Route path="trailer-planning-ftl" component = {TrailerPlanningForFTL} />

                    <Route path="trailer-planning-map" component = {TrailerPlanningMap} />
                    <Route path="trailer-planning-list" component = {TrailerPlanningList} />
                    <Route path="search-planning" component = {SearchPlanning} />
                    <Route path="shipment-search-old" component={ShipmentSearch} />
                    <Route path="shipment-search" component={ShipmentsSearch}  />
                    <Route path="shipment-search/:shipmentNo" component={ShipmentsSearch}  />
                    
                </Route>
                <Route path = {appName} component={AppLayout} >
                    <IndexRoute component={Home}/>
                    <Route path="view-order/:id" component={Order} />
                    <Route path="test-page" component={Test}/>
                    <Route path="order-page" component={OrderPage}/>
                    <Route path="order-page-easy" component={OrderPageEasy}/>
                    <Route path="order-rule-set-page" component={OrderRuleSetPage}/>
                    <Route path="order-request" component={OrderRequest}/>
                    <Route path="order-template-node" component={OrderTemplateNodePage}/>
                    <Route path="order-template" component={OrderTemplatePage}/>
                    <Route path="order-template-find" component={FindNode}/>

                    <Route path="create-order" component={CreateOrder}/>
                    <Route path="select-template" component={SelectTemplate}/>
                    <Route path="list-order" component={OrderList}/>
                    <Route path="export-info" component={OrderExportInfo}/>
                    <Route path="order-request-list" component={OrderRequestList} />
                    <Route path="order-vehicle" component={OrderVehicleEquipmentInfo} />
                    <Route path="order-route" component={OrderRouteConstraint} />
                    <Route path="package-type" component={PackageType} />
                    <Route path="package-group" component={PackageGroup} />
                    <Route path="cust-rep-home" component={CustomerRepresentativeHome} />
                    <Route path="data-entry-home" component={DataEntryHome} />
                    <Route path="portfolio-owner-home" component={PortfolioOwnerHome} />
                    <Route path="sales-box-owner-home" component={SalesBoxOwnerHome} />

                    <Route path="vp-home" component={VehiclePlanningHome} />
                    <Route path="vp-home/:country" component={VehiclePlanningHome} />
                    <Route path="planning" component={Planning} />
                    <Route path="planning-col-dist" component={PlanningForColDist} />
                    <Route path="planning-linehaul" component={PlanningForLinehaul} />
                    <Route path="planning-ftl" component={PlanningForFtl} />

                    <Route path="planning-search" component={PlanningSearch} />

                    <Route path="approval" component={Approval} />
                    <Route path="order-planning" component={OrderPlanning} />

                    <Route path="templates" component={OrderTemplateManagement} />
                    <Route path="templates/:id" component={OrderTemplateManagement} />
                    <Route path="sender-template" component={SenderTemplateManagement} />

                    <Route path="delivery-date-rules" component={DeliveryDateRuleManagement} />
                    <Route path="customs-rules" component={CompanyCustomsDefinition} />
                    <Route path="export-queue" component={OrderExportQueue} />
                    <Route path="import-queue" component={ShipmentImportQueue} />
                    <Route path="import-queue-test" component={TestImportQueue} />
                    <Route path="hscode" component={HSCode} />
                    <Route path="not-authorized" component={NotAuthorized} />
                </Route>
                <Route path={appName} component={AppLayoutMaximized}>
                    <Route path='*' exact={true} component={NotFound} />
                </Route>
            </Route>
        </Router>
    </Application>
    , document.getElementById('root'));

