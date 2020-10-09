import React from "react";
import _ from "lodash";
import uuid from "uuid";
import * as axios from 'axios';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell} from "susam-components/layout";
import {Notify, DropDown} from 'susam-components/basic';

import {CustomsOfficeService} from '../../../services/LocationService';

export class CustomsAndLocation extends TranslatingComponent{

    state = {};

    componentDidMount(){
        this.loadCustoms();
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.customs && nextProps.customs.id){
            if(this.props.customs){
                if(this.props.customs.id !== nextProps.customs.id){
                    this.loadCustomsLocations(nextProps.customs);
                }
            }else{
                this.loadCustomsLocations(nextProps.customs);
            }
        }else{
            this.setState({locations: null});
        }
    }

    loadCustomsLocations(customs){
        CustomsOfficeService.listLocations(customs).then(response => {
            this.setState({locations: response.data}, () => {
                if(response.data.length === 1){
                    this.props.onLocationChange(response.data[0]);
                }
            });
        }).catch(error => Notify.showError(error));
    }

    loadCustoms(){
        CustomsOfficeService.list().then(response => {
            this.setState({customs: response.data});
        }).catch(error => {
            Notify.showError(error);
        })
    }

    handleSelectCustoms(value){
        this.props.onCustomsChange(value);
    }

    render(){
        return(
            <Grid>
                <GridCell width = "1-2">
                    <DropDown label = "Customs Office"
                              options = {this.state.customs} readOnly = {this.props.readOnly}
                              value = {this.props.customs}
                              onchange = {value => this.handleSelectCustoms(value)}/>
                </GridCell>
                <GridCell width = "1-2">
                    <DropDown label = "Location"
                              options = {this.state.locations} readOnly = {this.props.readOnly}
                              value = {this.props.location}
                              onchange = {value => this.props.onLocationChange(value)}/>
                </GridCell>
            </Grid>
        );
    }
}