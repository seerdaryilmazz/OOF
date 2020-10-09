import React from 'react';
import * as axios from 'axios';
import _ from 'lodash';

import {AutoComplete,DateTime,Date, Slider,FileInput, NumberDropDown}from 'susam-components/advanced';
import {Card, Grid, GridCell,Modal,PageHeader, Alert, Loader} from 'susam-components/layout';
import {Notify, Checkbox,CheckboxGroup,TextInput,Button,RadioButton, RadioGroup, DropDown, Span} from 'susam-components/basic';
import {AuthorizationService, BillingService, ContractService, Kartoteks, OrderRequestService, ProjectService} from '../services/';
import {FindNode, FindNodeTemplateList} from "./pick-template/FindNode.jsx";
import {DocumentList} from './DocumentList';

const ORDER_TYPE_CONTRACTED = {
    id: "CONTRACTED",
    code: "CONTRACTED",
    name: "Contracted"
};

const ORDER_TYPE_SPOT = {
    id: "SPOT",
    code: "SPOT",
    name: "Spot"
};

export class OrderRequest extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            orderRequest: {
                orderType: ORDER_TYPE_CONTRACTED,
                confirmationRequired: false,
                documents: [],

            },
            source: [],
            count: 0,
            ORDERTEMPLATE_CONSTANT: "OrderTemplate",
            subsidiaries: [],
            contracts: [],
            quotes: []
        };
        this.orderTypes = [ORDER_TYPE_CONTRACTED, ORDER_TYPE_SPOT];
    }

    componentDidMount() {

        axios.all([
            Kartoteks.getCompaniesRelatedToCustomerRep(),
            AuthorizationService.getSubsidiariesOfCurrentUser()
        ]).then(axios.spread((response1, response2) => {

            let state = _.cloneDeep(this.state);

            state.customers = response1.data.map(item => {
                return item.company;
            });
            state.customers = _.sortBy(state.customers, ["name"]);

            if (state.customers.length == 1){
                state.orderRequest.customerId = state.customers[0].id;
            }

            state.subsidiaries = response2.data;
            state.subsidiaries = _.sortBy(state.subsidiaries, ["name"]);

            if (state.subsidiaries.length == 1) {
                state.orderRequest.subsidiary = state.subsidiaries[0];
            }

            if (!_.isNil(state.orderRequest.customerId)) {
                if (state.orderRequest.orderType.code == ORDER_TYPE_CONTRACTED.code) {
                    this.setState(state, () => this.loadContracts(state.orderRequest.customerId, state.orderRequest.subsidiary));
                } else if (state.orderRequest.orderType.code == ORDER_TYPE_SPOT.code) {
                    this.setState(state, () => this.loadQuotes(state.orderRequest.customerId));
                }
            } else {
                this.setState(state);
            }

        })).catch((error) => {
            Notify.showError(error);
        });
    }

    loadContracts(companyId, subsidiary) {
        if (_.isNil(companyId) || _.isNil(subsidiary)) {
            this.setState({contracts: []});
        } else {
            ContractService.findContractsForNewOrderRequestPage(companyId, subsidiary.id).then(response => {
                let contracts = response.data;
                contracts = _.sortBy(contracts, ["name"]);
                this.setState({contracts: contracts});
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    loadQuotes(companyId) {
        if (_.isNil(companyId)) {
            this.setState({quotes: []});
        } else {
            BillingService.getAvailableWonQuotesByCompany(companyId).then(response => {
                let quotes = response.data;
                quotes = _.sortBy(quotes, ["number"]);
                this.setState({quotes: quotes});
            }).catch(error => {
                Notify.showError(error);
            });
        }
    }

    handleSelectCustomer(customer) {

        if (customer) {

            ProjectService.getTemplatesForCustomer(customer.id).then(response => {
                this.setState({projects: response.data});
            }).catch(error => {
                Notify.showError(error);
            });

            let state = _.cloneDeep(this.state);
            state.orderRequest.customerId = customer.id;
            state.orderRequest.contract = null;
            state.orderRequest.quote = null;
            state.contracts = [];
            state.quotes = [];

            if (state.orderRequest.orderType.code == ORDER_TYPE_CONTRACTED.code) {
                this.setState(state, () => this.loadContracts(state.orderRequest.customerId, state.orderRequest.subsidiary));
            } else if (state.orderRequest.orderType.code == ORDER_TYPE_SPOT.code) {
                this.setState(state, () => this.loadQuotes(state.orderRequest.customerId));
            }

        } else {

            let state = _.cloneDeep(this.state);
            state.orderRequest.customerId = null;
            state.orderRequest.contract = null;
            state.orderRequest.quote = null;
            state.contracts = [];
            state.quotes = [];

            this.setState(state);
        }
    }

    updateOrderRequestState(field, value){
        let state = _.cloneDeep(this.state);
        state.orderRequest[field] = value;
        this.setState(state);
    }

    updateState(field, value){
        let state = _.cloneDeep(this.state);
        state[field] = value;
        this.setState(state);
    }

    setAgentLogPartner(dataList) {
        let state = _.cloneDeep(this.state);
        if (dataList && dataList.length > 0) {
            state.agentOrLogisticsList = dataList;
            state.required = true;
            state.acCustomerDisabled = false;
        }else{
            state.acCustomerDisabled = true;
        }
        this.setState(state);
    }

    handleOpenProjectTemplatePick(){

        this.projectTemplateModel.open();
    }

    handleCloseProjectTemplatePick(){
        this.projectTemplateModel.close();
    }

    handleSelectProjectTemplate(value){
       this.handleCloseProjectTemplatePick();

        let project = value;

        let showConfirmationRequiredField = false;
        let orderRequest =  this.state.orderRequest;
        orderRequest.projectNo = value.code;

        ProjectService.getProjectDetailsHierarchy(value.code, this.state.ORDERTEMPLATE_CONSTANT).then((response)=>{
            let selectedProjectDetails = response.data;

            let confirmatonRequiredObject = ((selectedProjectDetails  && selectedProjectDetails.data)? selectedProjectDetails.data.confirmationRequired : null);

            if (confirmatonRequiredObject) {
                if (confirmatonRequiredObject.data.code == "1") {
                    orderRequest.confirmationRequired = true;
                    showConfirmationRequiredField= true;
                    this.state.hideConfirmationField = true;
                } else if (confirmatonRequiredObject.data.code == "0") {
                    orderRequest.confirmationRequired = false;
                    showConfirmationRequiredField= true;
                } else {
                    delete orderRequest.confirmationRequired;
                    showConfirmationRequiredField= false;
                }
            } else {
                showConfirmationRequiredField = false;
            }

            this.setState({project: project, selectedProjectDetails:selectedProjectDetails, orderRequest:orderRequest, showConfirmationRequiredField:showConfirmationRequiredField});
        }).catch((error) => {
            Notify.showError("Error Occured while loading the selected project details, please reload this page! "+ error);
        });

    }

    updateSubsidiary(value) {

        let state = _.cloneDeep(this.state);
        state.orderRequest.subsidiary = value;
        state.orderRequest.contract = null;
        state.orderRequest.quote = null;
        state.contracts = [];
        state.quotes = [];

        if (state.orderRequest.orderType.code == ORDER_TYPE_CONTRACTED.code) {
            this.setState(state, () => this.loadContracts(state.orderRequest.customerId, state.orderRequest.subsidiary));
        } else if (state.orderRequest.orderType.code == ORDER_TYPE_SPOT.code) {
            this.setState(state, () => this.loadQuotes(state.orderRequest.customerId));
        }
    }

    updateOrderType(value) {

        let state = _.cloneDeep(this.state);
        state.orderRequest.orderType = value;
        state.orderRequest.contract = null;
        state.orderRequest.quote = null;
        state.contracts = [];
        state.quotes = [];

        if (value.code == ORDER_TYPE_CONTRACTED.code) {
            state.orderRequest.readyAtDate = null;
            this.setState(state, () => this.loadContracts(state.orderRequest.customerId, state.orderRequest.subsidiary));
        } else if (value.code == ORDER_TYPE_SPOT.code) {
            state.orderRequest.confirmationRequired = true;
            this.setState(state, () => this.loadQuotes(state.orderRequest.customerId));
        }
    }

    updateQuote(value) {

        let state = _.cloneDeep(this.state);
        state.orderRequest.quote = value;

        if (value) {
            state.orderRequest.readyAtDate = value.readyDate;
        }

        this.setState(state);
    }

    handleDocumentsChange(documents){
        let orderRequest = _.cloneDeep(this.state.orderRequest);
        orderRequest.documents = documents;
        this.setState({orderRequest: orderRequest});
    }

    savePreOrder() {

        let orderRequest = _.cloneDeep(this.state.orderRequest);

        if (orderRequest.orderType.code == ORDER_TYPE_SPOT.code && orderRequest.quote) {
            orderRequest.offerNo = orderRequest.quote.number;
        }

        OrderRequestService.save(orderRequest).then((response)=>{
                this.updateState("documentName",response.data);
                Notify.showSuccess("Saved Successfully");
        }).catch((error) => {
            Notify.showError(error);
        });
    }

    retrieveProjectDetails(t) {
        if (this.state.project == null) {
            return null;
        }
        let project = this.state.project;

        return (<Grid>
                <GridCell width="1-3"><Span label="Name" value={project.name}/></GridCell>
                <GridCell width="2-3"><Span label="Description" value={project.description}/></GridCell>
            </Grid>
        );
    }

    retrieveContractDetails() {

        let contract = this.state.orderRequest.contract;

        if (!contract) {
            return null;
        }

        return (
            <Grid>
                <GridCell width="1-1"><Span label="Name" value={contract.name}/></GridCell>
            </Grid>
        );
    }

    retrieveProjectOrOrderSelectionElems() {
        if (!this.state.orderRequest.orderType) {
            return null;
        } else if (this.state.orderRequest.orderType.code == ORDER_TYPE_CONTRACTED.code) {
            return (
                <GridCell width="1-1">
                    <DropDown label="Contract"
                              parsley={this.state.parsley}
                              value={this.state.orderRequest.contract}
                              onchange={(val) => this.updateOrderRequestState("contract", val)}
                              required={true}
                              options={this.state.contracts}/>
                </GridCell>
            );
        } else if (this.state.orderRequest.orderType.code == ORDER_TYPE_SPOT.code) {
            return (
                <GridCell width="1-1">
                    <DropDown label="Quote"
                              parsley={this.state.parsley}
                              value={this.state.orderRequest.quote}
                              onchange={(val) => this.updateQuote(val)}
                              required={true}
                              options={this.state.quotes}/>
                </GridCell>
            );
        }
    }

    render() {
        return (
            <div>
               <PageHeader title="New Order Request"   translate={true} />
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        <div className="uk-float-right">
                            <Button id="save" label="Save" style="primary" waves = {true} onclick={() => this.savePreOrder()}/>
                        </div>
                    </GridCell>
                    <GridCell width="1-2">
                       <Card>
                           <Grid>
                               <GridCell width="1-1" noMargin={true}>
                                   <DropDown label="Customer" required={true}
                                             onchange={(value) => this.handleSelectCustomer(value)}
                                             value = {{id: this.state.orderRequest.customerId}}
                                             options={this.state.customers}/>
                               </GridCell>
                               <GridCell width="1-2">
                                   <DropDown label="Order Owner"
                                             value={this.state.orderRequest.subsidiary}
                                             onchange={(value) => this.updateSubsidiary(value)}
                                             options={this.state.subsidiaries}
                                             required={true}/>
                               </GridCell>
                               <GridCell width="1-2">
                                   <DropDown label="Project" required={false}
                                             uninitializedText = "Please select customer" emptyText = "No project"
                                             onchange={(value) => this.updateOrderRequestState("projectNo", value ? value.id : null)}
                                             value = {{id: this.state.orderRequest.projectNo}}
                                             options={this.state.projects}/>
                               </GridCell>
                               <GridCell width="1-1">
                                   <RadioGroup value={this.state.orderRequest.orderType}
                                               onchange={(value) => this.updateOrderType(value)}
                                               options={this.orderTypes}
                                               inline={true}/>
                               </GridCell>
                               {this.retrieveProjectOrOrderSelectionElems()}
                               <GridCell width="1-2">
                                   <Date label="Ready At Date"  onchange={(val)=> this.updateOrderRequestState("readyAtDate",val) }
                                             value={this.state.orderRequest.readyAtDate}/>
                               </GridCell>
                               <GridCell width="1-2" hidden={this.state.showConfirmationRequiredField === false}>
                                   <Grid>
                                       <GridCell width="1-1" noMargin="true"/>
                                       <GridCell width="1-1">
                                           <Checkbox id="value" label="Confirmation Required" checked={this.state.orderRequest.confirmationRequired}
                                                     onchange={(e)=>this.updateOrderRequestState("confirmationRequired",e)}
                                                     disabled={this.state.orderRequest.orderType.code == ORDER_TYPE_SPOT.code}/>
                                       </GridCell>
                                   </Grid>
                               </GridCell>
                           </Grid>
                        </Card>
                    </GridCell>
                    <GridCell width="1-2">
                        <DocumentList onchange = {(documents) => this.handleDocumentsChange(documents)}/>
                    </GridCell>
                </Grid>
            </div>
       );
    }
}