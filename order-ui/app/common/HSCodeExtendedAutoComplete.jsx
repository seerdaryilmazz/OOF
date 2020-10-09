import * as axios from 'axios';
import React from 'react';
import { AutoComplete } from 'susam-components/advanced';
import uuid from 'uuid';
import { HSCodeDetailModal } from '../hscode/HSCodeDetailModal';

export class HSCodeExtendedAutoComplete extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id ? this.props.id: uuid.v4(),
            value: this.props.value,
        };
        this.template = '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}} ' +
                            '<li data-id="{{ $item.id}}" data-name="{{ $item.name}}" data-value="{{ $item.label}}"> ' +
                                '<a href="javascript:void()">' +
                                    '<div class="md-color-grey-600">{{$item.code?$item.code:""}}</div>' +
                                    '<div style="font-weight: bold">{{$item.name?$item.name:""}}</div>' +
                                    '<div class="md-color-green-600">{{$item.new}}</div>' +
                                '</a>' +
                            '</li>{{/items}}' +
                        '</ul>';
    }

    handleOnChange(value) {
        if (value.id !== -1) {
            this.setState({value: value})
            this.props.onChange && this.props.onChange(value);
        } else {
            this.setState({value: null});
            this.detailModal.open();
        }
    }

    componentDidMount() {
        $("#"+this.state.id).focus(function(){
            $(this).css({"text-transform":"uppercase"}).attr("placeholder","");
        });
        $("#"+this.state.id).blur(function(){
            $(this).css({"text-transform":""}).attr("placeholder","Search for HS Code...");
        });
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.value && nextProps.value.id){
            this.setState({ value: nextProps.value });
        } else {
            this.setState({ value: this.map({ id: 0, name: "", code: "" }) });
        }
    }

    autocompleteCallback = (val) => {
        return new Promise(
            (resolve, reject) => {
                axios.get('/order-service/search/hscode-extended', { params: { q: val } }).then((response) => {
                    let data = response.data.content.map(item => {
                        return this.map(item);
                    });
                    data.push(this.map({ id: -1, name: "", code: "", new: "New Define" }));
                    resolve({ data: data });
                }).catch((error) => {
                    console.log(error);
                    reject();
                });
            }
        );
    };

    map(entity) {
        return {
            id: entity.id,
            name: entity.name,
            code: entity.code,
            new: entity.new ? entity.new : "",
            label: _.trim(_.defaultTo(entity.code,"") + " " + _.defaultTo(entity.name,"")),
            data: entity
        }
    }

    onClose() {

    }

    handleSave(entity){
        this.handleOnChange(this.map(entity));
    }

    render() {
        
        return (
            <div lang={navigator.language}>
                <AutoComplete label={this.props.label} valueField="id" labelField="label"
                    id={this.state.id}
                    value={this.state.value}
                    promise={this.autocompleteCallback}
                    onchange={value => this.handleOnChange(value)}
                    hideLabel={this.props.hideLabel}
                    flipDropdown={this.props.flipDropdown}
                    required={this.props.required}
                    placeholder="Search for HS Code..."
                    ukIcon={this.props.ukIcon}
                    minLength={1}
                    template={this.template}
                    iconColorClass={this.props.iconColorClass} />
                <HSCodeDetailModal ref={c => this.detailModal = c} onSave={(entity)=>this.handleSave(entity)} onClose={()=>this.onClose()} />
            </div>
        );
    }
}