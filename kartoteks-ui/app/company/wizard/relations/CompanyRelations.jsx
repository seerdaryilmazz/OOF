import React from "react";
import _ from "lodash";
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader} from "susam-components/layout";
import {Notify, TextInput, Button, Span} from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';

import {CompanyRelation} from './CompanyRelation';
import {CompanyService} from '../../../services/KartoteksService';

export class CompanyRelations extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }
    initializeState(props){

    }
    componentDidMount(){
        this.initializeState(this.props);
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
    }
    handleEditRelation(value){
        this.setState({relationToEdit: value});
    }
    handleDeleteRelation(item){
        UIkit.modal.confirm("Are you sure?", () => this.props.ondelete && this.props.ondelete(item));

    }
    handleNewRelationClick(){
        this.setState({relationToEdit: {}});
    }

    next(){
        if(this.state.relationToEdit) {
            Notify.showError("Please save the relation you are editing");
            return false;
        }
        return true;
    }



    handleSave(relation){
        this.props.onsave && this.props.onsave(relation);
        this.clearState();
    }
    clearState(){
        this.setState({relationToEdit: null});
    }

    handleCancel(){
        this.clearState();
    }

    renderCompanyWebsite(){
        let companyWebsite = null;
        let absoluteWebsiteUrl = this.props.companyToEdit.website;
        if(absoluteWebsiteUrl){
            if(absoluteWebsiteUrl.length > 4 && absoluteWebsiteUrl.substr(0,4) != "http"){
                absoluteWebsiteUrl = "http://" + absoluteWebsiteUrl;
            }
            companyWebsite = <a className="md-btn md-btn-flat md-btn-flat-success md-btn-wave waves-effect waves-button"
                                style = {{textTransform: 'lowercase'}}
                                href = {absoluteWebsiteUrl} target="_blank">
                {this.props.companyToEdit.website}
            </a>;
        }
        return companyWebsite;
    }

    render(){
        let relationForm = null;
        let relations = null;
        let newButton = null;

        if(this.state.relationToEdit){
            relationForm = <CompanyRelation relation = {this.state.relationToEdit}
                                        ref = {(c) => this.form = c}
                                        onsave = {(relation) => this.handleSave(relation)}
                                        oncancel = {() => this.handleCancel()}/>;
        }else{
            newButton = <div className="uk-align-right">
                <Button label="New Relation" style="success" waves = {true} size="small" onclick = {() => this.handleNewRelationClick()} />
            </div>;
            let allRelations = [];
            if(!_.isEmpty(this.props.companyToEdit.activeRelations)){
                allRelations = allRelations.concat(this.props.companyToEdit.activeRelations)
            }
            if(!_.isEmpty(this.props.companyToEdit.passiveRelations)){
                allRelations = allRelations.concat(this.props.companyToEdit.passiveRelations)
            }
            relations = <Grid>
                <GridCell width="1-1">
                    <DataTable.Table data={allRelations} title="Relations"
                                     editable = {false} insertable = {false} filterable = {false} sortable = {true}>
                        <DataTable.Badge header="Status" width="5" sortable = {true} reader = {new NewStatusReader()}/>
                        <DataTable.Text header="Type" width="15" sortable = {true} reader = {new RelationReader()}/>
                        <DataTable.Text header="Company" width="15" sortable = {true} reader = {new CompanyReader()} />
                        <DataTable.ActionColumn width="10">
                            <DataTable.ActionWrapper key="edit" track="onclick" onaction = {(data) => this.handleEditRelation(data)}>
                                <Button label="edit" flat = {true} style="primary" size="small"/>
                            </DataTable.ActionWrapper>
                            <DataTable.ActionWrapper key="delete" track="onclick" onaction = {(data) => this.handleDeleteRelation(data)}>
                                <Button label="delete" flat = {true} style="danger" size="small"/>
                            </DataTable.ActionWrapper>
                        </DataTable.ActionColumn>
                    </DataTable.Table>
                </GridCell>
            </Grid>;

        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <Grid>
                        <GridCell width="1-2" noMargin = {true}>
                            <div className="uk-align-left">
                                {this.renderCompanyWebsite()}
                            </div>
                        </GridCell>
                        <GridCell width="1-2" noMargin = {true}>
                            {newButton}
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-1" noMargin = {true}>
                    {relationForm}
                </GridCell>
                <GridCell width="1-1">
                    {relations}
                </GridCell>
            </Grid>
        );
    }
}
class CompanyReader{

    readCellValue(row) {
        if(row.relationType.type === "HAS"){
            return row.passiveCompany.name;
        } else if(row.relationType.type === "IS"){
            return row.activeCompany.name;
        }
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }
}

class RelationReader{

    readCellValue(row) {
        if(row.relationType.type === "HAS"){
            return row.relationType.name;
        } else if(row.relationType.type === "IS"){
            return row.relationType.name;
        }
    }
    readSortValue(row) {
        return this.readCellValue(row);
    }
}

class NewStatusReader{
    readCellValue(row) {
        if(row._new){
            return {style: "success", text: "Merged"};
        }else{
            return {style: "outline", text: "Own"};
        }
    };

    readSortValue(row) {
        return row._new ? "MERGED" : "OWN";
    };
}