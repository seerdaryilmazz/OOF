import React from 'react';
import uuid from 'uuid';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {TranslatingComponent} from '../../abstract/';

import {EditWrapper} from '../wrappers/EditWrapper'
import {FilterWrapper} from '../wrappers/FilterWrapper'

export class Column extends TranslatingComponent{
    constructor(props) {
        super(props);
        this.id = uuid.v4();
    }

    componentDidMount(){
        $.tablesorter.addParser(this.formatter.tableParser());
    }
    componentDidUpdate(){
        
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.reRender){
            if(!_.isEqual(nextProps.printer, this.props.printer)){
                this.printer = nextProps.printer;
            }
            if(!_.isEqual(nextProps.reader, this.props.reader)){
                this.reader = nextProps.reader;
            }
        }
    }
    updateData(value){
        this.props.ondataupdate && this.props.ondataupdate(value);
    }
    updateFilterData(value){
        this.props.onfilterupdate && this.props.onfilterupdate(value);
    }

    getEditComponents(){
        let wrapper = null;
        React.Children.forEach(this.props.children, child => {
            if(child.type == EditWrapper){
                wrapper = child;
            }
        });
        if(wrapper){
            return React.Children.toArray(wrapper.props.children);
        }else{
            return [this.defaultEditComponent];
        }
    }
    getFilterComponents(){
        let wrapper = null;
        React.Children.forEach(this.props.children, child => {
            if(child.type == FilterWrapper){
                wrapper = child;
            }
        });
        if(wrapper) {
            return [wrapper];
        }else{
            return [this.defaultFilterComponent];
        }
    }

    getAlignmentClassName() {

        let className = "";

        if (this.props.left === true) {
            className = "uk-text-left";
        } else if (this.props.right === true) {
            className = "uk-text-right";
        } else if (this.props.center === true) {
            className = "uk-text-center";
        }

        return className;
    }

    appendAlignmentClassName(existingClassNames) {

        let newClassName = this.getAlignmentClassName();

        if (!_.isNil(existingClassNames) && existingClassNames.length > 0) {
            return existingClassNames + " " + newClassName;
        } else {
            return newClassName;
        }
    }

    renderHeaderCell(){
        let className = "";
        let filterable = (this.props.filterable && this.props.tableFilterable);
        if(!filterable){
            className += " filter-false";
        }
        let sortable = (this.props.sortable && this.props.tableSortable);
        if(!sortable){
            className += " sorter-false";
        }else{
            if(this.formatter){
                className += " sorter-" + this.formatter.id;
            }
        }

        className = this.appendAlignmentClassName(className);

        let width = this.props.width ? this.props.width + "%" : "";

        let headerContent;

        if (this.props.translateHeader === false) {
            headerContent = this.props.header;
        } else {
            headerContent = super.translate(this.props.header);
        }

        // Başlıklar çok satırlı olduğunda "verticalAlign: top" tüm başıkların hizalı görünmesini sağlıyor, bundan dolayı ekledik.
        return <th style={{verticalAlign: "top"}} className={className} width={width}>{headerContent}</th>;
    }
    renderDataCell(row, formattedData) {
        if (this.printer.printUsingRow) {
            return this.printer.printUsingRow(row, formattedData);
        } else {
            return this.printer.print(formattedData);
        }
    }
    renderEditCell(unformattedData){
        let components = this.getEditComponents().map(component => {
            return React.cloneElement(component,
                {
                    rowData: this.props.data,
                    key: this.id,
                    value: unformattedData,
                    validationGroup: this.props.validationGroup,
                    required: this.props.required,
                    appendToBody: true,
                    onchange: (value) => this.updateData(value)
                });
        });
        return components;
    }
    renderFilterCell(){
        let components = this.getFilterComponents().map(component => {
            return React.cloneElement(component,
                {
                    key: this.id,
                    value: this.props.filterData,
                    onchange: (value) => this.updateFilterData(value)
                });
        });
        return <td className="">{components}</td>;
    }

    render(){
        if(this.props.isHeader){
           return this.renderHeaderCell();
        }else if(this.props.isFilter){
            return this.renderFilterCell();
        }else {
            if(!this.props.data){
                return null;
            }
            let unformattedData = this.reader.readCellValue(this.props.data);
            if (!unformattedData && this.props.defaultValue) {
                unformattedData = this.props.defaultValue;
            }
            if(this.props.isInsert){
                return <td className={this.getAlignmentClassName()}>{this.renderEditCell(unformattedData)}</td>;
            }
            let sortValue = this.reader.readSortValue(this.props.data);
            if (this.props.isEdit) {
                if(this.props.editable !== false){
                    return <td data-sort-value={sortValue} className={this.getAlignmentClassName()}>{this.renderEditCell(unformattedData)}</td>;
                }
            }
            if (this.props.translator) {
                if (_.isObject(unformattedData)) {
                    if (_.has(unformattedData, "text")) {
                        let text = _.get(unformattedData, "text");
                        _.set(unformattedData, "text", this.props.translator.translate(text));
                    }
                } else {
                    unformattedData = this.props.translator.translate(unformattedData);
                }
            }
            let formattedData = this.formatter.format(unformattedData);
            let classNames = ["uk-vertical-align"];
            if(this.props.classNameProvider){
                classNames.push(this.props.classNameProvider.classNames(unformattedData));
            }
            if(this.props.textBreak){
                classNames.push("uk-text-break");
            }
            if(this.props.uppercase){
                classNames.push("uk-text-upper");
            }
            if(this.props.center){
                classNames.push("uk-text-center");
            }
            if(this.props.disabled){
                classNames.push("opacity-disabled");
            }
            return <td className={classNames.join(" ")} style={this.props.style} data-sort-value={sortValue}>{this.renderDataCell(this.props.data, formattedData)}</td>;
        }
    }

}

Column.contextTypes = {
    translator: PropTypes.object
};