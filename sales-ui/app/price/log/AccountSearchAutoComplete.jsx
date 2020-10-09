import * as axios from 'axios';
import React from 'react';
import { AutoComplete } from 'susam-components/advanced';
import { Notify } from 'susam-components/basic';
import uuid from 'uuid';

export class AccountSearchAutoComplete extends React.Component {

    constructor(props){
        super(props);
        var id = this.props.id ? this.props.id : uuid.v4();
        this.state = {id: id};
    }

    componentDidMount(){

    }
    
    handleOnChange(item){
        this.props.onchange && this.props.onchange(item);
    }

    handleOnClear() {
        this.props.onclear && this.props.onclear();
    }

    autocompleteCallback = (release, val) => {
        axios.get('/crm-search-service/search/query', { params: { q: val, documentType: "account", size: 25 } }).then(response => {
            release(response.data.content.map(item => {
                return {id: item.id, name: item.name}
            }));
        }).catch(error =>{
            Notify.showError(error);
        });
    };

    render(){
        return (
            <AutoComplete id={this.state.id} label={this.props.label} valueField="id" labelField="name"
                          readOnly={this.props.readOnly}
                          onchange = {(item) => this.handleOnChange(item)}
                          onclear = {() => this.handleOnClear()}
                          callback={this.autocompleteCallback} value = {this.props.value}
                          flipDropdown = {this.props.flipDropdown}
                          hideLabel = {this.props.hideLabel}
                          required={this.props.required} placeholder="Search for account..."
                          ukIcon={this.props.ukIcon}
                          iconColorClass={this.props.iconColorClass}
            />
        );
    }
}