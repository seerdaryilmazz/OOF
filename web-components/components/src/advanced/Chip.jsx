import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';

import {Grid, GridCell} from '../layout/Grid';
import {TranslatingComponent} from '../abstract/'
import {RenderingComponent} from '../oneorder/RenderingComponent'
import {withReadOnly} from "../abstract/withReadOnly";

export class Chip extends TranslatingComponent {
    constructor(props) {
        super(props);
        if (props.id) {
            this.state = {id: props.id};
        } else {
            this.state = {id: uuid.v4()};
        }

        let valueField = this.props.valueField;
        if (!valueField) {
            valueField = "id";
        }
        let labelField = this.props.labelField;
        if (!labelField) {
            labelField = "name";
        }
        this.state.labelField = labelField;
        this.state.valueField = valueField;
        this.state.readOnly = this.props.readOnly;
        this.selectAllKey = "__SELECT_ALL__";
        this.minOptionCountToDisplaySelectAll = 3;
    }

    componentDidMount(){
        this.loadSelectize();
    }

    componentWillUpdate(nextProps, nextState) {

        let options = this.props.options ? this.props.options.map(item => _.get(item, this.state.valueField, item)) : [];
        let nextOptions = nextProps.options ? nextProps.options.map(item => _.get(item, this.state.valueField, item))  : [];

        if (!_.isEqual(options, nextOptions)) {
            this.unloadSelectize();
        }
    }

    componentDidUpdate(prevProps, prevState) {

        let prevOptions = prevProps.options ? prevProps.options.map(item => _.get(item, this.state.valueField, item)) : [];
        let options = this.props.options ? this.props.options.map(item => _.get(item, this.state.valueField, item)) : [];

        if (!_.isEqual(prevOptions, options) && options.length > 0) {
            this.loadSelectize();
        }

        if (options.length > 0) {

            let prevSelectedOptions = prevProps.value ? prevProps.value.map(item => _.get(item, this.state.valueField, item)) : [];
            let selectedOptions = this.props.value ? this.props.value.map(item => _.get(item, this.state.valueField, item)) : [];

            if (!_.isEqual(prevSelectedOptions, selectedOptions)) {
                this.selectize[0].selectize.clear(true);
                this.selectize[0].selectize.clearCache();
                selectedOptions.forEach((selectedOption) => {
                    this.selectize[0].selectize.addItem(selectedOption, true);
                });
            }
        }
    }

    componentWillUnmount() {
        this.unloadSelectize();
    }

    loadSelectize() {

        this.selectize = $('#' + this.state.id).selectize({
            plugins: {
                'remove_button': {
                    label: ''
                }
            },

            maxItems: null,
            valueField: 'id',
            labelField: 'title',
            searchField: 'title',
            create: this.props.create ? this.props.create : false,
            render: {
                option: (data, escape) => {
                    let optionStyle = data.id === this.selectAllKey ? "font-weight: bold;" : "";
                    return '<div style="' + optionStyle + '">' +
                        '<span>' + escape(data.title) + '</span>' +
                        '</div>';
                },

            },
            onChange: (value)=> this.handleChange(value),
            onInitialize: () => this.handleInitialize(),
            onDropdownOpen: function ($dropdown) {
                $dropdown
                    .hide()
                    .velocity('slideDown', {
                        begin: function () {
                            $dropdown.css({'margin-top': '0'})
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    })
            },
            onDropdownClose: function ($dropdown) {
                $dropdown
                    .show()
                    .velocity('slideUp', {
                        complete: function () {
                            $dropdown.css({'margin-top': ''})
                        },
                        duration: 200,
                        easing: easing_swiftOut
                    })
            }
        });

    }

    handleInitialize(){
        let inputElement = document.getElementById(this.state.id).nextElementSibling.querySelector("input");
        if(inputElement){
            inputElement.id = this.state.id + "-text";
        }

    }

    unloadSelectize(){
        if(this.selectize && this.selectize[0] && this.selectize[0].selectize){
            this.selectize[0].selectize.destroy();
        }
    }

    fakeOnChange() {

    }

    selectAll() {
        let allValues = _.pull(_.keys(this.selectize[0].selectize.options), this.selectAllKey);
        this.selectize[0].selectize.setValue(allValues);
    }

    handleChange(value) {
        if(value && _.isArray(value) && _.indexOf(value, this.selectAllKey) >= 0) {
            this.selectAll();
            return;
        }

        let options = this.props.options;
        if (this.props.required && value) {
            $(this._input).parsley().validate();
        }
        if (this.props.onchange) {
            if (value) {
                let result = [];
                value.forEach((item) => {
                    let selectedOption = _.find(options, option => _.get(option, this.state.valueField, option) == item);
                    if(selectedOption){
                        result.push(selectedOption);
                    }else if(this.props.create){
                        result.push(item);
                    }
                });
                this.props.onchange(result);
            } else {
                this.props.onchange([]);
            }
        }
    };

    appendToSelectedValue(item, selectedValue) {
        if (item instanceof Object && _.get(item, this.state.valueField, item)) {
            selectedValue.push(_.get(item, this.state.valueField, item))
        } else {
            selectedValue.push(item);
        }
    }

    renderStandard() {

        let options = this.props.options;

        var label = "";
        if (!this.props.hideLabel) {
            label = super.translate(this.props.label);
        }
        var requiredForLabel = "";
        if (this.props.required && label) {
            requiredForLabel = <span className="req">*</span>;
        }
        var placeholder = "";
        if (options == null || typeof options === 'undefined') {
            placeholder = "Loading...";
            if (this.props.uninitializedText) {
                placeholder = this.props.uninitializedText;
            }
        } else if (options.length == 0) {
            placeholder = "No data...";
            if (this.props.emptyText) {
                placeholder = this.props.emptyText;
            }
        } else {
            placeholder = "";
            if (this.props.placeholder) {
                placeholder = this.props.placeholder;
            }
        }
        var selectedValue = [];
        if (_.isArray(this.props.value)) {
            this.props.value.forEach((item) => {
                this.appendToSelectedValue(item, selectedValue);
            });
        } else {
            if(this.props.value != null){
                this.appendToSelectedValue(this.props.value, selectedValue);
            }
        }

        let elements = null;

        if (options) {
            elements = options.map(option => {
                    return (<option key={_.get(option, this.state.valueField, option)}
                                    value={_.get(option, this.state.valueField, option)}>{this.props.translate ? super.translate(_.get(option, this.state.labelField, option),null,this.props.postTranslationCaseConverter) : _.get(option, this.state.labelField, option) }</option>);
                }
            );
        }

        let selectAllOption = null;
        if(options && options.length >= this.minOptionCountToDisplaySelectAll && !this.props.hideSelectAll) {
            selectAllOption = <option value={this.selectAllKey}>{super.translate("Select All")}</option>;
        }
        if(this.props.options && this.props.options.length > 0){
            return (
                <div className="parsley-row">
                    <div className="md-input-wrapper md-input-filled">
                        <label>{label}{requiredForLabel}</label>
                        <select id={this.state.id} name={this.state.id} ref={(c) => this._input = c}
                                required={this.props.required} value={selectedValue}
                                onChange={ (e) => this.fakeOnChange()} multiple>
                            <option value="">{super.translate(placeholder)}</option>
                            {selectAllOption}
                            {elements}
                        </select>
                    </div>
                </div>
            );
        }else{
            return(
                <div className="md-input-wrapper md-input-filled">
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
        if (_.isArray(this.props.value)) {
            this.props.value.forEach((item) => {
                if(selectedValue.length > 0) selectedValue += ", ";
                let label = _.get(item, this.state.labelField, item)
                selectedValue += this.props.translate ? super.translate(label,null,this.props.postTranslationCaseConverter) : label;
            });
        } else {
            if(this.props.value != null){
                let label = _.get(this.props.value, this.state.labelField, this.props.value);
                selectedValue = this.props.translate ? super.translate(label,null,this.props.postTranslationCaseConverter) : label;
            }
        }

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
                    <span className="uk-text-padding">{selectedValue}</span>
                </GridCell>
            </Grid>
        )
    }
    render() {
        return RenderingComponent.render(this);
    }
}

Chip.contextTypes = {
    translator: PropTypes.object
};

export const ReadOnlyChip = withReadOnly(Chip);