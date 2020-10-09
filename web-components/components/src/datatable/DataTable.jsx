import React from 'react';
import PropTypes from 'prop-types';
import uuid from 'uuid';
import _ from 'lodash';

import {TranslatingComponent} from '../abstract/';
import {DataTableRow} from './DataTableRow';
import {DataTableHeaderRow} from './DataTableHeaderRow';
import {DataTableActionColumn} from './DataTableActionColumn';
import {DataTableGroupByRow} from './DataTableGroupByRow';
import {DataTableInsertRow} from './DataTableInsertRow';
import {DataTableFilterRow} from './DataTableFilterRow';
import {DataTableRowEditColumn} from './DataTableRowEditColumn';
import {Form, TextInput, Button} from '../basic';

/**
 * Grup satırlarında değerlerin önünde bir etiket görmek istiyorsak (örneğin 123 yerine Amount: 123)
 * groupByLabelHolder'ı kullanıyoruz.
 *
 * groupByLabelHolder örneği:
 *
 * groupBy'ın şöyle olduğunu varsayalım: ["id", "company.name", "status.code", "value"]
 *
 * groupByLabelHolder = {
 *      "id": "<etiket>",
 *      "company": {
 *          "name": "<etiket>"
 *      },
 *      "status": {
 *          "code": "<etiket>"
 *      },
 *      "value": "<etiket>"
 * }
 */
export class DataTable extends TranslatingComponent {

    constructor(props) {
        super(props);
        let id = this.props.id ? this.props.id : uuid.v4();
        this.state = {
            id: id + "-table",
            showFilterRow: this.props.filterable && this.props.showFilterRow,
            showInsertRow: this.props.insertable && this.props.showInsertRow,
            editingRow: null,
            selectedRows: [],
            hiddenGroup: []
        };
        this.moment = require('moment');
    };

    getColumns() {

        let columns = React.Children.toArray(this.props.children);

        if (this.props.editable || this.props.deletable) {
            if (this.props.formSettings && this.props.formSettings.showButtonsOnTheLeft) {
                columns.unshift(<DataTableRowEditColumn editable = {this.props.editable} deletable = {this.props.deletable} formSettings = {this.props.formSettings}/>);
            } else {
                columns.push(<DataTableRowEditColumn editable = {this.props.editable} deletable = {this.props.deletable} formSettings = {this.props.formSettings}/>);
            }
        }

        return columns;
    }

    componentDidMount() {

        let callback = () => {

            let $tablesorter = $("#" + this.state.id);

            // define pager options
            var pagerOptions = {
                // target the pager markup - see the HTML block below
                container: $(".ts_pager"),
                // output string - default is '{page}/{totalPages}'; possible variables: {page}, {totalPages}, {startRow}, {endRow} and {totalRows}
                output: '{startRow} - {endRow} / {filteredRows} ({totalRows})',
                // if true, the table will remain the same height no matter how many records are displayed. The space is made up by an empty
                // table row set to a height to compensate; default is false
                fixedHeight: true,
                // remove rows from the table to speed up the sort of large tables.
                // setting this to false, only hides the non-visible rows; needed if you plan to add/remove rows with the pager enabled.
                removeRows: false,
                // go to page selector - select dropdown that sets the current page
                cssGoto: '.ts_gotoPage'
            };

            let widgets = [];

            if (this.props.filterable) {
                widgets.push('filter');
            }

            let widgetOptions = {};
            if (this.props.filterable) {
                widgetOptions.filter_columnFilters = false;
                widgetOptions.filter_useParsedData = true;
                widgetOptions.filter_startsWith = true;
            }

            setTimeout(() => {
                $tablesorter.tablesorter({
                    theme: 'oneorder',
                    widthFixed: false,
                    widgets: widgets,
                    widgetOptions: widgetOptions,
                    resort: true,
                    sortReset: false,
                    sortLocaleCompare: true,
                    debug: this.props.debug,
                    dateFormat: "dd/MM/yyyy",
                    textExtraction: (node, table, cellIndex) => {
                        let $node = $(node);
                        return $node.attr('data-sort-value') || $node.text();
                    }
                })
                .bind('filterEnd', (event, config) => {
                    if(this.props.showRowCount){
                        this.setHeaderRowCount(config.filteredRows);
                    }
                });

                $.tablesorter.filter.types.startOther = function (config, data) {
                    if (data && data.iFilter && data.filters && data.rawArray) {
                        let filter = data.iFilter.toLocaleUpperCase("tr-TR");
                        let valueIndex = _.findIndex(data.filters, f => f && f.toLocaleUpperCase("tr-TR") == filter);
                        if (valueIndex != -1 && data.rawArray.length > valueIndex) {
                            let value = data.rawArray[valueIndex];
                            if (value && value.toLocaleUpperCase("tr-TR").startsWith(filter)) {
                                return true;
                            }
                        }
                    }

                    return null;
                };
            }, 300);
        };

        if (this.props.groupBy && this.props.groupBy.length > 0 && this.props.hideGroupContents === true) {

            let hiddenGroup = [];
            let groupIndexArray = [];
            let groupedData = this.groupData(this.props.groupBy, this.props.data, this.props.groupByLabelHolder);
            this.generateGroupIndexArray(groupIndexArray, groupedData);

            groupIndexArray.forEach((groupIndex) => {
                hiddenGroup.push(groupIndex);
            });

            this.setState({hiddenGroup: hiddenGroup}, callback);

        } else {
            callback();
        }

        if(this.props.showRowCount && !this.props.filterable){
            this.setHeaderRowCountWithData(this.props.data);
        }

        this.setUpDoubleHorizontalScrollbar();
    }

    componentDidUpdate(prevProps, prevState) {

        let triggerSortReset = false;

        if (this.props.groupBy && this.props.groupBy.length > 0) {
            triggerSortReset = true;
        }

        setTimeout(() => {

            let $tablesorter = $("#" + this.state.id);

            $tablesorter.trigger( 'update', [ true, (table) => {} ] );

            if (this.filterRowReference) {
                $tablesorter.trigger('search', [this.filterRowReference.getFilter()]);
            }

            // Bu bölümü neden ekledik? Şundan dolayı: Bir sütuna tıklayıp tabloyu sıraladığımızda ve daha sonra
            // groupBy verdiğimizde alt gruplar (eğer varsa) ve asıl veriyi içeren satırlar üstte çıkıyor.
            // Bu durum belki başka birşeyin yan etkisidir, sebebini tam olarak bulamadık. Aşağıdaki bölüm
            // sıralamayı sıfırladığından bahsettiğimiz durum oluşmuyor.
            if (triggerSortReset) {
                $tablesorter.trigger('sortReset');
            }

        }, 100);

        this.setUpDoubleHorizontalScrollbar();
    }

    componentWillReceiveProps(nextProps) {

        if (!_.isEqual(this.props.data, nextProps.data)
            || !_.isEqual(this.props.groupBy, nextProps.groupBy)
            || !_.isEqual(this.props.hideGroupContents, nextProps.hideGroupContents)) {

            let hiddenGroup = [];

            if (nextProps.groupBy && nextProps.groupBy.length > 0 && nextProps.hideGroupContents === true) {

                let groupIndexArray = [];
                let groupedData = this.groupData(nextProps.groupBy, nextProps.data, nextProps.groupByLabelHolder);
                this.generateGroupIndexArray(groupIndexArray, groupedData);

                groupIndexArray.forEach((groupIndex) => {
                    hiddenGroup.push(groupIndex);
                });
            }

            this.setState({hiddenGroup: hiddenGroup});
        }

        if(nextProps.showRowCount && !nextProps.filterable){
            this.setHeaderRowCountWithData(nextProps.data);
        }


    }

    setUpDoubleHorizontalScrollbar() {

        if (this.props.doubleHorizontalScrollbar === true) {

            setTimeout(() => {

                let tableId = this.state.id;

                let table = $("#" + tableId);
                let equivalentOfTable = $("#" + "equivalentOf-" + tableId);

                equivalentOfTable.width(table.width());

                let parentOfTable = $("#" + "parentOf-" + tableId);
                let parentOfEquivalentOfTable = $("#" + "parentOf-equivalentOf-" + tableId);

                parentOfTable.scroll(() => {
                    parentOfEquivalentOfTable.scrollLeft(parentOfTable.scrollLeft());
                });

                parentOfEquivalentOfTable.scroll(() => {
                    parentOfTable.scrollLeft(parentOfEquivalentOfTable.scrollLeft());
                });

            }, 500);
        }
    }

    setHeaderRowCountWithData(data){
        let count = data && _.isArray(data) ? data.length : 0;
        let text = "";
        if(count){
            text = count + " " + super.translate("row(s)");
        }
        this.writeRowCountText(text);
    }
    setHeaderRowCount(count){
        let text = "";
        if(count){
            //filterEnd event send count=1 for "no data to display" row, we have to make sure props.data has elements..
            if(this.props.data && this.props.data.length > 0){
                text = count + " " + super.translate("row(s)");
            }
        }
        this.writeRowCountText(text);
    }
    writeRowCountText(text){
        let $rowCount = $("#" + this.state.id + "-rowcount");
        if($rowCount){
            $rowCount.text(text);
        }
    }

    /**
     * DİKKAT: Bu metod, renderGroupedDataRows metodu baz alınarak oluşturuldu.
     * renderGroupedDataRows metodundaki newLevel ve uniqueIndex değerlerinin oluşturulma mantığı
     * burada aynen kullanıldı.
     */
    generateGroupIndexArray(groupIndexArray, groupedData, level, groupIndex) {
        let newLevel = level ? level + 1 : 1;
        Object.keys(groupedData).forEach((key, index) => {
            let uniqueIndex = groupIndex ? (groupIndex + "." + index) : ("" + index);
            groupIndexArray.push(uniqueIndex);
            if (!_.isArray(groupedData[key])) {
                this.generateGroupIndexArray(groupIndexArray, groupedData[key], newLevel, uniqueIndex);
            }
        });
    }

    componentWillUnmount(){
        $.tablesorter.destroy($("#" + this.state.id), true, (table) => {});
    }

    isGroupByEnabled(){
        return (this.props.groupBy && this.props.groupBy.length > 0);
    }

    isSortByEnabled(){
        return (this.props.sortBy && this.props.sortBy.length > 0);
    }

    handleToggleInsertFormClick(e){
        e.preventDefault();
        this.toggleInsertRow();
    }
    toggleInsertRow(){
        let showInsertRow = !this.state.showInsertRow;
        this.setState({showInsertRow: showInsertRow});
        if(showInsertRow){
            this.props.oneditbegin && this.props.oneditbegin();
        }
    }
    handleToggleFilterClick(e){
        e.preventDefault();
        this.toggleFilterRow();
    }
    toggleFilterRow(){
        this.setState({showFilterRow: !this.state.showFilterRow});
    }
    handleRowCreate(data){
        data._key = uuid.v4();
        this.setState({showInsertRow:false}, ()=>this.setState({showInsertRow:true}));
        this.props.oncreate && this.props.oncreate(data);
    }
    handleRowUpdate(data){
        this.setState({editingRow: null});
        this.props.onupdate && this.props.onupdate(data);
    }
    handleRowDelete(data){
        this.props.ondelete && this.props.ondelete(data);
    }
    handleEditBegin(row){
        this.setState({editingRow: row});
        this.props.oneditbegin && this.props.oneditbegin();
    }
    handleEditCancel(row){
        this.setState({editingRow: null});
    }

    handleColumnFilter(filter){
        let $tablesorter = $("#" + this.state.id);
        $tablesorter.trigger('search', [filter]);
    }

    handleRowClick(data){
        let selectedRows = _.cloneDeep(this.props.selectedRows);

        if (!selectedRows) {
            selectedRows = [];
        }

        let index = _.findIndex(selectedRows, {_key: data._key});
        if(index >= 0){
            selectedRows.splice(index, 1);
        }else{
            selectedRows.push(data);
        }
        this.props.onrowclick && this.props.onrowclick(selectedRows);
    }

    handleRowMouseEnter(data){
        this.props.onrowmouseenter && this.props.onrowmouseenter(data);
    }

    isRowSelected(row){
        return _.find(this.props.selectedRows, {_key: row._key}) && true;
    }


    groupBy(data, group, groupByLabelHolder){
        let groupedData = {};

        data.forEach(row => {
            let groupByLabel = "";
            if (groupByLabelHolder) {
                groupByLabel = _.get(groupByLabelHolder, group) + ": ";
            }
            let groupKey = _.isFunction(group) ? group(row) : groupByLabel + _.get(row, group);
            if(!groupedData[groupKey]){
                groupedData[groupKey] = [];
            }
            groupedData[groupKey].push(row);
        });

        return groupedData;

    }

    iterateGroups(group, data, groupByLabelHolder){
        if(_.isArray(data)){
            data = this.groupBy(data, group, groupByLabelHolder);
        }else{
            Object.keys(data).forEach(key => {
                data[key] = this.iterateGroups(group, data[key], groupByLabelHolder);
            });
        }
        return data;
    }
    groupData(groupBy, data, groupByLabelHolder) {
        let groupData = data;
        groupBy.forEach(eachGroup => {
            groupData = this.iterateGroups(eachGroup, groupData, groupByLabelHolder);
        });
        return groupData;
    }

    sort(arr){
        return _.sortBy(arr, this.props.sortBy);
    }

    sortData(data){
        if(_.isArray(data)){
            return this.sort(data);
        }else{
            Object.keys(data).forEach(key => {
                data[key] = this.sortData(data[key]);
            });
            return data;
        }
    }

    renderHeader(columns){
        return(
            <thead>
            <DataTableHeaderRow tableFilterable = {this.props.filterable}
                                tableSortable = {this.props.sortable && !this.isGroupByEnabled()}
                                columns = {columns}/>
            </thead>
        );
    }

    renderDataRows(columns, data){
        let rowIndex=-1;
        return data.map(row => {
            if(!row._key){
                row._key = uuid.v4();
            }
            let disabled = this.props.onDisabledCheck && this.props.onDisabledCheck(row);
            rowIndex++;
            return <DataTableRow key = {row._key}
                                 data = {row}
                                 columns = {columns}
                                 editable = {this.props.editable}
                                 editing = {this.state.editingRow != null && row._key == this.state.editingRow._key}
                                 selected = {this.isRowSelected(row)}
                                 onsave = {(data) => this.handleRowUpdate(data)}
                                 oneditbegin = {() => this.handleEditBegin(row)}
                                 oneditcancel = {() => this.handleEditCancel(row)}
                                 ondelete = {() => this.handleRowDelete(row)}
                                 onrowclick = {(data) => this.handleRowClick(data)}
                                 onrowmouseenter = {(data) => this.handleRowMouseEnter(data)}
                                 disabled = {disabled}
                                 rowIndex = {rowIndex}/>
        });
    }
    showHideGroup(value) {
        let hiddenGroup = _.cloneDeep(this.state.hiddenGroup);
        if (_.find(hiddenGroup, (v) => {return v == value})) {
            _.remove(hiddenGroup, (v) => {return v == value});
        } else {
            hiddenGroup.push(value);
        }
        this.setState({hiddenGroup: hiddenGroup});
    }

    /**
     * DİKKAT: Bu metodtaki newLevel ve uniqueIndex değerlerinin oluşturulma mantığı değiştirildiğinde
     * generateGroupIndexArray metodundaki mantık da değiştirilmeli.
     */
    renderGroupedDataRows(columns, groupedData, level, groupIndex){
        let rows = [];
        let newLevel = level ? level + 1 : 1;
        let dataCount = 0;
        Object.keys(groupedData).forEach((key, index) => {
            let uniqueIndex = groupIndex ? (groupIndex + "." + index) : ("" + index);

            let isHidden = _.find(this.state.hiddenGroup, (v) => {return v === uniqueIndex});

            if(newLevel===1){
                //hide
            }

            if (_.isArray(groupedData[key])) {
                let dataRows = this.renderDataRows(columns, groupedData[key]);
                dataCount += dataRows.length;
                rows.push(<DataTableGroupByRow key={uniqueIndex}
                                               columnsLength={columns.length}
                                               rowLength={dataRows.length}
                                               isHidden={isHidden}
                                               level={newLevel}
                                               value={key}
                                               onclick={() => this.showHideGroup(uniqueIndex)}/>);
                if(!isHidden) {
                    rows = rows.concat(dataRows);
                }
            } else {
                let groupRows = this.renderGroupedDataRows(columns, groupedData[key], newLevel, uniqueIndex);
                dataCount += groupRows.dataCount;
                rows.push(<DataTableGroupByRow key={uniqueIndex}
                                               columnsLength={columns.length}
                                               rowLength={groupRows.dataCount}
                                               isHidden={isHidden}
                                               level={newLevel}
                                               value={key}
                                               onclick={() => this.showHideGroup(uniqueIndex)}/>);
                if(!isHidden) {
                    rows = rows.concat(groupRows.rows);
                }
            }
        });
        return {rows: rows, dataCount: dataCount};
    }

    renderBody(columns){
        let rows = <tr><td colSpan = {columns.length}>{this.state.showInsertRow ? "" : super.translate("No data to display")}</td></tr>;
        if(this.props.data && this.props.data.length > 0){
            if(this.isGroupByEnabled()){
                let groupedData = this.groupData(this.props.groupBy, this.props.data, this.props.groupByLabelHolder);
                if(this.isSortByEnabled()){
                    groupedData = this.sortData(groupedData);
                }
                rows = this.renderGroupedDataRows(columns, groupedData).rows;
            }else{
                let sortedData = this.props.data;
                if(this.isSortByEnabled()){
                    sortedData = this.sortData(sortedData);
                }
                rows = this.renderDataRows(columns, sortedData);
            }
        }
        return(
            <tbody>
            {rows}
            </tbody>
        );
    }
    renderInsertRow(columns){

        let insertRow = null;
        if(this.props.insertable){
            insertRow = <tbody className="tablesorter-infoOnly">
            <DataTableInsertRow columns = {columns}
                                onsave = {(data) => this.handleRowCreate(data)}
                                visible = {this.state.showInsertRow}/>
            </tbody>;
        }
        return (insertRow);
    }
    renderFilterRow(columns){
        let filterRow = null;
        if(this.props.filterable){
            filterRow = <tbody className="tablesorter-filter-row tablesorter-infoOnly">
            <DataTableFilterRow ref={(c) => this.filterRowReference = c}
                                columns = {columns}
                                onfilter = {(filter) => this.handleColumnFilter(filter)}
                                visible = {this.state.showFilterRow}/>
            </tbody>;
        }
        return (filterRow);
    }

    renderToolbar(){
        let toggleInsertForm = "";
        let toggleFilterFields = "";
        if(this.props.insertable){
            toggleInsertForm = <Button flat = {true} onclick = {(e) => this.handleToggleInsertFormClick(e)} icon = "plus" active={this.state.showInsertRow}/>;
        }
        if(this.props.filterable){
            toggleFilterFields = <Button flat = {true} onclick = {(e) => this.handleToggleFilterClick(e)} icon = "filter" active={this.state.showFilterRow}/>;
        }
        let title = "";
        if(this.props.title){
            title = this.props.title;
        }
        let rowCount = null;
        if(this.props.showRowCount){
            rowCount = <span className="uk-margin-left uk-text-small uk-text-italic" id={this.state.id + "-rowcount"}/>;
        }

        let caption = null;
        if(title || toggleInsertForm || toggleFilterFields){
            caption =
                <caption className="table-caption">
                    <div className="table-caption-toolbar">
                        {toggleInsertForm}
                        {toggleFilterFields}
                    </div>
                    <h3 className="table-toolbar-title">
                        {super.translate(title)}
                        {rowCount}
                    </h3>
                </caption>;
        }
        return caption;
    }

    /**
     * Bir footerRow içinde kaç tane column olmalı, veya bir başka deyişle bir footerRow içindeki column'ların colSpan değerlerinin toplamı ne olmalı?
     * {datatable'daki column sayısı (action column'lar dahil)} + {datatable.editable veya datatable.deletable ise 1}
     */
    renderFooter() {

        let footerRows = this.props.footerRows;

        if (footerRows && footerRows.length > 0) {

            let rows = [];

            footerRows.forEach((footerRow, footerRowIndex) => {

                let columns = [];

                footerRow.columns.forEach((footerColumn, footerColumnIndex) => {
                    columns.push(
                        <td key={this.state.id + "-footerRow" + footerRowIndex + "-footerColumn" + footerColumnIndex} colSpan={footerColumn.colSpan}>
                            {footerColumn.content}
                        </td>
                    );
                });

                rows.push(
                    <tr key={this.state.id + "-footerRow" + footerRowIndex}>
                        {columns}
                    </tr>
                );
            });

            /**
             * Aşağıda neden tfoot yerine tbody kullandık? tfoot kullandığımızda yukarından gelen stil (sanırız uk-table'dan geliyor) thead gibi oluyor.
             * Font color ve border, thead'te olduğu gibi görünüyor. Footer'ın tbody gibi görünmesi görsel açıdan daha güzel duruyor.
             * Not: Bir table içinde birden fazla tbody olması HTML açısından geçerli bir durum.
             */
            return (
                <tbody>
                {rows}
                </tbody>
            );

        } else {
            return null;
        }
    }

    render(){
        let containerClassName = "uk-overflow-container";
        if(this.props.noOverflow){
            containerClassName = "";
        }
        let tableClassName = "uk-table uk-table-nowrap uk-table-condensed tablesorter tablesorter-oneorder";
        if(this.props.centerText){
            tableClassName += " uk-text-center";
        }
        let overflowStyle = {};
        if(this.props.height){
            overflowStyle = {height: this.props.height}
        }
        let topScrollbar = null;
        if (this.props.doubleHorizontalScrollbar === true) {
            topScrollbar = (
                <div id={"parentOf-equivalentOf-" + this.state.id} className="uk-overflow-container">
                    <div id={"equivalentOf-" + this.state.id}>
                        &nbsp;
                    </div>
                </div>
            );
        }
        let columns = this.getColumns();
        return(
            <Form ref = {(c) => this.form = c}>
                {topScrollbar}
                <div id={"parentOf-" + this.state.id} className={containerClassName} style={overflowStyle}>
                    <table id={this.state.id} className={tableClassName}>
                        {this.renderToolbar()}
                        {this.renderHeader(columns)}
                        {this.renderFilterRow(columns)}
                        {this.renderInsertRow(columns)}
                        {this.renderBody(columns)}
                        {this.renderFooter()}
                    </table>
                </div>
            </Form>
        );
    }
}
DataTable.contextTypes = {
    translator: PropTypes.object
};