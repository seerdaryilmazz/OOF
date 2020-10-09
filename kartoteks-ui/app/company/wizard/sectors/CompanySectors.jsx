import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { ActionHeader, Card, Grid, GridCell } from "susam-components/layout";
import uuid from "uuid";
import { CompanyService } from '../../../services/KartoteksService';
import { CompanySector } from './CompanySector';

export class CompanySectors extends TranslatingComponent {
    constructor(props){
        super(props);
        this.state = {};
    }
    initializeState(props){

    }

    componentDidUpdate(prevProps, prevState){
        if(!_.isEqual(this.state.sectorToEdit, prevState.sectorToEdit)){
            this.props.onRenderInnerView && this.props.onRenderInnerView(!_.isNil(this.state.sectorToEdit));
        }
    }

    componentDidMount(){
        this.initializeState(this.props);
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
    }
    handleEditSector(value){
        this.setState({sectorToEdit: value});
    }
    handleDeleteSector(item){
        UIkit.modal.confirm("Are you sure?", () => this.props.ondelete && this.props.ondelete(item));
    }
    handleNewSectorClick(){
        this.setState({sectorToEdit: {_key: uuid.v4(), sector:{}}});
    }


    next(){
        return new Promise(
            (resolve, reject) => {
                if(!this.validate()){
                    reject();
                    return;
                }
                this.setState({busy: true});
                CompanyService.validateSectors(this.props.companyToEdit.sectors).then(response => {
                    this.setState({busy: false});
                    resolve(true);
                }).catch(error => {
                    Notify.showError(error);
                    this.setState({busy: false});
                    reject();
                });
            }
        );
    }

    validate(){
        if(this.state.sectorToEdit) {
            Notify.showError("Please save the sector you are editing");
            return false;
        }
        if(!this.props.companyToEdit.sectors || this.props.companyToEdit.sectors.length == 0){
            Notify.showError("Please add at least one sector");
            return false;
        }
        return true;
    }

    handleSave(sector){
        this.props.onsave && this.props.onsave(sector);
        this.clearState();
    }
    clearState(){
        this.setState({sectorToEdit: null});
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

    getActionHeaderTools() {
        let actionHeaderTools = [];
        
            actionHeaderTools.push({title: "New Sector",  items: [{label: "", onclick: () => this.handleNewSectorClick()}]} );
        
        return actionHeaderTools;
    }

    render(){
        let sectorForm = null;
        let sectorDatatable = null;
     
        if(this.state.sectorToEdit){
            sectorForm = <CompanySector sector = {this.state.sectorToEdit}
                                          ref = {(c) => this.form = c}
                                          onsave = {(sector) => this.handleSave(sector)}
                                          oncancel = {() => this.handleCancel()}/>;
        }else{

            sectorDatatable = <Grid>
                        <GridCell width="1-1">
                        <ActionHeader title="Sectors" tools={this.getActionHeaderTools()} removeTopMargin={true} /> 
                            <DataTable.Table data={this.props.companyToEdit.sectors}
                                             editable = {false} insertable = {false} filterable = {false} sortable = {true}>
                                <DataTable.Badge header="Status" width="5" sortable = {true} reader = {new NewStatusReader()}/>
                                <DataTable.Text header="Parent Sector" translator={this} field="sector.parent.name" width="15" sortable = {true} />
                                <DataTable.Text header="Sub Sector" translator={this} field="sector.name" width="15" sortable = {true}/>
                                <DataTable.Bool header="Default" field="default" width="15" sortable = {true}/>

                                <DataTable.ActionColumn width="1">
                                    <DataTable.ActionWrapper key="edit" track="onclick" onaction = {(data) => this.handleEditSector(data)}>
                                        <Button icon="pencil" size="small" tooltip="edit"/>
                                    </DataTable.ActionWrapper>
                                    <DataTable.ActionWrapper key="delete" track="onclick" onaction = {(data) => this.handleDeleteSector(data)}>
                                        <Button icon="close" size="small" tooltip="delete"/>
                                    </DataTable.ActionWrapper>
                                </DataTable.ActionColumn>
                            </DataTable.Table>
                        </GridCell>
                    </Grid>;
        }

        return (
            <Card style={{backgroundColor:"white"}}>
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        {sectorForm}
                    </GridCell>
                    <GridCell >

                        {sectorDatatable}
                    </GridCell>
                </Grid>
            </Card>
        );
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
CompanySectors.contextTypes = {
    translator: PropTypes.object
};
