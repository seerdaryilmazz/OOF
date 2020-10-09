import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';

import {Grid, GridCell} from '../layout/Grid';
import {TranslatingComponent} from '../abstract/';
import {withReadOnly} from "../abstract/withReadOnly";
import {RenderingComponent} from '../oneorder/RenderingComponent'

export class DropDown extends TranslatingComponent {
    constructor(props) {
        super(props);
        if(props.id){
            this.state = {id:props.id};
        }else{
            this.state = {id:uuid.v4()};
        }
        var valueField = this.props.valueField;
        if(!valueField){
            valueField = "id";
        }
        var labelField = this.props.labelField;
        if(!labelField){
            labelField = "name";
        }
        this.state.labelField = labelField;
        this.state.valueField = valueField;
    };

    renderOption(item, escape) {
        let { options, optionTooltip } = this.props;
        let { valueField } = this.state;
        if (optionTooltip) {
            let optionItem = _.find(options, option => _.get(option, valueField) == item.value);
            let tooltipTitle = _.get(optionItem, optionTooltip.field);
            return `<div data-value="${item.value}" data-selectable class="option"><span>${_.trim(escape(item.text))}</span>
                    <span style="display:table-cell; float: right; margin-right: 8px">
                        <i title="${_.trim(escape(tooltipTitle))}" data-uk-tooltip="{pos:'${optionTooltip.pos||'right'}'}" class="material-icons uk-text-${optionTooltip.style||'primary'}">info</i>
                    </span>
                </div>`;
        } else {
            return `<div data-value="${item.value}" data-selectable class="option">${escape(item.text)}</div>`;
        }
    }
    
    loadSelectize(){
        if(!this._input) return;
        
        var thisPosBottom = $(this._input).attr('data-md-selectize-bottom');
        this.selectize = $(this._input)
            .after('<div class="selectize_fix"></div>')
            .selectize({
                plugins: [
                    'tooltip'
                ],
                hideSelected: false,
                dropdownParent: this.props.appendToBody ? 'body' : null,
                onDelete: value => setTimeout(() => this.handleFocusEvent(), 200),
                onChange: (value) => this.handleChange(value),
                onFocus: () => this.handleFocus(),
                onInitialize: () => this.handleInitialize(),
                onDropdownOpen: function($dropdown) {
                    $dropdown
                        .hide()
                        .velocity('slideDown', {
                            begin: function() {
                                if (typeof thisPosBottom !== 'undefined') {
                                    $dropdown.css({'margin-top':'0'})
                                }
                            },
                            duration: 200,
                            easing: easing_swiftOut
                        })
                },
                onDropdownClose: function($dropdown) {
                    $dropdown
                        .show()
                        .velocity('slideUp', {
                            complete: function() {
                                if (typeof thisPosBottom !== 'undefined') {
                                    $dropdown.css({'margin-top': ''})
                                }
                            },
                            duration: 200,
                            easing: easing_swiftOut
                        });
                },
                render: {
                    option: (item, escape) => this.renderOption(item, escape)
                }
            });
    }

    componentDidMount(){
        if(this.props.options && this.props.options.length > 0){
            this.loadSelectize();
            document.getElementById(this.state.id) &&
                document.getElementById(this.state.id).addEventListener("focus", this.handleFocusEvent);
        }
    }
    handleInitialize(){
        let inputElement = document.getElementById(this.state.id).nextElementSibling.querySelector("input");
        if(inputElement){
            inputElement.id = this.state.id + "-text";
        }

    }
    handleFocusEvent(){
        if(this.selectize && this.selectize[0].selectize){
            this.selectize[0].selectize.focus();
        }
    }
    componentWillUpdate(nextProps, nextState){
        this.unloadSelectize();
    }
    componentDidUpdate(prevProps, prevState){
        if(this.props.options && this.props.options.length > 0){
            this.loadSelectize();
        }
    }
    componentWillReceiveProps(nextProps){
        let val = nextProps.value;
        if(nextProps.value instanceof Object){
            val = _.get(nextProps.value, this.state.valueField);
        }
        // Aşağısını "if (!val) ..." şeklinde yaptığımızda bazı durumlar için yanlış çalışıyor. Örnek: val = 0 ise
        if(_.isNil(val)){
            if(this.selectize && this.selectize[0].selectize){
                this.selectize[0].selectize.clear();
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState){
        let propsEqual = false;
        if(this.props && nextProps){
            propsEqual = _.isEqual(this.props.value, nextProps.value) &&
                _.isEqual(this.props.options, nextProps.options) &&
                _.isEqual(this.props.required, nextProps.required) &&
                _.isEqual(this.props.label, nextProps.label) &&
                _.isEqual(this.props.disabled, nextProps.disabled);
        }
        let stateEqual = _.isEqual(this.state, nextState);
        return !(propsEqual && stateEqual);
    }

    componentWillUnmount(){
        this.unloadSelectize();
        document.getElementById(this.state.id) &&
            document.getElementById(this.state.id).removeEventListener("focus", this.handleFocusEvent);
    }

    unloadSelectize(){
        if(this.selectize && this.selectize[0].selectize){
            this.selectize[0].selectize.destroy();
        }
    }
    handleFocus(){
        this.props.onfocus && this.props.onfocus();
    }
    fakeOnChange(){

    }
    handleChange(value){
        if(this.props.required && value){
            $(this._input).parsley().validate();
        }
        if(this.props.onchange) {
            if(value){
                let result = this.props.options.filter((item) => {
                    return _.get(item, this.state.valueField) == value;
                });
                if(result.length === 1){
                    this.props.onchange(result[0]);
                }else{
                    console.warn("value doesn't return single object in dropdown labeled: " + this.props.label);
                }
            }else{
                this.props.onchange(null);
                if(this.props.onclear) {
                    this.props.onclear();
                }
            }
        }
    };

    renderStandard(){
        var label = "";
        if(!this.props.hideLabel){
            label = super.translate(this.props.label);
        }
        var requiredForLabel = "";
        if(this.props.required && label){
            requiredForLabel = <span className="req">*</span>;
        }
        var placeholder = "";
        if(this.props.options == null || typeof this.props.options === 'undefined' ){
            placeholder = "Loading...";
            if(this.props.uninitializedText){
                placeholder = this.props.uninitializedText;
            }
        }else if(this.props.options.length == 0){
            placeholder = "No data...";
            if(this.props.emptyText){
                placeholder = this.props.emptyText;
            }
        }else{
            placeholder = "";
            if(this.props.placeholder){
                placeholder = this.props.placeholder;
            }
        }

        var selectedValue = "";
        if(this.props.value){
            if(this.props.value instanceof Object && !_.isNil(_.get(this.props.value, this.state.valueField))){
                selectedValue = _.get(this.props.value, this.state.valueField);
            }else{
                selectedValue = this.props.value;
            }
        }

        let disabled = false;

        if (this.props.disabled != null && this.props.disabled) {
            disabled = true;
        }

        let wrapperClassName = "md-input-wrapper md-input-filled";

        if (disabled) {
            wrapperClassName += " md-input-wrapper-disabled";
        }

        if(this.props.options && this.props.options.length > 0){
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
            let options = [];
            if(this.props.groupBy){
                let grouped = _.groupBy(this.props.options, this.props.groupBy);
                for (var [groupLabel, groupedOptions] of Object.entries(grouped)) {
                    options.push(
                        <optgroup key = {groupLabel} label={groupLabel}>{
                                groupedOptions.map(option => <option key={_.get(option, this.state.valueField)} value={_.get(option, this.state.valueField)}>
                                    {this.props.translate ? super.translate(_.get(option, this.state.labelField),null,this.props.postTranslationCaseConverter) : _.get(option, this.state.labelField)}</option>)}
                                    </optgroup>
                    );
                }
            }else{
                options = this.props.options.map(option =>
                    <option key={_.get(option, this.state.valueField)} value={_.get(option, this.state.valueField)}>{this.props.translate ? super.translate(_.get(option, this.state.labelField),null,this.props.postTranslationCaseConverter) : _.get(option, this.state.labelField)}</option>
                );
            }

            let component;

            if (disabled) {
                component = (
                    <select id={this.state.id} ref={(c) => this._input = c}  data-md-selectize data-md-selectize-bottom value={selectedValue}
                            required={this.props.required} onChange = { (e) => this.fakeOnChange()}
                            data-parsley-group = {this.props.validationGroup} data-parsley-required-message = {super.translate("This value is required.")} disabled>
                        <option value="">{super.translate(placeholder)}</option>
                        {options}
                    </select>
                );
            } else {
                component = (
                    <select id={this.state.id} ref={(c) => this._input = c}  data-md-selectize data-md-selectize-bottom value={selectedValue}
                            required={this.props.required} onChange = { (e) => this.fakeOnChange()}
                            data-parsley-group = {this.props.validationGroup} data-parsley-required-message = {super.translate("This value is required.")}>
                        <option value="">{super.translate(placeholder)}</option>
                        {options}
                    </select>
                );
            }

            return(
                <div className={rowClassName}>
                    {addon}
                    <div className={wrapperClassName}>
                        <label>{label}{requiredForLabel}</label>
                        {component}
                        <span className="md-input-bar "/>
                    </div>
                </div>

            );
        }else{
            return(
                <div className={wrapperClassName}>
                    <label>{label}{requiredForLabel}</label>
                    <div className="selectize-control single plugin-tooltip">
                        <div className="selectize-input items required not-full">
                            <input type="text" autoComplete="off" tabIndex="" placeholder={super.translate(placeholder)}
                                   style={{opacity: 1, position: "relative", left: "0px"}}/>
                        </div>
                    </div>
                </div>
            );
        }
    }
    renderReadOnly(){

        var selectedValue = "";
        if(this.props.value){
            if(this.props.value instanceof Object && _.get(this.props.value, this.state.labelField)){
                selectedValue = _.get(this.props.value, this.state.labelField);
            }else{
                selectedValue = this.props.value;
            }
        }

        var label = "";
        if(!this.props.hideLabel){
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
                    <span className="uk-text-padding">{selectedValue}</span>
                </GridCell>
            </Grid>
        );
    }
    render() {
        return RenderingComponent.render(this);
    }
}
DropDown.contextTypes = {
    translator: PropTypes.object
};

export const ReadOnlyDropDown = withReadOnly(DropDown);