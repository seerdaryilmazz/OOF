import React from 'react';
import {AutoComplete} from '../advanced';
import * as axios from 'axios';

export class HSCodeAutoComplete extends React.Component {
    constructor(props){
        super(props);
        this.state={};
        this.template = '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}} ' +
            '<li data-id="{{ $item.id}}" data-name="{{ $item.name}}" data-value="{{ $item.code}} {{ $item.name}}"> ' +
                '<a href="javascript:void()">' +
                    '<div style="font-weight: bold">{{ $item.code}}</div>' +
                    '<div class="md-color-blue-500">{{ $item.name}}</div>' +
                    '<div class="uk-text-small uk-text-muted uk-text-truncate">{{ $item.parent1}}</div>' +
                    '<div class="uk-text-small uk-text-muted uk-text-truncate">{{ $item.parent2}}</div>' +
                '</a>' +
            '</li>{{/items}} </ul>';
    }

    componentDidMount(){

    }

    autocompleteCallback = (val) => {
        return new Promise(
            (resolve, reject) => {
                axios.get('/order-service/search/hscode', {params: {q: val}}).then((response) => {
                    let data = response.data.content.map((item) => {
                        let parent1 = item.parents && item.parents.length > 0 ? item.parents[0] : "";
                        let parent2 = item.parents && item.parents.length > 1 ? item.parents[1] : "";
                        return {id: item.id, name: item.name, code: item.code, parent1: parent1, parent2: parent2, data: item}
                    });
                    resolve({data: data});
                }).catch((error) => {
                    console.log(error);
                    reject();
                });
            }
        );
    };

    render(){

        return(
            <AutoComplete label={this.props.label} valueField="id" labelField="name"
                          value = {this.props.value}
                          promise={this.autocompleteCallback}
                          onchange = {this.props.onchange}
                          hideLabel = {this.props.hideLabel}
                          flipDropdown = {this.props.flipDropdown}
                          required={this.props.required} placeholder="Search for HS Code..."
                          ukIcon={this.props.ukIcon}
                          template = {this.template}
                          iconColorClass={this.props.iconColorClass}/>
        );
    }
}