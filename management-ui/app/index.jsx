import React from "react";
import ReactDOM from "react-dom";
import { browserHistory, IndexRoute, Route, Router } from "react-router";
import { Application } from "susam-components/layout";
import { NotFound } from 'susam-components/oneorder/error';
import { AppLayout } from "susam-components/oneorder/layout";
import { AppLayoutMaximized } from "susam-components/oneorder/layout/AppLayoutMaximized";
import { ModalWrapper } from "susam-components/oneorder/ModalWrapper";
import { verifySession } from "susam-components/services/SessionVerification";
import { Authorization } from "./authorization/Authorization";
import TeamManagement from "./authorization/team";
import { CustomerGroup } from "./customerGroup/CustomerGroup";
import { DefaultHome } from './DefaultHome';
import { EventBillingItems } from './definition/billing/EventBillingItems';
import { Countries } from './definition/country/Countries';
import { ExchangeRates } from './definition/exchangeRate/ExchangeRates';
import { Incoterms } from './definition/incoterms/Incoterms';
import { CustomerWarehouseList } from './definition/location/customerwarehouse/CustomerWarehouseList';
import { CustomerWarehouseWizard } from './definition/location/customerwarehouse/CustomerWarehouseWizard';
import { CustomsOfficeList } from './definition/location/customs/CustomsOfficeList';
import { CustomsOfficeWizard } from './definition/location/customs/CustomsOfficeWizard';
import { PortList } from "./definition/location/port/PortList";
import { PortWizard } from "./definition/location/port/PortWizard";
import { TerminalList } from './definition/location/terminal/TerminalList';
import { TerminalWizard } from './definition/location/terminal/TerminalWizard';
import { TrailerParkList } from './definition/location/trailer-park/TrailerParkList';
import { TrailerParkWizard } from './definition/location/trailer-park/TrailerParkWizard';
import { WarehouseList } from './definition/location/warehouse/WarehouseList';
import { WarehouseWizard } from './definition/location/warehouse/WarehouseWizard';
import { LinehaulRoute } from './definition/route/LinehaulRoute';
import { RouteLeg } from './definition/route/RouteLeg';
import { Subsidiaries } from './definition/subsidiary/Subsidiaries';
import { Subsidiary } from './definition/subsidiary/Subsidiary';
import DepartmentManagement from './department-management';
import { Departments } from "./department/Departments";
import { JsonSchemaBrowser } from "./JsonSchemaBrowser";
import { EventMonitoring } from './monitor/EventMonitoring';
import { OperationRegionEdit } from './operationRegion/OperationRegionEdit';
import { OperationRegionPage } from './operationRegion/OperationRegionPage';
import { OperationRegionSummary } from "./operationRegion/summary/OperationRegionSummary";
import { ProjectCreate } from "./project/create/ProjectCreate";
import { ProjectEdit } from "./project/edit/ProjectEdit";
import { ProjectList } from "./project/list/ProjectList";
import { AssignmentPlanningRule } from "./rule/assignmentPlan/AssignmentPlanningRule";
import { CarrierUnitModelRule } from "./rule/carrierunitmodel/CarrierUnitModelRule";
import { CollectionSchedules } from './rule/collectionschedule/CollectionSchedules';
import { CountryPlanningRule } from "./rule/countryplanning/CountryPlanningRule";
import { CustomerWarehouseRule } from "./rule/customerwarehouse/CustomerWarehouseRule";
import { DistributionSchedules } from './rule/distributionschedule/DistributionSchedules';
import { IncotermsRules } from './rule/incoterms/IncotermsRules';
import { LoadSpecRule } from "./rule/loadspec/LoadSpecRule";
import { MotorVehicleProfileRules } from './rule/motorVehicleProfile/MotorVehicleProfileRules';
import { MotorVehicleTypeRules } from './rule/motorVehicleType/MotorVehicleTypeRules';
import { PackageRule } from "./rule/package/PackageRule";
import { ProductRules } from './rule/product/ProductRules';
import { SenderRules } from './rule/sender/SenderRules';
import { RuleSummary } from "./rule/summary/RuleSummary";
import { TrailerRules } from './rule/trailer/TrailerRules';
import { TruckLoadTypeRule } from "./rule/truckloadtype/TruckLoadTypeRule";
import { WarehouseRule } from "./rule/warehouse/WarehouseRule";
import NotAuthorized from './security/NotAuthorized';
import { isAuthorized } from './security/route';
import { RailwayTariff } from './tariffs/railway/RailwayTariff';
import { RoadTariff } from './tariffs/road/RoadTariff';
import { SeawayTariff } from './tariffs/seeway/SeawayTariff';
import { UserManagement } from './user/UserManagement';
import { UserGroupZoneManagement } from "./usergroupzone/UserGroupZoneManagement";
import { ZoneManagement } from "./zone/ZoneManagement";
import { EmailList } from "./email/EmailList";
import { EmailBlackWhiteList } from "./email/EmailBlackWhiteList";
import { ConfigurationManage, ConfigurationKeyManage } from "./configuration";

verifySession();

const appName = "management";

const ModalComponents = {
    "warehouse": WarehouseWizard,
    "customerwarehouse": CustomerWarehouseWizard,
    "customerwarehouses-rules": CustomerWarehouseRule
}

function checkAuthorization(nextState, replaceState){
    let pathname = nextState.location.pathname;
    if(!_.startsWith(pathname, `/ui/${appName}/not-authorized`) && !isAuthorized(pathname)){
        replaceState(`/ui/${appName}/not-authorized`);
    }
}

ReactDOM.render(
   <Application name={appName}>
        <Router history={browserHistory}>
            <Route path="ui" onEnter={checkAuthorization}>
                <Route path={appName}>
                    <Route path="modal-:component" options={{components: ModalComponents}} component={ModalWrapper}/>
                </Route>
                <Route path={appName} component={AppLayout}>
                    <IndexRoute component={ZoneManagement}/>
                    <Route path="project-create" component={ProjectCreate}/>
                    <Route path="project-edit" component={ProjectEdit}/>
                    <Route path="project-list" component={ProjectList}/>

                    <Route path="port-list" component={PortList}/>
                    <Route path="port-edit" component={PortWizard}/>
                    <Route path="terminal-list" component={TerminalList}/>
                    <Route path="terminal-edit" component={TerminalWizard}/>
                    <Route path="customerwarehouse-list" component={CustomerWarehouseList}/>
                    <Route path="customerwarehouse-edit" component={CustomerWarehouseWizard}/>
                    <Route path="warehouse-list" component={WarehouseList}/>
                    <Route path="warehouse-edit" component={WarehouseWizard}/>
                    <Route path="trailer-park-list" component={TrailerParkList}/>
                    <Route path="trailer-park-edit" component={TrailerParkWizard}/>
                    <Route path="customs-office-list" component={CustomsOfficeList}/>
                    <Route path="customs-office-edit" component={CustomsOfficeWizard}/>
                    <Route path="warehouses-rules" component={WarehouseRule}/>
                    <Route path="customerwarehouses-rules" component={CustomerWarehouseRule}/>
                    <Route path="packages-rules" component={PackageRule}/>
                    <Route path="loadtypes-rules" component={TruckLoadTypeRule}/>
                    <Route path="loadspecs-rules" component={LoadSpecRule}/>
                    <Route path="carrierunitmodel-rules" component={CarrierUnitModelRule}/>
                    <Route path="countryplanning-rules" component={CountryPlanningRule}/>
                    <Route path="assignmentplanning-rules" component={AssignmentPlanningRule}/>
                    <Route path="operation-region-summary" component={OperationRegionSummary}/>
                    <Route path="rules" component={RuleSummary}/>
                    <Route path="schema" component={JsonSchemaBrowser}/>
                    <Route path="user-group-zone" component={UserGroupZoneManagement}/>
                    <Route path="department/:code" component={DepartmentManagement} />
                    <Route path="department" component={Departments}/>
                    <Route path="operation-auth" component={Authorization}/>
                    <Route path="incoterms" component={Incoterms}/>
                    <Route path="incoterms-rules" component={IncotermsRules}/>
                    <Route path="motor-vehicle-type-rules" component={MotorVehicleTypeRules}/>
                    <Route path="route-legs" component={RouteLeg}/>
                    <Route path="routes" component={LinehaulRoute}/>
                    <Route path="trailer-rules" component={TrailerRules}/>
                    <Route path="sender-rules" component={SenderRules} />
                    <Route path="motor-vehicle-profile-rules" component={MotorVehicleProfileRules} />
                    <Route path="collection-schedule-rules" component={CollectionSchedules} />
                    <Route path="distribution-schedule-rules" component={DistributionSchedules} />
                    <Route path="product-rules" component={ProductRules} />
                    <Route path="operation-region" component={OperationRegionPage} />
                    <Route path="operation-region-edit" component={OperationRegionEdit} />
                    <Route path="event-billing-item" component={EventBillingItems} />
                    <Route path="subsidiaries" component={Subsidiaries}/>
                    <Route path="subsidiary" component={Subsidiary}/>
                    <Route path="exchange-rates" component={ExchangeRates}/>
                    <Route path="countries" component={Countries}/>
                    <Route path="event-monitoring" component = {EventMonitoring}/>
                    <Route path="road-tariff" component = {RoadTariff}  />
                    <Route path="railway-tariff" component = {RailwayTariff}  />
                    <Route path="seaway-tariff" component = {SeawayTariff}  />
                    <Route path="user" component={UserManagement} />
                    <Route path="default-home" component={DefaultHome} />
                    <Route path="customer-portfolio" component={CustomerGroup} />
                    <Route path="team" component={TeamManagement} />
                    <Route path="email-list" component={EmailList} />
                    <Route path="email-black-white-list" component={EmailBlackWhiteList} />
                    <Route path="not-authorized" component={NotAuthorized} />
                    <Route path="configuration/key" component={ConfigurationKeyManage} />
                    <Route path="configuration" component={ConfigurationManage} />
                </Route>
                <Route path={appName} component={AppLayoutMaximized}>
                    <Route path='*' exact={true} component={NotFound} />
                </Route>
            </Route>
        </Router>
    </Application>
    , document.getElementById('root'));

