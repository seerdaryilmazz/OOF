import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import * as Constants from "../common/Constants";
import { Grid, GridCell, LoaderWrapper, Modal, Pagination } from "susam-components/layout";
import { CrmAccountService } from '../services/CrmAccountService'
import { CrmQuoteService } from "../services";

export class PotentialSummaryInfo extends TranslatingComponent {

    static defaultProps = {
        potentials:[]
    };

    constructor(props) {
        super(props);
        this.state={
         
        };
    }

    handleAddPotentialClick(value){
        console.log(value)
        this.props.onadd && this.props.onadd(value);

    }

    handleIgnorePotentialClick(value){
        UIkit.modal.confirm("Are you sure?", () => this.props.onignore && this.props.onignore(value));
    }


    render(){

        let actions = [];
        let createdByColumn = null;
        let createdAtColumn = null;
        createdByColumn = <DataTable.Text field="createdBy" header="Created By" width="5" printer={new UserPrinter(this.context.getAllUsers())}/>;
        createdAtColumn = <DataTable.Text field="createdAt" header="Created At" width="10" />;
        if(this.props.showAddButton) {
            actions.push(
                <DataTable.ActionWrapper key="add" track="onclick" onaction={(data) => this.handleAddPotentialClick(data)}>
                    <Button label="add" flat={true} style="primary" size="small"/>
                </DataTable.ActionWrapper>
            );
        }
        if(this.props.showIgnoreButton){
            actions.push(
                <DataTable.ActionWrapper key="ignore" track="onclick" onaction = {(data) => this.handleIgnorePotentialClick(data)}>
                    <Button label="ignore" flat = {true} style="danger" size="small"/>
                </DataTable.ActionWrapper>
            );
        }
        return (
            <Grid noMargin={true}>
                <GridCell width="1-1">
                    <DataTable.Table data={this.props.potentials}>
                        <DataTable.Text field="fromCountry.name" header="From Country" width="10" printer={new TruncatePrinter(this)}/>
                        <DataTable.Text field="fromPoint" header="From Postal" width="10" printer={new TruncatePrinter(this,"name")}/>
                        <DataTable.Text field="toCountry.name" header="To Country" width="10" printer={new TruncatePrinter(this)}/>
                        <DataTable.Text field="toPoint" header="To Postal" width="10" printer={new TruncatePrinter(this,"name")}/>
                        <DataTable.Text field="loadWeightType.name" header="Load Type" width="10" translator={this}/>
                        <DataTable.Text field="shipmentLoadingTypes" header="FTL/LTL" width="10" printer={new ArrayPrinter("shipmentLoadingTypes", true)}/>
                        <DataTable.Text field="frequencyType.name" header="Frequency Type" width="10" translator={this}/>
                        <DataTable.Text field="frequency" header="Frequency" width="10" />
                        <DataTable.Badge field="status" header="Type" width="5" printer={new StatusPrinter(this,this)}/>
                        {createdByColumn}
                        {createdAtColumn}
                        <DataTable.ActionColumn width="10">
                                {actions}
                            </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        
        );
    }
}

PotentialSummaryInfo.contextTypes = {
    getUsers: React.PropTypes.func,
    getAllUsers: React.PropTypes.func,
    router: React.PropTypes.object.isRequired,
    translator: React.PropTypes.object
};

class UserPrinter{
    constructor(userList){
        this.userList = userList;
    }

    print(data){
        return _.get(_.find(this.userList, u=>u.username == data),'displayName');
    }   
}

class ArrayPrinter {
    constructor(field, multipleLine) {
        this.field = field;
        this.multipleLine = multipleLine;
    }
    printUsingRow(row, data) {
        let array = _.get(row, this.field);
        if(array){
            let arrayInternal = this.field === "customsOffices" ? array.map(item => item.office) : array;
            if (this.multipleLine === true) {
                return ArrayPrinter.convertToMultipleLineColumnValue(arrayInternal);
            } else {
                let names = arrayInternal.map(item => item.name);
                return _.join(names, ", ");
            }
        }
    }
    static convertToMultipleLineColumnValue(array) {
        return array.map(item => <div key={item.id}>{ArrayPrinter.truncatedValue(item.name)}<br/></div>);
    }

    static truncatedValue(value){
        if(value && value.length > 15){
            value = value.substring(0, 15) + "..";
        }
        return value;
    }
}


class StatusPrinter {
    constructor(callingComponent, translator) {
        this.callingComponent = callingComponent;
        this.translator = translator;
    }
    translate(text){
        return this.translator ? this.translator.translate(text) : text;
    }
    print(data){
        let className = data.code === 'ACTIVE' ? "success" : "danger";
        return <span className={`uk-badge uk-badge-${className}`}>{this.translate(data.name)}</span>
    }
}

class TruncatePrinter {
    constructor(translator, path, onclick) {
        this.translator = translator;
        this.path = path;
    }
    translate(text) {
        return this.translator ? this.translator.translate(text) : text;
    }
    print(data) {
        let value = null;
        if (_.isArray(data)) {
            value = _.orderBy(data.map(i => this.translate(_.get(i, this.path)))).join(',');
        } else if (this.path) {
            value = this.translate(_.get(data, this.path));
        } else {
            value = this.translate(data);
        }

        let truncatedValue = this.truncatedValue(value);
      
        return <span>{_.isNil(data)? "-" : _.isEmpty(data) ? this.translate("ALL") : truncatedValue}</span>;
    }
    truncatedValue(value) {
        if (value && value.length > 12) {
            value = value.substring(0, 12) + "..";
        }
        return value;
    }
}