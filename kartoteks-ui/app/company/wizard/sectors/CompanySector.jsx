import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Wizard, Loader} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Checkbox, CheckboxGroup, Span, Form} from 'susam-components/basic';

import {LookupService} from '../../../services/KartoteksService';


export class CompanySector extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {selectedParent: null, selectedSub: null};
    }

    initializeState(props){
        let state = _.cloneDeep(this.state);
        state.sector = props.sector;
        state.selectedSub = props.sector.sector;
        if(props.sector.sector){
            state.selectedParent = props.sector.sector.parent;
        }

        this.setState(state);
    }

    initializeLookups(companySector){
        LookupService.getParentSectors().then(parentResponse => {
            this.setState({parentSectors: parentResponse.data});
            if(companySector && companySector.sector && companySector.sector.parent){
                this.getSubSectors(companySector.sector.parent.id);
            }
        }).catch(error => {
            Notify.showError(error);
        })
    }
    getSubSectors(parentId){
        LookupService.getSubSectors(parentId).then(response => {
            this.setState({subSectors: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }
    componentDidMount(){
        this.initializeLookups(this.props.sector);
        this.initializeState(this.props);
        this.validate();
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
        this.validate();
    }

    updateState(key, value){
        let sector = _.cloneDeep(this.state.sector);
        _.set(sector, key, value);
        this.setState({sector: sector});
    }
    updateParentSector(value){
        if(!value){
            return;
        }
        let state = _.cloneDeep(this.state);
        state.selectedParent = value;
        this.getSubSectors(value.id);
        this.setState(state);
    }
    updateSubSector(value){
        if(!value){
            return;
        }
        let state = _.cloneDeep(this.state);
        state.selectedSub = value;
        state.sector.sector = state.selectedSub;
        state.sector.sector.parent = state.selectedParent;
        this.setState(state);
    }


    handleCancelClick(){
        this.props.oncancel && this.props.oncancel();
    }
    handleSaveClick(){
        this.props.onsave && this.props.onsave(this.state.sector);
    }
    validate(){
        return this.form && this.form.validate();
    }

    render(){
        if(!this.state.sector){
            return <Loader />;
        }
        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="Sector Information"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref = {(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-1">
                                <Checkbox label="Set as default" value = {this.state.sector.default}
                                          onchange = {(value) => this.updateState("default", value)} />

                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown label="Parent Sector" required = {true}
                                          options = {this.state.parentSectors}
                                          value = {this.state.selectedParent}
                                          onchange = {(value) => this.updateParentSector(value)} />
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown label="Sub Sector" required = {true}
                                          options = {this.state.subSectors}
                                          value = {this.state.selectedSub}
                                          uninitializedText = "Please select parent sector"
                                          onchange = {(value) => this.updateSubSector(value)} />
                            </GridCell>
                            <GridCell width="1-1" noMargin = {true}>
                                <div className="uk-align-right">
                                     <Button label="Ok" waves = {true} style = "primary" onclick = {() => this.handleSaveClick()}/>   
                                    <Button label="cancel" style="danger" waves = {true} onclick = {() => this.handleCancelClick()}/>                        
                                </div>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
            </Grid>
        );
    }
}