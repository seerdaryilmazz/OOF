import React from "react";
import _ from "lodash";

import {TranslatingComponent} from 'susam-components/abstract';
import {ReadOnlyDropDown, Notify} from 'susam-components/basic';

import {CompanyService} from '../services';

export class CompanyLocationDropDown extends TranslatingComponent {

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

    setInitialValue(){
        if(this.props.setInitialValue && _.isEmpty(this.props.value)){
            if(this.state.options.length == 1){
                this.props.onchange && this.props.onchange(this.state.options[0])
            }
        }
    }

    findLocations(companyId) {
        CompanyService.getLocationsByCompany(companyId).then(response => {
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