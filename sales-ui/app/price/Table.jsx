import React from 'react';
import { Notify, ReadOnlyDropDown, TextInput } from 'susam-components/basic';
import { OverflowContainer } from 'susam-components/layout';
import { EnumUtils } from 'susam-components/utils';
import { PricingRuleService } from '../services';
import { Price } from './Price';

export class Table extends React.Component {

    state = {};

    constructor(props) {
        super(props);
        PricingRuleService.listLookups("rule-type", { group: "PRICE" }).then(response => {
            this.setState({ ruleTypes: response.data });
        }).catch(error => Notify.showError(error));
    }

    findPrice(row, column) {
        let { priceTable, findPrice } = this.props;
        if (findPrice) {
            let price = findPrice(priceTable.prices, row, column);
            return _.defaultTo(price, {});
        }
        return null;
    }

    handlePriceUpdate(price) {
        let { onPriceUpdate } = this.props;
        onPriceUpdate && onPriceUpdate(price);
    }

    handlePriceRuleTypeChange(value, row, columns) {
        let prices = [];
        columns.forEach(column => {
            let price = this.findPrice(row, column);
            if (price) {
                price.ruleType = value;
                prices.push(price);
            }
        })
        this.handlePriceUpdate(prices);
    }

    handleEditClick(editColumn) {
        this.setState({ editColumn })
    }

    isEdit(column) {
        return this.props.isEditableColumnHeader && (_.isNil(column.id) || _.isEqual(column, this.state.editColumn));
    }

    render() {
        let { priceTable, readOnly, ruleTypeVisible, isEditableColumnHeader } = this.props;
        let { onAddClick, onDeleteClick, onSaveClick } = this.props;
        if (!priceTable || _.isEmpty(priceTable.prices)) {
            return <span>There is no price table. </span>
        } else {
            let columnHeaders = _.orderBy(priceTable.columnHeaders, ["name"]);
            return (
                <OverflowContainer ref={c => this.overflowContainer = c} minHeight={300}>
                    <table className="uk-table uk-table-hover uk-table-nowrap uk-table-align-vertical">
                        <thead>
                            <tr>
                                <th className="uk-width-1-10 uk-text-center md-bg-grey-100 uk-text-small">{_.defaultTo(priceTable.firstCellText, 'PW')}</th>
                                {columnHeaders.map((column, index) =>
                                    <EditableColumn key={index}
                                        isEditable={isEditableColumnHeader}
                                        readOnly={readOnly}
                                        isEdit={this.isEdit(column)}
                                        column={column}
                                        onEditClick={editColumn => this.handleEditClick(editColumn)}
                                        onDeleteClick={onDeleteClick}
                                        onSaveClick={onSaveClick} />)}
                                {!readOnly && onAddClick &&
                                    <th>
                                        <a href="javascript:;" onClick={() => onAddClick()}><i className="material-icons uk-text-success uk-text-bold">add</i></a>
                                    </th>}
                            </tr>
                        </thead>
                        <tbody>
                            {priceTable.rowHeaders.map((row, rowIndex) => {
                                let ruleTypes = new Set();
                                let columns = columnHeaders.map((column, columnIndex) => {
                                    let columnData = this.findPrice(row, column);
                                    if (ruleTypeVisible) {
                                        let ruleType = _.get(columnData, 'ruleType.code')
                                        ruleType && ruleTypes.add(ruleType);
                                    }
                                    return (
                                        <td key={`${rowIndex}-${columnIndex}`} className="uk-text-center">
                                            <Price readOnly={readOnly || column.new}
                                                currency={priceTable.currency}
                                                price={columnData}
                                                onchange={price => this.handlePriceUpdate(price)} />
                                        </td>)
                                });
                                let rowHeader = (<td className="md-bg-grey-100 uk-text-small uk-text-center">
                                    {row.name}
                                    {ruleTypeVisible && <ReadOnlyDropDown
                                        value={EnumUtils.enumHelper(ruleTypes.values().next().value)}
                                        onchange={value => this.handlePriceRuleTypeChange(value, row, priceTable.columnHeaders)}
                                        options={this.state.ruleTypes} appendToBody={true} readOnly={readOnly} />}
                                </td>)
                                return (
                                    <tr key={rowIndex}>
                                        {rowHeader}
                                        {columns}
                                    </tr>)
                            })}
                        </tbody>
                    </table>
                </OverflowContainer>
            );
        }
    }
}

class EditableColumn extends React.Component {

    state = {
        column: {}
    };

    componentDidMount() {
        this.setState({ column: this.props.column });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isEdit !== this.props.isEdit && this.props.isEdit) {
            this.setState({ column: this.props.column })
        }
    }

    handleChange(name) {
        this.setState(prevState => {
            prevState.column.name = name
            return prevState;
        })
    }

    render() {
        let { column, isEdit, readOnly, isEditable } = this.props;
        let { onEditClick, onDeleteClick, onSaveClick } = this.props;
        let { name } = this.state.column;
        if (isEditable && !readOnly && isEdit) {
            return (<th>
                <TextInput value={name} onchange={name => this.handleChange(name)} button={{ style: 'primary', icon: "save", onclick: () => onSaveClick && onSaveClick(this.state.column) }} />
            </th>);
        }
        return (<th style={{ whiteSpace: "pre-wrap" }} className="uk-text-center md-bg-grey-100 uk-text-small">
            {column.name}
            <span style={{ float: "right" }}>
                {!readOnly && onSaveClick && <a href="javascript:;" style={{ padding: "0 6px" }} onClick={() => onEditClick(column)}><i className="material-icons uk-text-success">edit</i></a>}
                {!readOnly && onDeleteClick && <a href="javascript:;" style={{ padding: "0 6px" }} onClick={() => onDeleteClick(column)}><i className="material-icons uk-text-danger">delete</i></a>}
            </span>
        </th>);
    }
}