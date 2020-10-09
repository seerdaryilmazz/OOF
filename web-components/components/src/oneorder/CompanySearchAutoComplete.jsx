import * as axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import uuid from 'uuid';
import { TranslatingComponent } from '../abstract';
import { AutoComplete } from '../advanced';
import { Notify } from '../basic';

let services = {
    COMPANY: {
        className: "md-bg-light-blue-600",
        label: "Company",
        callback: val => axios.get('/kartoteks-service/search', { params: { q: val, size: 25 } })
    },
    CUSTOMS: {
        className: "md-bg-light-green-600",
        label: "Customs",
        callback:  val => axios.get('/search-service/search/customs-office', { params: { q: val } })
    }
};

export class CompanySearchAutoComplete extends TranslatingComponent {
    constructor(props){
        super(props);
        var id = this.props.id ? this.props.id : uuid.v4();
        this.state = {id: id};
        this.buildTemplate();
    }

    buildTemplate() {
        let name = this.props.showShortName ? "shortName" : "name" ;
        this.template = 
            '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">' + 
                '{{~items}} ' +
                    '<li data-type="{{$item.type.code}}" data-value="{{ $item.' + name + ' }}" data-name="{{ $item.' + name + ' }}" data-id="{{ $item.id }}">' + 
                        '<a style="display:table; width:100%" tabindex="-1" href="javascript:void()">' +
                            '<span style="display:table-cell">' +
                                '{{ $item.' + name + ' }}' +
                                '<span class="md-color-green-600">{{$item.new}}</span>' +
                            '</span>' +
                            '<span style="display:table-cell; float: right; margin-right: 24px">' +
                                '<span class="uk-badge {{$item.type.className}}" style="display:{{$item.display}}">{{$item.type.label}}</span>' +
                            '</span>' +
                        '</a>' + 
                    '</li>' + 
                '{{/items}}' + 
            '</ul>';
    }
    
    handleOnChange(item){
        if(item.id !== -1){
            this.props.onchange && this.props.onchange(item);
        }else{
            this.props.onchange && this.props.onchange(null);
            this.props.onAddNew && this.props.onAddNew();
        }
    }

    handleOnClear() {
        this.props.onclear && this.props.onclear();
    }

    autocompleteCallback = (release, val) => {
        let calls = [];
        if(_.isEmpty(this.props.sources)){
            calls.push(services.COMPANY.callback(val));
        } else {
            for(let key in services) {
                if(_.find(this.props.sources, i=>_.isEqual(i, key))){
                    calls.push(_.get(services, key).callback(val));
                }
            }
        }

        axios.all(calls).then(axios.spread((company, customsOffice) => {
            let results = [];
            if(company){
                company.data.content.forEach(item=>{
                    results.push({
                        id: item.id, 
                        name: item.name,
                        new: "",
                        display:"",
                        shortName: item.shortName, 
                        type: {
                            code: 'COMPANY',
                            label: super.translate(services['COMPANY'].label),
                            className: services['COMPANY'].className
                        }
                    });
                });
            }
            if(customsOffice){
                customsOffice.data.content.forEach(item=>{
                    results.push({
                        id: item.id, 
                        name: item.name,
                        display:"",
                        shortName: item.shortName, 
                        type: {
                            code: 'CUSTOMS',
                            label: super.translate(services['CUSTOMS'].label),
                            className: services['CUSTOMS'].className
                        }
                    });
                });
            }
            if(this.props.onAddNew){
                results.push({
                    id: -1,
                    name: "",
                    new: super.translate("Add New"),
                    display:"none",
                    type: {
                        label: "",
                        className: ""
                    }
                });
            }
            release(results);
        })).catch(error => {
            Notify.showError(error);
        });
    };
    
    render(){
        return(
            <AutoComplete id={this.state.id} label={this.props.label}
                          template={this.template}
                          readOnly={this.props.readOnly}
                          onchange = {(item) => this.handleOnChange(item)}
                          onclear = {() => this.handleOnClear()}
                          callback={this.autocompleteCallback} value = {this.props.value}
                          flipDropdown = {this.props.flipDropdown}
                          hideLabel = {this.props.hideLabel}
                          required={this.props.required} placeholder="Search for company..."
                          ukIcon={this.props.ukIcon}
                          iconColorClass={this.props.iconColorClass}
            />
        );
    }
}

CompanySearchAutoComplete.contextTypes = {
    translator: PropTypes.object
};