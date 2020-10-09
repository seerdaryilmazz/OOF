import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';

import {Grid, GridCell} from '../layout/Grid';
import {TranslatingComponent} from '../abstract/'
import {RenderingComponent} from '../oneorder/RenderingComponent'

export class AutoComplete extends TranslatingComponent {
    constructor(props) {
        super(props);

        var minLength = this.props.minLength ? this.props.minLength : 3;
        var id = this.props.id ? this.props.id : uuid.v4();
        this.state = {id: id, minLength: minLength, value: ""};

        this.valueField = this.props.valueField;
        if(!this.valueField){
            this.valueField = "id";
        }
        this.labelField = this.props.labelField;
        if(!this.labelField){
            this.labelField = "name";
        }
        this.state.readOnly = this.props.readOnly;

    };

    mountAutocomplete(){
        $(this._input).on('focus', function() {
            $(this).closest('.md-input-wrapper').addClass('md-input-focus');
        });

        var resultsTemplate = '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}} ' +
            '<li data-id="{{ $item.' + this.valueField + ' }}" data-value="{{ $item.' + this.labelField + ' }}" data-' + this.labelField + '="{{ $item.' + this.labelField + ' }}" data-' + this.valueField + '="{{ $item.' + this.valueField + ' }}"> <a tabindex="-1" href="javascript:void()">{{ $item.' + this.labelField + ' }}</a> </li>{{/items}} </ul>';

        if(this.props.template){
            resultsTemplate = this.props.template;
        }

        var autocomplete = UIkit.autocomplete($(this._input).closest(".uk-autocomplete"), {
            source: this.autocompleteCallback,
            minLength: this.state.minLength,
            delay: 300,
            flipDropdown: this.props.flipDropdown,
            template: resultsTemplate
        });
        autocomplete.on('selectitem.uk.autocomplete', (event, selectedItem, obj) => {
            if(selectedItem && this.props.onchange) {
                if(this.options){
                    let selectedOption = _.find(this.options, [this.valueField, selectedItem.id]);
                    this.props.onchange(selectedOption);
                }else{
                    this.props.onchange(selectedItem);
                }

            }
        });
    }


    autocompleteCallback = (release) => {
        if(this.props.promise){
            this.props.promise($(this._input).val()).then(response => {
                this.options = response.data;
                release(response.data);
            }).catch(error => {
                console.log(error);
            });
        }else if(this.props.callback){
            this.props.callback(release, $(this._input).val());
        }else{
            var results = this.props.source.filter(item => item[this.labelField].toUpperCase().startsWith($(this._input).val().toUpperCase()));
            release(results);
        }
    };

    componentDidMount(){
        this.mountAutocomplete();
        this.updateStateFromProps(this.props);
    }
    componentWillReceiveProps(nextProps){
        this.updateStateFromProps(nextProps);
    }

    updateStateFromProps(props){
        let value = "";
        let valueObj =  props.value;
        if(valueObj) {
            value = valueObj[this.labelField];
        }

        let state = _.cloneDeep(this.state);
        state.value = value;
        state.readOnly = props.readOnly;
        this.setState(state);
    }

    handleChange(value){
        let state = _.cloneDeep(this.state);
        state.value = value;
        this.setState(state);
        if (!value && this.props.onclear) {
            this.props.onclear();
        }
    }

    getInputValue() {
        return this._input.value;
    }

    renderStandard(){
        var hidden = this.props.hidden;
        var style = {};
        if(hidden){
            style.display= 'none';
        }
        let placeholder = this.props.placeholder;
        if(!placeholder){
            placeholder = "Min. " + this.state.minLength + " characters";
        }
        var wrapperClassName = "md-input-wrapper";
        if(this.props.value !== null || placeholder){
            wrapperClassName += " md-input-filled";
        }
        var inputClassName = "md-input";
        if(this.props.value !== null || placeholder){
            inputClassName += " label-fixed";
        }
        var label = "";
        if(!this.props.hideLabel){
            label = super.translate(this.props.label);
        }
        var requiredForLabel = "";
        if(this.props.required && label){
            requiredForLabel = <span className="req">*</span>;
        }
        if(this.props.disabled){
            wrapperClassName +=" md-input-wrapper-disabled";
        }

        let rowClassName = "uk-form-row parsley-row";
        let addon = "";
        if(this.props.ukIcon){
            rowClassName += " uk-input-group";
            let iconClassName = "uk-input-group-icon uk-icon-" + this.props.ukIcon;
            if(this.props.iconColorClass){
                iconClassName = iconClassName + " " + this.props.iconColorClass;
            }
            addon = <span className="uk-input-group-addon"><i className={iconClassName} /></span>;
        }

        return(
            <div className={rowClassName}>
                {addon}
                <div className="uk-autocomplete uk-position-relative" data-uk-autocomplete>
                    <div className={wrapperClassName}>
                        <label htmlFor={this.state.id}>{label}{requiredForLabel}</label>
                        <input id={this.state.id} ref={(c) => this._input = c}
                           type="text" className={inputClassName}
                               value={this.state.value}
                               onChange={(e) => this.handleChange(e.target.value)}
                           placeholder={super.translate(placeholder)} required={this.props.required}
                               disabled = {this.props.disabled}
                        />
                        <span className="md-input-bar "/>
                    </div>

                </div>
                </div>

        );
    }

    renderReadOnly(){

        var label = "";
        if (!this.props.hideLabel) {
            label = super.translate(this.props.label);
        }

        return (
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <div className="uk-form-row">
                        <div className="md-input-wrapper md-input-filled">
                            <label>{label}</label>
                        </div>
                    </div>
                </GridCell>
                <GridCell width="1-1">
                    {this.state.value}
                </GridCell>
            </Grid>
        )
    }
    render() {
        return RenderingComponent.render(this);
    }
}
AutoComplete.contextTypes = {
    translator: PropTypes.object
};
