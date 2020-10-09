import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, Loader, CardHeader} from "susam-components/layout";
import {Notify, TextInput, Button, Form, DropDown, Span} from 'susam-components/basic';
import {MultipleCompanyLocationSelector} from 'susam-components/oneorder';
import {NumericInput} from 'susam-components/advanced';
import * as DataTable from 'susam-components/datatable';

import {SenderRuleHSCodes} from './SenderRuleHSCodes';
import {SenderRulesConsignees} from './SenderRulesConsignees';

import {CommonService, SenderRuleService} from '../../services';

export class SenderRuleForm extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = this.initialState();
    }

    componentDidMount(){
        this.initialize(this.props);
        this.initializeLookups();
    }

    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    initialState(){
        return {rule: {}, errors:{}};
    }

    initialize(props){
        if(props.ruleSet && props.ruleSet.rules){
            props.ruleSet.rules.forEach(rule => {
                rule._key = rule._key || uuid.v4();
            });
        }

        if(this.ruleSetId != props.ruleSet.id){
            this.setState(this.initialState());
        }
        this.ruleSetId = props.ruleSet.id;

    }


    initializeLookups(){
        CommonService.retrievePackageGroups().then(response => {
            let state = _.cloneDeep(this.state);
            state.packageGroups = response.data;
            this.setState(state);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    updateRuleState(key, value){
        let rule = _.cloneDeep(this.state.rule);
        rule[key] = value;
        this.setState({rule: rule});
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handlePackageGroupSelect(value){
        this.updateRuleState("packageGroup", value);
        if(!value){
            this.updateState("packageTypes", null);
            return;
        }
        this.getPackageTypes(value);
    }

    getPackageTypes(group){
        CommonService.retrievePackageTypes(group).then(response => {
            this.updateState("packageTypes", response.data);
        }).catch(error => {
            Notify.showError(error);
        });
    }

    validate(){

        if(!this.state.rule.loadingPlaces || this.state.rule.loadingPlaces.length == 0) {
           Notify.showError("At least one Loading Location & Company must be selected.");
           return;
        }

        let packageValid = this.packageForm.validate();
        let measuresValid = this.measurementsForm.validate();
        if(!(packageValid && measuresValid)){
            return false;
        }
        let valid = true;
        let errors = {};
        if(parseInt(this.state.rule.minWidth) > parseInt(this.state.rule.maxWidth)){
            errors.minWidth = [{code: "minWidth", message: "Must be smaller than or equal to max"}];
            errors.maxWidth = [{code: "maxWidth", message: "Must be greater than or equal to min"}];
            valid = false;
        }
        if(parseInt(this.state.rule.minLength) > parseInt(this.state.rule.maxLength)){
            errors.minLength = [{code: "minLength", message: "Must be smaller than or equal to max"}];
            errors.maxLength = [{code: "maxLength", message: "Must be greater than or equal to min"}];
            valid = false;
        }
        if(parseInt(this.state.rule.minHeight) > parseInt(this.state.rule.maxHeight)){
            errors.minHeight = [{code: "minHeight", message: "Must be smaller than or equal to max"}];
            errors.maxHeight = [{code: "maxHeight", message: "Must be greater than or equal to min"}];
            valid = false;
        }
        if(parseInt(this.state.rule.minGrossWeight) > parseInt(this.state.rule.maxGrossWeight)){
            errors.minGrossWeight = [{code: "minGrossWeight", message: "Must be smaller than or equal to max"}];
            errors.maxGrossWeight = [{code: "maxGrossWeight", message: "Must be greater than or equal to min"}];
            valid = false;
        }

        this.setState({errors: errors});

        return valid;
    }

    handleSaveRuleClick(){
        if(!this.validate()){
            return;
        }

        let rules = _.cloneDeep(this.props.ruleSet.rules);
        let rule = _.cloneDeep(this.state.rule);
        if(!rules){
            rules = [];
        }
        if(rule._key){
            let index = _.findIndex(rules, {_key: rule._key});
            if(index != -1){
                rules[index] = rule;
            }
            this.setState(this.initialState());
        }else{
            rule._key = uuid.v4();
            rules.push(rule);
        }
        this.props.onchange && this.props.onchange(rules);
    }

    handleCancelEditClick(){
        this.setState({rule: {}});
    }

    handleEditClick(item){
        this.loadHsCodes(item);
        item.packageGroup = _.find(this.state.packageGroups, {code: item.packageGroup.code});
        this.getPackageTypes(item.packageGroup);
        this.setState({rule: item});
    }

    handleDeleteClick(item){
        Notify.confirm("Are you sure you want to delete?", () => this.deleteRule(item));
    }
    deleteRule(item){
        let rules = _.cloneDeep(this.props.ruleSet.rules);
        _.remove(rules, {_key: item._key});
        this.props.onchange && this.props.onchange(rules);
    }
    loadHsCodes(rule){
        if(!(rule.hsCodes && rule.hsCodes.length > 0)){
            return;
        }
        let calls = [];
        rule.hsCodes.forEach(item => {
            if(!item.data){
                calls.push(CommonService.getHSCode(item.code));
            }
        });
        if(calls.length > 0){
            axios.all(calls).then(axios.spread((...responses) => {
                let selectedRule = _.cloneDeep(this.state.rule);
                selectedRule.hsCodes = responses.map(response => {
                    let parent1 = response.data.parents && response.data.parents.length > 0 ? response.data.parents[0] : "";
                    let parent2 = response.data.parents && response.data.parents.length > 1 ? response.data.parents[1] : "";
                    return {id: response.data.id, name: response.data.name, code: response.data.code, parent1: parent1, parent2: parent2, data: response.data}
                });
                this.setState({rule: selectedRule});
            })).catch((error) => {
                Notify.showError(error);
            });
        }
    }


    render(){
        let noBorder = {borderBottom: "none"};

        let saveButton = <Button label="add" style="success" waves = {true} onclick = {() => this.handleSaveRuleClick()}  />;
        if(this.state.rule && this.state.rule._key){
            saveButton = <Button label="save" style="success" waves = {true} onclick = {() => this.handleSaveRuleClick()}  />;
        }
        let cancelButton = "";
        if(this.state.rule && this.state.rule._key){
            cancelButton = <Button label="cancel" waves = {true} onclick = {() => this.handleCancelEditClick()}  />;
        }
        return(

            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Package Rules" />
                </GridCell>
                <GridCell width="1-1">
                    <span className="uk-text-large uk-text-bold uk-text-primary">
                        {super.translate("Criterias")}
                    </span>
                </GridCell>
                <GridCell width="1-1">
                    <MultipleCompanyLocationSelector inline={true} companyLabel="Loading Company" locationLabel="Loading Location"
                                                     company={this.props.ruleSet.sender }
                                                     data={this.state.rule.loadingPlaces}
                                                     onUpdate={(data) => {this.updateRuleState("loadingPlaces", data)}}>
                    </MultipleCompanyLocationSelector>
                </GridCell>
                <GridCell width="1-1">
                    <SenderRulesConsignees data = {this.state.rule.consignees}
                                           ruleSetId = {this.props.ruleSet.id}
                                           onchange = {(value) => this.updateRuleState("consignees", value)}/>

                </GridCell>
                <GridCell width="1-1">
                    <SenderRuleHSCodes data = {this.state.rule.hsCodes}
                                       ruleSetId = {this.props.ruleSet.id}
                                       onchange = {(value) => this.updateRuleState("hsCodes", value)}/>

                </GridCell>
                <GridCell width="1-1">
                </GridCell>
                <GridCell width="1-1">
                    <span className="uk-text-large uk-text-bold uk-text-primary">
                        {super.translate("Package Details")}
                    </span>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.packageForm = c}>
                        <Grid>
                            <GridCell width="1-2">
                                <DropDown label="Package Group" valueField="code"
                                          options = {this.state.packageGroups}
                                          value = {this.state.rule.packageGroup}
                                          onchange = {(value) => this.handlePackageGroupSelect(value)}
                                          required = {true}/>
                            </GridCell>
                            <GridCell width="1-2">
                                <DropDown label="Package Type" valueField="code"
                                          options = {this.state.packageTypes}
                                          value = {this.state.rule.packageType}
                                          uninitializedText="Select package group"
                                          onchange = {(value) => this.updateRuleState("packageType", value)}
                                          required = {true}/>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.measurementsForm = c}>
                        <Grid>
                            <GridCell width="1-2">
                                <Grid>
                                    <GridCell width="1-1">
                                        <Span label={super.translate("Length")} />
                                    </GridCell>
                                    <GridCell width="1-2" noMargin = {true}>
                                        <NumericInput label="Min" value = {this.state.rule.minLength}
                                                      required={true} digits="2" unit="cm." digitsOptional = {true}
                                                      onchange = {(value) => this.updateRuleState("minLength", value)}
                                                      errors = {this.state.errors.minLength}/>
                                    </GridCell>
                                    <GridCell width="1-2" noMargin = {true}>
                                        <NumericInput label="Max" value = {this.state.rule.maxLength}
                                                      required={true} digits="2" unit="cm." digitsOptional = {true}
                                                      onchange = {(value) => this.updateRuleState("maxLength", value)}
                                                      errors = {this.state.errors.maxLength}/>
                                    </GridCell>
                                    <GridCell width="1-1">
                                        <Span label={super.translate("Width")} />
                                    </GridCell>
                                    <GridCell width="1-2" noMargin = {true}>
                                        <NumericInput label="Min" value = {this.state.rule.minWidth}
                                                      required={true} digits="2" unit="cm." digitsOptional = {true}
                                                      onchange = {(value) => this.updateRuleState("minWidth", value)}
                                                      errors = {this.state.errors.minWidth}/>
                                    </GridCell>
                                    <GridCell width="1-2" noMargin = {true}>
                                        <NumericInput label="Max" value = {this.state.rule.maxWidth}
                                                      required={true} digits="2" unit="cm." digitsOptional = {true}
                                                      onchange = {(value) => this.updateRuleState("maxWidth", value)}
                                                      errors = {this.state.errors.maxWidth}/>
                                    </GridCell>
                                    <GridCell width="1-1">
                                        <Span label={super.translate("Height")} />
                                    </GridCell>
                                    <GridCell width="1-2" noMargin = {true}>
                                        <NumericInput label="Min" value = {this.state.rule.minHeight}
                                                      required={true} digits="2" unit="cm." digitsOptional = {true}
                                                      onchange = {(value) => this.updateRuleState("minHeight", value)}
                                                      errors = {this.state.errors.minHeight}/>
                                    </GridCell>
                                    <GridCell width="1-2" noMargin = {true}>
                                        <NumericInput label="Max" value = {this.state.rule.maxHeight}
                                                      required={true} digits="2" unit="cm." digitsOptional = {true}
                                                      onchange = {(value) => this.updateRuleState("maxHeight", value)}
                                                      errors = {this.state.errors.maxHeight}/>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                            <GridCell width="1-2">
                                <Grid>
                                    <GridCell width="1-1" noMargin = {true}>
                                        <Grid>
                                            <GridCell width="1-1">
                                                <Span label={super.translate("GW Per Package")} />
                                            </GridCell>
                                            <GridCell width="1-2" noMargin = {true}>
                                                <NumericInput label="Min" value = {this.state.rule.minGrossWeight}
                                                              digits="2" unit="kg." digitsOptional = {true}
                                                              onchange = {(value) => this.updateRuleState("minGrossWeight", value)}
                                                              errors = {this.state.errors.minGrossWeight}/>
                                            </GridCell>
                                            <GridCell width="1-2" noMargin = {true}>
                                                <NumericInput label="Max" value = {this.state.rule.maxGrossWeight}
                                                              digits="2" unit="kg." digitsOptional = {true}
                                                              onchange = {(value) => this.updateRuleState("maxGrossWeight", value)}
                                                              errors = {this.state.errors.maxGrossWeight}/>
                                            </GridCell>
                                        </Grid>
                                    </GridCell>
                                    <GridCell width="1-1">
                                        <NumericInput label="Stackability" value = {this.state.rule.stackability}
                                                      required={true} digits="0" digitsOptional = {true}
                                                      onchange = {(value) => this.updateRuleState("stackability", value)}/>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>


                <GridCell width="1-1">
                    <div className="uk-align-left">
                        {cancelButton}
                    </div>
                    <div className="uk-align-right">
                        {saveButton}
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.ruleSet.rules} title="Rules"
                                     editable = {false} insertable = {false} deletable = {false}
                                     filterable = {false} sortable = {true}>

                        <DataTable.Text header="Loading Company&Location" width="10" reader = {new LoadingCompanyLocationReader()} printer = {new LoadingCompanyLocationPrinter()} />
                        <DataTable.Text header="Consignees" width="10" reader = {new ConsigneeReader()} printer = {new ConsigneePrinter()} />
                        <DataTable.Text header="HS Codes" width="10" reader = {new HSCodeReader()} printer = {new HSCodePrinter()}/>
                        <DataTable.Text header="Package" width="10" reader = {new ConcatReader(["packageGroup.name", "packageType.name"])}/>
                        <DataTable.Text header="Length" width="10" reader = {new RangeReader(["minLength", "maxLength"], "cm.")}  />
                        <DataTable.Text header="Width" width="10" reader = {new RangeReader(["minWidth", "maxWidth"], "cm.")} />
                        <DataTable.Text header="Height" width="10" reader = {new RangeReader(["minHeight", "maxHeight"], "cm.")} />
                        <DataTable.Text header="Gross Weight" width="10" reader = {new RangeReader(["minGrossWeight", "maxGrossWeight"], "kg.")} />
                        <DataTable.Text header="Stackability" width="10" field="stackability" />

                        <DataTable.ActionColumn >
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleEditClick(data)}}>
                                <Button label="Edit" flat={true} style="success" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper track="onclick" onaction={(data) => {this.handleDeleteClick(data)}}>
                                <Button label="Delete" flat={true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>

        );
    }

}



class LoadingCompanyLocationReader{
    readCellValue(row) {
        return row.loadingPlaces;
    }
    readSortValue(row) {
        if(!(row.loadingPlaces && row.loadingPlaces.length > 0)){
            return "";
        }
        return row.loadingPlaces[0].company.name;
    }

}
class LoadingCompanyLocationPrinter {
    print(data) {
        if (!(data && data.length > 0)) {
            return "";
        }
        return <ul style={{listStyleType: "none"}}>{data.map(item =>
            <li key={item.company.id + item.location.id}>{item.company.name + ", " + item.location.name}</li>)
        }</ul>;
    }
}

class HSCodeReader{
    readCellValue(row) {
        return row.hsCodes;
    }
    readSortValue(row) {
        if(!(row.hsCodes && row.hsCodes.length > 0)){
            return "";
        }
        return row.hsCodes[0].name;
    }

}
class HSCodePrinter{
    print(data) {
        if(!(data && data.length > 0)){
            return "";
        }
        return <ul style = {{listStyleType: "none"}}>{data.map(item => <li key={item.code}>{item.code}</li>)}</ul>;
    }

}

class ConsigneeReader{
    readCellValue(row) {
        return row.consignees;
    }
    readSortValue(row) {
        if(!(row.consignees && row.consignees.length > 0)){
            return "";
        }
        return row.consignees[0].name;
    }

}
class ConsigneePrinter {
    print(data) {
        if (!(data && data.length > 0)) {
            return "";
        }
        return <ul style={{listStyleType: "none"}}>{data.map(item => <li key={item.id}>{item.name}</li>)}</ul>;
    }
}


class ConcatReader{
    constructor(fields){
        this.fields = fields;
    }
    readCellValue(row) {
        let value = "";
        if(this.fields){
            value = this.fields.map(item => _.get(row, item)).join(" ");
        }
        return value;
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }
}

class RangeReader{
    constructor(fields, unit){
        this.fields = fields;
        this.unit = unit;
    }
    readCellValue(row) {
        let value = "";
        if(this.fields){
            let valArr = this.fields.map(item => _.get(row, item));

            if(!valArr || valArr.length == 0) {
                return "-";
            } else if (valArr.every(v => !v)) {
                return "-";
            }

            if(valArr.length > 1 && valArr.every(v => v == valArr[0])) {
                value = valArr[0];
            } else {
                value = valArr.join("-");
            }        }
        return value + " " + this.unit;
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }



}