import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { withReadOnly } from 'susam-components/abstract/withReadOnly';
import { Grid, GridCell } from 'susam-components/layout';
import { RenderingComponent } from 'susam-components/oneorder';
import uuid from 'uuid';

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
        this.defineSelectiza();
        this.loadSelectize();
        this.props.lock?this.lockSelectize():this.unlockSelectize();
    }

    componentWillUpdate(nextProps, nextState) {

        let options = this.props.options ? this.props.options.map(item => item[this.state.valueField]) : [];
        let nextOptions = nextProps.options ? nextProps.options.map(item => item[this.state.valueField]) : [];

        if (!_.isEqual(options, nextOptions)) {
            this.unloadSelectize();
        }
    }

    componentDidUpdate(prevProps, prevState) {

        let prevOptions = prevProps.options ? prevProps.options.map(item => item[this.state.valueField]) : [];
        let options = this.props.options ? this.props.options.map(item => item[this.state.valueField]) : [];

        if (!_.isEqual(prevOptions, options) && options.length > 0) {
            this.loadSelectize();
        }

        if (options.length > 0) {

            let prevSelectedOptions = prevProps.value ? prevProps.value.map(item => item[this.state.valueField]) : [];
            let selectedOptions = this.props.value ? this.props.value.map(item => item[this.state.valueField]) : [];

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

    defineSelectiza() {
        Selectize.define("stop_backspace_delete", function (options) {
            var self = this;

            this.deleteSelection = (function () {
                var original = self.deleteSelection;

                return function (e) {
                    if (!e || e.keyCode !== 8) {
                        return original.apply(this, arguments);
                    }

                    return false;
                };
            })();
        });
    }

    loadSelectize() {

        this.selectize = $('#' + this.state.id).selectize({
            plugins: {
                'stop_backspace_delete':{},
                'remove_button': {
                    label: ''
                }
            },
            maxItems: null,
            valueField: 'id',
            labelField: 'title',
            searchField: 'title',
            create: false,
            render: {
                option: (data, escape) => {
                    let optionStyle = data.id === this.selectAllKey ? "font-weight: bold;" : "";
                    return '<div style="' + optionStyle + '">' +
                        '<span>' + escape(data.title) + '</span>' +
                        '</div>';
                }

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
            },
            onItemRemove: (value)=>this.handleItemRemove(value),
            onItemAdd: (value, $item)=>this.handleItemAdd(value, $item)
        });

    }

    handleItemAdd(value, $item) {
        let option = _.find(this.props.options,(o)=>{return o[this.state.valueField] === value});
        this.props.onAddSelectedItem && this.props.onAddSelectedItem(option || value);
    }
    handleItemRemove(value) {
        let option = _.find(this.props.options,(o)=>{return o[this.state.valueField] === value});
        this.props.onRemoveSelectedItem && this.props.onRemoveSelectedItem(option || value, (isAddBack)=>{
            if(isAddBack){
                this.addItem(value,false);
            }
        });
    }

    handleInitialize(){
        let inputElement = document.getElementById(this.state.id).nextElementSibling.querySelector("input");
        if(inputElement){
            inputElement.id = this.state.id + "-text";
        }
    }

    addItem(item, silent){
        if(this.selectize && this.selectize[0] && this.selectize[0].selectize){
            this.selectize[0].selectize.addItem(item,silent);
        }
    }
    removeItem(item, silent){
        if(this.selectize && this.selectize[0] && this.selectize[0].selectize){
            this.selectize[0].selectize.removeItem(item,silent);
        }
    }
    unloadSelectize(){
        if(this.selectize && this.selectize[0] && this.selectize[0].selectize){
            this.selectize[0].selectize.destroy();
        }
    }
    lockSelectize() {
        if (this.selectize && this.selectize[0] && this.selectize[0].selectize) {
            this.selectize[0].selectize.lock();
        }
    }
    unlockSelectize() {
        if (this.selectize && this.selectize[0] && this.selectize[0].selectize) {
            this.selectize[0].selectize.unlock();
        }
    }
    refreshSelectize() {
        if (this.selectize && this.selectize[0] && this.selectize[0].selectize) {
            this.selectize[0].selectize.refreshItems();
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
                    let selectedOption = _.find(options, (option) => {
                        return ("" + option[this.state.valueField]) === item
                    });
                    if(selectedOption){
                        result.push(selectedOption);
                    }
                });
                this.props.onchange(result);
            } else {
                this.props.onchange([]);
            }
        }
    };

    appendToSelectedValue(item, selectedValue) {
        if (item instanceof Object && item[this.state.valueField]) {
            selectedValue.push(item[this.state.valueField])
        } else {
            selectedValue.push(item);
        }
    }

    renderStandard() {

        this.props.lock ?  this.lockSelectize(): this.unlockSelectize();

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
                    return (<option key={option[this.state.valueField]}
                                    value={option[this.state.valueField]}>{this.props.translate ? super.translate(option[this.state.labelField]) : option[this.state.labelField] }</option>);
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
                            <option value="">{placeholder}</option>
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
                            <input type="text" autoComplete="off" tabIndex="" placeholder={placeholder}
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
                selectedValue += item[this.state.labelField];
            });
        } else {
            if(this.props.value != null){
                selectedValue = this.props.value[this.state.labelField];
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