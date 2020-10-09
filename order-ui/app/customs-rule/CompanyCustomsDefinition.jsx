import * as axios from 'axios';
import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Card, Grid, GridCell, Modal, PageHeader } from 'susam-components/layout';
import { CompanySearchAutoComplete } from 'susam-components/oneorder';
import uuid from 'uuid';
import { Kartoteks, LocationService, OrderService, ProjectService } from "../services";
import { CustomsArrivalTRForm } from "./CustomsArrivalTRForm";
import { CustomsArrivalTRList } from "./CustomsArrivalTRList";
import { CustomsDepartureTRForm } from './CustomsDepartureTRForm';
import { CustomsDepartureTRList } from './CustomsDepartureTRList';
import { CustomsGenericForm } from "./CustomsGenericForm";
import { CustomsGenericList } from "./CustomsGenericList";


export class CompanyCustomsDefinition extends TranslatingComponent{
    state = {};

    componentDidMount(){
        this.loadLookupData();
    }
    loadLookupData(){
        let calls = [
            LocationService.listCustomsOffices(),
            OrderService.getCustomsOperationTypes()
        ]
        if(this.props.location.query.companyId){
            calls.push(Kartoteks.getCompanyDetails(this.props.location.query.companyId));
        }
        axios.all(calls).then(axios.spread((customsOffices, customsTypes, company) => {
            let state = _.cloneDeep(this.state);
            state.customsOffices = customsOffices.data;
            state.customsOfficesTR = _.filter(customsOffices.data, item => item.country.iso === "TR");
            state.customsTypes = customsTypes.data;
            if(company){
                state.company= {id: company.data.id, name: company.data.name, value: company.data.name};
                state.readOnly = true;
            }
            this.setState(state, ()=>{
                if(this.state.company){
                    this.handleSelectCompany(this.state.company)
                }
            });

        })).catch(error => Notify.showError(error));
    }
    handleSelectCompany(value){
        this.setState({company: value, countryOfCompany: null, consigneeDefinitions: [], senderDefinitions: []},
            () => this.loadCompanyDetails());
    }

    handleNewConsigneeDefinition(){
        this.setState({consigneeDefinition: this.createNewDefinition()}, () => this.consigneeModal.open());
    }
    handleNewSenderDefinition(){
        let senderDefinition = this.createNewDefinition();
        if(this.state.countryOfCompany !== "TR" ){
            if(_.find(this.state.senderDefinitions, i=>_.isEmpty(i.locations))){
                Notify.showError("Can not define new one when definion is exist for all location")
                return;
            }
            senderDefinition.option = {id: "ASK", code: "ASK", checked:true}
        }
        this.setState({senderDefinition: senderDefinition}, () => this.senderModal.open());
    }
    handleEditConsigneeDefinition(value){
        let consigneeDefinition = _.cloneDeep(value);
        consigneeDefinition._key = consigneeDefinition.id;
        this.setState({consigneeDefinition: consigneeDefinition}, () => this.consigneeModal.open());
    }
    handleEditSenderDefinition(value){
        let senderDefinition = _.cloneDeep(value);
        senderDefinition._key = senderDefinition.id;
        this.setState({senderDefinition: senderDefinition}, () => this.senderModal.open());
    }
    handleSaveConsigneeDefinition(){
        let consigneeDefinition = _.cloneDeep(this.state.consigneeDefinition);
        consigneeDefinition.forTR = this.state.countryOfCompany === "TR";
        ProjectService.saveConsigneeCustoms(consigneeDefinition).then(response => {
            this.consigneeModal.close();
            Notify.showSuccess("Consignee definition is saved");
            this.setState({consigneeDefinition: null}, () => {
                this.loadConsigneeTemplates();
            });

        }).catch(error => Notify.showError(error));
    }
    handleSaveSenderDefinition(){
        if(this.state.countryOfCompany !== "TR"){
            if(_.isEmpty(this.state.senderDefinition.locations) && !_.isEmpty(this.state.senderDefinitions.filter(i=>i.id !== this.state.senderDefinition.id))){
                Notify.showError("Can not define for all location when definition is exist for spesific location")
                return;
            }
            
            let existedDefinition = _.find(this.state.senderDefinitions, j=>!_.isEmpty(j.locations.filter(i=>_.find(this.state.senderDefinition.locations, d=>_.isEqualWith(i.location.id, d.location.id)))));
            if(existedDefinition && !_.isEqual(existedDefinition.id, this.state.senderDefinition.id)){
                Notify.showError(`${existedDefinition.locations.flatMap(i=>i.location.name).join(",")} named location is defined before`);
                return;
            }
        }
        let senderDefinition = _.cloneDeep(this.state.senderDefinition);
        senderDefinition.forTR = this.state.countryOfCompany === "TR";
        if(senderDefinition.option && senderDefinition.option.code === "NEVER"){
            senderDefinition.outputList = [];
        }
        ProjectService.saveSenderCustoms(senderDefinition).then(response => {
            this.senderModal.close();
            Notify.showSuccess("Sender definition is saved");
            this.setState({senderDefinition: null}, () => {
                this.loadSenderTemplates();
            });

        }).catch(error => Notify.showError(error));
    }
    handleDeleteConsigneeDefinition(consigneeDefinition){
        Notify.confirm("Are you sure?", () => {
            ProjectService.deleteConsigneeCustoms(consigneeDefinition).then(response => {
                Notify.showSuccess("Consignee definition is deleted");
                this.loadConsigneeTemplates();
            }).catch(error => Notify.showError(error));
        });

    }
    handleDeleteSenderDefinition(senderDefinition){
        Notify.confirm("Are you sure?", () => {
            ProjectService.deleteSenderCustoms(senderDefinition).then(response => {
                Notify.showSuccess("Sender definition is deleted");
                this.loadSenderTemplates();
            }).catch(error => Notify.showError(error));
        });
    }

    createNewDefinition(){
        return {
            _key: uuid.v4(),
            locations: [],
            company: this.state.company,
            outputList: []
        }
    }
    loadConsigneeTemplates(){
        ProjectService.getConsigneeCustomsForCompany(this.state.company.id).then(response => {
            let consigneeDefinitions = response.data;
            consigneeDefinitions.forEach(item => {
                item._key = item.id;
                item.outputList.forEach(output => output._key = uuid.v4());
            });
            this.setState({consigneeDefinitions: consigneeDefinitions});
        });
    }

    loadSenderTemplates(){
        ProjectService.getSenderCustomsForCompany(this.state.company.id).then(response => {
            let senderDefinitions = response.data;
            senderDefinitions.forEach(item => {
                item._key = item.id;
                item.outputList.forEach(output => output._key = uuid.v4());
            });
            this.setState({senderDefinitions: senderDefinitions});
        }).catch(error => Notify.showError(error));
    }

    loadCompanyDetails(){
        Kartoteks.getCompanyDetails(this.state.company.id).then(response => {
            this.setState({countryOfCompany: response.data.country.iso}, () => {
                this.loadConsigneeTemplates();
                this.loadSenderTemplates();
            });
        }).catch(error => Notify.showError(error));
    }

    handleChangeConsigneeDefinition(value){
        this.setState({consigneeDefinition: value});
    }
    handleChangeSenderDefinition(value){
        this.setState({senderDefinition: value});
    }

    render(){
        let partyType = this.props.location.query.party;
        let consigneeList = <CustomsGenericList data = {this.state.consigneeDefinitions} isSender = {false}
                                                onCreateNew = {() => this.handleNewConsigneeDefinition()}
                                                onEdit = {(value) => this.handleEditConsigneeDefinition(value)}
                                                onDelete = {(value) => this.handleDeleteConsigneeDefinition(value)}/>;
        let consigneeOutputList = <CustomsGenericForm data = {this.state.consigneeDefinition} isSender = {false}
                                                      onChange = {(value) => this.handleChangeConsigneeDefinition(value)} />;
        let senderList = <CustomsGenericList data = {this.state.senderDefinitions} isSender = {true}
                                             onCreateNew = {() => this.handleNewSenderDefinition()}
                                             onEdit = {(value) => this.handleEditSenderDefinition(value)}
                                             onDelete = {(value) => this.handleDeleteSenderDefinition(value)}/>;
        let senderOutputList = <CustomsGenericForm data = {this.state.senderDefinition} isSender = {true}
                                                   onChange = {(value) => this.handleChangeSenderDefinition(value)} />;
        if(this.state.countryOfCompany === "TR"){
            consigneeList = <CustomsArrivalTRList data = {this.state.consigneeDefinitions}
                                                  onCreateNew = {() => this.handleNewConsigneeDefinition()}
                                                  onEdit = {(value) => this.handleEditConsigneeDefinition(value)}
                                                  onDelete = {(value) => this.handleDeleteConsigneeDefinition(value)}/>;
            consigneeOutputList = <CustomsArrivalTRForm data = {this.state.consigneeDefinition}
                                                        customsOffices = {this.state.customsOfficesTR}
                                                        customsTypes = {this.state.customsTypes}
                                                        onChange = {(value) => this.handleChangeConsigneeDefinition(value)}/>;
            senderList = <CustomsDepartureTRList data = {this.state.senderDefinitions}
                                                 onCreateNew = {() => this.handleNewSenderDefinition()}
                                                 onEdit = {(value) => this.handleEditSenderDefinition(value)}
                                                 onDelete = {(value) => this.handleDeleteSenderDefinition(value)}/>;
            senderOutputList = <CustomsDepartureTRForm data = {this.state.senderDefinition}
                                                       customsOffices = {this.state.customsOfficesTR}
                                                       onChange = {(value) => this.handleChangeSenderDefinition(value)}/>;
        }
        return(
            <div>
                <PageHeader title="Company Customs Definition"  translate={true} />
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-3">
                                    <CompanySearchAutoComplete  label = "Company" value = {this.state.company}
                                                                readOnly = {this.state.readOnly}
                                                                onchange = {(value) => this.handleSelectCompany(value)} />
                                </GridCell>
                                {!partyType || "consignee"===partyType 
                                ?<GridCell width="1-1">
                                    {consigneeList}
                                 </GridCell> : null}
                                {!partyType || "sender"===partyType 
                                ?<GridCell width="1-1">
                                    {senderList}
                                </GridCell> : null}
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
                <Modal title="Sender Definition" ref = {(c) => this.senderModal = c} large = {true}
                       actions = {[{label:"Close", action:() => this.senderModal.close()},
                           {label:"save", buttonStyle:"primary", action:() => this.handleSaveSenderDefinition()}]}>
                    {senderOutputList}
                </Modal>
                <Modal title="Consignee Definition" ref = {(c) => this.consigneeModal = c} large = {true}
                       actions = {[{label:"Close", action:() => this.consigneeModal.close()},
                           {label:"save", buttonStyle:"primary", action:() => this.handleSaveConsigneeDefinition()}]}>
                    {consigneeOutputList}
                </Modal>
            </div>
        );
    }
}

