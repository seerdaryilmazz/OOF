import React from 'react';
import uuid from 'uuid';
import * as axios from 'axios';
import _ from 'lodash';

import {Grid, GridCell} from 'susam-components/layout'
import {Span, TextInput, DropDown, Button, Notify} from 'susam-components/basic'
import {CompanySearchAutoComplete} from 'susam-components/oneorder';
import {handleTabPress, DefaultInactiveElement} from './steps/OrderSteps';
import {OptionList} from './steps/OptionList';

import {Kartoteks} from '../services';


export class SenderSelection extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
    }
    componentDidUpdate(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentDidMount(){
        if(this.props.active){
            document.addEventListener('keyup', this.handleKeyPress);
        }
    }
    componentWillUnmount(){
        document.removeEventListener('keyup', this.handleKeyPress);
    }
    handleKeyPress = (e) => {
        handleTabPress(e, () => this.props.onNext(), () => this.props.onPrev());
    };

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    updateSenderCompany(value){
        this.updateState("senderCompany", value);
        this.loadingCompany.focus();
    }
    updateLoadingLocation(value){
        let state = _.cloneDeep(this.state);
        state.loadingLocation = value;
        state._key = uuid.v4();
        this.setState(state, () => {
            this.props.onChange && this.props.onChange(this.state);
            this.props.onNext && this.props.onNext();
        });
    }

    handleLoadingCompanySelect(company){
        Kartoteks.getCompanyLocations(company.id).then(response => {
            this.setState({loadingCompany: company, locations: response.data}, () => this.loadingLocation.focus());
        }).catch(error => {
            Notify.showError(error);
        })
    }
    handleSetLoadingAsSenderCompany(){
        if(this.state.senderCompany){
            this.handleLoadingCompanySelect(this.state.senderCompany);
        }
    }
    handleSetSenderAsCustomerCompany(){
        if(this.props.customer){
            this.updateState("senderCompany", this.props.customer);
            this.loadingCompany.focus();
        }
    }
    handleSelect(value){
        let option = _.find(this.props.options, {_key: value._key});
        this.props.onChange && this.props.onChange(option);
        this.props.onNext && this.props.onNext();
    }
    focus(){
        this.senderCompany && this.senderCompany.focus();
    }

    transformOptionForBox(option){
        return {
                _key: option._key,
                title: option.senderCompany ? option.senderCompany.name : "",
                subtitle: option.loadingLocation ? option.loadingLocation.name : "",
                description: option.loadingCompany ? option.loadingCompany.name : ""
            };
    }
    render(){
        return this.props.active ? this.renderActive(this.props.options) : this.renderInactive();
    }

    renderInactive(){
        if(!this.props.value){
            return <DefaultInactiveElement value="No selection" />;
        }
        let options = this.props.options && this.props.options.length > 0 ?  this.props.options : [this.props.value];
        return <OptionList options = {options} value = {this.props.value}
                           transform = {(option) => this.transformOptionForBox(option)} />;

    }
    renderActive(options){
        if(options && options.length > 0){
            return <OptionList options = {options} value = {this.props.value} enableArrowKeys = {true}
                               onChange = {(value) => this.handleSelect(value)}
                               transform = {(option) => this.transformOptionForBox(option)}/>;
        }else{
            return this.renderActiveWithoutOptions();
        }
    }
    renderActiveWithoutOptions(){
        return(
            <Grid>
                <GridCell width = "2-3">
                    <CompanySearchAutoComplete label = "Sender Company" value = {this.state.senderCompany}
                                               required = {true} ref = {c => this.senderCompany = c}
                                               onchange = {(value) => this.updateSenderCompany(value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Button label="use customer" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleSetSenderAsCustomerCompany()} />
                    </div>
                </GridCell>
                <GridCell width = "2-3">
                    <CompanySearchAutoComplete label = "Loading Company" value = {this.state.loadingCompany}
                                               required = {true} ref = {c => this.loadingCompany = c}
                                               onchange = {(value) => this.handleLoadingCompanySelect(value)} />
                </GridCell>
                <GridCell width = "1-3">
                    <div className = "uk-margin-top">
                        <Button label="use sender company" flat = {true} size = "small" style = "success"
                                onclick = {() => this.handleSetLoadingAsSenderCompany()} />
                    </div>
                </GridCell>
                <GridCell width = "2-3">
                    <DropDown label = "Loading Location" options = {this.state.locations}
                              emptyText = "No locations..." uninitializedText = "Select loading company..."
                              ref = {c => this.loadingLocation = c}
                              value = {this.state.loadingLocation} required = {true}
                              onchange = {(value) => this.updateLoadingLocation(value)} />
                </GridCell>
            </Grid>
        );
    }
}

