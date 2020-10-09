import _ from "lodash";
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell } from "susam-components/layout";
import uuid from "uuid";
import { CompanyService } from "../services";
import { ActionHeader } from '../utils';
import { CompanySector } from './CompanySector';



export class CompanySectorList extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }


    componentDidMount(){
        if((this.props.company || {}).id){
            this.retrieveCompanySectors(this.props.company.id);
        }
    }

    componentWillReceiveProps(nexProps){
        if(nexProps.company && nexProps.company.id){
            if((this.props.company || {}).id !== nexProps.company.id){
                this.retrieveCompanySectors(nexProps.company.id);
            }
        }
    }

    handleEditSector(value){
        this.setState({sectorToEdit: value});
    }

    handleNewSectorClick(){
        this.setState({sectorToEdit: {_key: uuid.v4(), sector:{}}});
    }


    retrieveCompanySectors(companyId){
        this.setState({busy: true});
        CompanyService.getCompanySectors(companyId).then(response => {
            let sectors = response.data;
            sectors.forEach(sector => sector._key = sector.id ? sector.id : uuid.v4());
            this.setState({sectors: sectors, sectorsOriginal: sectors, readOnly: false, busy: false});
        }).catch(error => {
            this.setState({busy: false});
            Notify.showError(error);
        });
    }

    handleSave(){
        if(this.state.sectorToEdit) {
            Notify.showError("Please save the sector you are editing");
            return false;
        }
        if(!this.state.sectors || this.state.sectors.length == 0){
            Notify.showError("Please add at least one sector");
            return false;
        }

        this.setState({busy: true});
        CompanyService.validateSectors(this.state.sectors).then(() => {
            CompanyService.updateSectors(this.props.company.id, this.state.sectors).then(response => {
                let defaultSector = _.find(response.data, {default: true}) || {};
                this.setState({sectorsOriginal: this.state.sectors, readOnly:false, busy: false}, ()=> this.props.onSave(defaultSector))
            }).catch(error => {
                Notify.showError(error);
                this.setState({busy: false});
            });
        }).catch(error => {
            Notify.showError(error);
            this.setState({busy: false});
        });
    }

    handleClose(){
        this.setState({sectors: this.state.sectorsOriginal, readOnly:false}, ()=> this.props.onClose())
    }

    handleCancel(){
        this.setState({sectorToEdit: null});
    }

    handleAddOrEditCompanySector(sector){
        let sectors = _.cloneDeep(this.state.sectors);
        let index = _.findIndex(sectors, {_key: sector._key});
        if(index != -1){
            sectors[index] = sector;
        }else{
            sectors.push(sector);
        }
        this.setState({sectorToEdit: null, sectors: sectors});
    }

    renderButtons(){
        if(!this.state.sectorToEdit){
            let saveButton = !this.state.readOnly ?
                <div className="uk-align-right">
                    <Button label="Save" style="success"
                            onclick = {() => this.handleSave()}/>
                </div> : null;
            return (
                <GridCell width="1-1">

                    <div className="uk-align-right">
                        <Button label="Close" style="danger"
                                onclick = {() => this.handleClose()}/>
                    </div>
                    {saveButton}
                </GridCell>
            );
        }
    }

    render(){
        let sectorForm = null;
        let sectorDatatable = null;
        if(this.state.sectorToEdit){
            sectorForm = <CompanySector company = {this.props.company}
                                        sector = {this.state.sectorToEdit}
                                          ref = {(c) => this.form = c}
                                          onChange= {(sector) => this.handleAddOrEditCompanySector(sector)}
                                          oncancel = {() => this.handleCancel()}/>;
        }else{
            sectorDatatable =
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        <DataTable.Table data={this.state.sectors} title="Sectors"
                                         editable = {false} insertable = {false} filterable = {false} sortable = {true}>
                            <DataTable.Text header="Parent Sector" field="sector.parent.name" width="15" sortable = {true} translator={this}/>
                            <DataTable.Text header="Sub Sector" field="sector.name" width="15" sortable = {true}/>
                            <DataTable.Bool header="Default" field="default" width="15" sortable = {true}/>

                            <DataTable.ActionColumn width="10">
                                <DataTable.ActionWrapper shouldRender = {() => !this.state.readOnly} key="edit" track="onclick" onaction = {(data) => this.handleEditSector(data)}>
                                    <Button label="edit" flat = {true} style="primary" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                        </DataTable.Table>
                    </GridCell>
                </Grid>;
        }

        return (
            <div>
                <ActionHeader title="Sectors" readOnly={this.props.readOnly}
                              tools={[{title: "New Sector", style: "success", items: [{label: "",waves: true , onclick: () => this.handleNewSectorClick()}]}]} >
                </ActionHeader>
                <Grid>
                    <GridCell width="1-1" noMargin = {true}>
                        {sectorDatatable}
                    </GridCell>
                    <GridCell width="1-1" noMargin = {true}>
                        {sectorForm}
                    </GridCell>
                    {this.renderButtons()}
                </Grid>
            </div>

        );
    }
}

CompanySectorList.contextTypes = {
    translator: PropTypes.object
};