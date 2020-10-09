import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {ReadOnlyDropDown, Notify} from 'susam-components/basic';

import {CompanyService} from '../services';
import { relativeTimeThreshold } from "moment";

export class ActiveCompanyLocationDropDown extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
            companyLocationLoaded: false,
            options: []
        };
        if(!_.isEmpty(this.props.company)){
            this.findLocations(this.props.company.id);
        }
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps){
        if(!_.isEmpty(nextProps.company) && !_.isEqual(nextProps.company, this.props.company)){
            this.setState({companyLocationLoaded:false}, () => this.findLocations(_.get(nextProps.company, 'id')));
        }
        if(_.isEmpty(nextProps.company)){
            this.setState({options:[], companyLocationLoaded:false});
        }
    }

    componentDidUpdate(prevProps) {
        if(!this.props.readOnly ){
            this.checkValueExistenceInOptions();
        }
    }

    setInitialValue(){
        if(_.isEmpty(this.props.value)){
            if(this.props.setInitialValue && this.state.options.length == 1){
                this.props.onchange && this.props.onchange(this.state.options[0])
            }
        } else if(!this.props.readOnly){
            this.checkValueExistenceInOptions();
        }
    }

    checkValueExistenceInOptions(){
        if(this.props.value && 0 > _.findIndex(this.state.options, i=>i.id === this.props.value.id)){
            this.props.onchange && this.props.onchange(null);
        }
    }

    findLocations(companyId) {
        CompanyService.getActiveLocationsByCompany(companyId).then(response => {
            this.setState({options:response.data, companyLocationLoaded:true}, () => this.setInitialValue())
        }).catch(error => {
            Notify.showError(error);
        });
    }

    render() {
        return (
            <ReadOnlyDropDown {...this.props} options={this.state.options}/>
        );
    }
}