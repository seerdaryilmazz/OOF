'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataTable = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _abstract = require('../abstract/');

var _DataTableRow = require('./DataTableRow');

var _DataTableHeaderRow = require('./DataTableHeaderRow');

var _DataTableActionColumn = require('./DataTableActionColumn');

var _DataTableGroupByRow = require('./DataTableGroupByRow');

var _DataTableInsertRow = require('./DataTableInsertRow');

var _DataTableFilterRow = require('./DataTableFilterRow');

var _DataTableRowEditColumn = require('./DataTableRowEditColumn');

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
var DataTable = exports.DataTable = function (_TranslatingComponent) {
    _inherits(DataTable, _TranslatingComponent);

    function DataTable(props) {
        _classCallCheck(this, DataTable);

        var _this = _possibleConstructorReturn(this, (DataTable.__proto__ || Object.getPrototypeOf(DataTable)).call(this, props));

        var id = _this.props.id ? _this.props.id : _uuid2.default.v4();
        _this.state = {
            id: id + "-table",
            showFilterRow: _this.props.filterable && _this.props.showFilterRow,
            showInsertRow: _this.props.insertable && _this.props.showInsertRow,
            editingRow: null,
            selectedRows: [],
            hiddenGroup: []
        };
        _this.moment = require('moment');
        return _this;
    }

    _createClass(DataTable, [{
        key: 'getColumns',
        value: function getColumns() {

            var columns = _react2.default.Children.toArray(this.props.children);

            if (this.props.editable || this.props.deletable) {
                if (this.props.formSettings && this.props.formSettings.showButtonsOnTheLeft) {
                    columns.unshift(_react2.default.createElement(_DataTableRowEditColumn.DataTableRowEditColumn, { editable: this.props.editable, deletable: this.props.deletable, formSettings: this.props.formSettings }));
                } else {
                    columns.push(_react2.default.createElement(_DataTableRowEditColumn.DataTableRowEditColumn, { editable: this.props.editable, deletable: this.props.deletable, formSettings: this.props.formSettings }));
                }
            }

            return columns;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var callback = function callback() {

                var $tablesorter = $("#" + _this2.state.id);

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

                var widgets = [];

                if (_this2.props.filterable) {
                    widgets.push('filter');
                }

                var widgetOptions = {};
                if (_this2.props.filterable) {
                    widgetOptions.filter_columnFilters = false;
                    widgetOptions.filter_useParsedData = true;
                    widgetOptions.filter_startsWith = true;
                }

                setTimeout(function () {
                    $tablesorter.tablesorter({
                        theme: 'oneorder',
                        widthFixed: false,
                        widgets: widgets,
                        widgetOptions: widgetOptions,
                        resort: true,
                        sortReset: false,
                        sortLocaleCompare: true,
                        debug: _this2.props.debug,
                        dateFormat: "dd/MM/yyyy",
                        textExtraction: function textExtraction(node, table, cellIndex) {
                            var $node = $(node);
                            return $node.attr('data-sort-value') || $node.text();
                        }
                    }).bind('filterEnd', function (event, config) {
                        if (_this2.props.showRowCount) {
                            _this2.setHeaderRowCount(config.filteredRows);
                        }
                    });

                    $.tablesorter.filter.types.startOther = function (config, data) {
                        if (data && data.iFilter && data.filters && data.rawArray) {
                            var filter = data.iFilter.toLocaleUpperCase("tr-TR");
                            var valueIndex = _lodash2.default.findIndex(data.filters, function (f) {
                                return f && f.toLocaleUpperCase("tr-TR") == filter;
                            });
                            if (valueIndex != -1 && data.rawArray.length > valueIndex) {
                                var value = data.rawArray[valueIndex];
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

                var hiddenGroup = [];
                var groupIndexArray = [];
                var groupedData = this.groupData(this.props.groupBy, this.props.data, this.props.groupByLabelHolder);
                this.generateGroupIndexArray(groupIndexArray, groupedData);

                groupIndexArray.forEach(function (groupIndex) {
                    hiddenGroup.push(groupIndex);
                });

                this.setState({ hiddenGroup: hiddenGroup }, callback);
            } else {
                callback();
            }

            if (this.props.showRowCount && !this.props.filterable) {
                this.setHeaderRowCountWithData(this.props.data);
            }

            this.setUpDoubleHorizontalScrollbar();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps, prevState) {
            var _this3 = this;

            var triggerSortReset = false;

            if (this.props.groupBy && this.props.groupBy.length > 0) {
                triggerSortReset = true;
            }

            setTimeout(function () {

                var $tablesorter = $("#" + _this3.state.id);

                $tablesorter.trigger('update', [true, function (table) {}]);

                if (_this3.filterRowReference) {
                    $tablesorter.trigger('search', [_this3.filterRowReference.getFilter()]);
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
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {

            if (!_lodash2.default.isEqual(this.props.data, nextProps.data) || !_lodash2.default.isEqual(this.props.groupBy, nextProps.groupBy) || !_lodash2.default.isEqual(this.props.hideGroupContents, nextProps.hideGroupContents)) {

                var hiddenGroup = [];

                if (nextProps.groupBy && nextProps.groupBy.length > 0 && nextProps.hideGroupContents === true) {

                    var groupIndexArray = [];
                    var groupedData = this.groupData(nextProps.groupBy, nextProps.data, nextProps.groupByLabelHolder);
                    this.generateGroupIndexArray(groupIndexArray, groupedData);

                    groupIndexArray.forEach(function (groupIndex) {
                        hiddenGroup.push(groupIndex);
                    });
                }

                this.setState({ hiddenGroup: hiddenGroup });
            }

            if (nextProps.showRowCount && !nextProps.filterable) {
                this.setHeaderRowCountWithData(nextProps.data);
            }
        }
    }, {
        key: 'setUpDoubleHorizontalScrollbar',
        value: function setUpDoubleHorizontalScrollbar() {
            var _this4 = this;

            if (this.props.doubleHorizontalScrollbar === true) {

                setTimeout(function () {

                    var tableId = _this4.state.id;

                    var table = $("#" + tableId);
                    var equivalentOfTable = $("#" + "equivalentOf-" + tableId);

                    equivalentOfTable.width(table.width());

                    var parentOfTable = $("#" + "parentOf-" + tableId);
                    var parentOfEquivalentOfTable = $("#" + "parentOf-equivalentOf-" + tableId);

                    parentOfTable.scroll(function () {
                        parentOfEquivalentOfTable.scrollLeft(parentOfTable.scrollLeft());
                    });

                    parentOfEquivalentOfTable.scroll(function () {
                        parentOfTable.scrollLeft(parentOfEquivalentOfTable.scrollLeft());
                    });
                }, 500);
            }
        }
    }, {
        key: 'setHeaderRowCountWithData',
        value: function setHeaderRowCountWithData(data) {
            var count = data && _lodash2.default.isArray(data) ? data.length : 0;
            var text = "";
            if (count) {
                text = count + " " + _get(DataTable.prototype.__proto__ || Object.getPrototypeOf(DataTable.prototype), 'translate', this).call(this, "row(s)");
            }
            this.writeRowCountText(text);
        }
    }, {
        key: 'setHeaderRowCount',
        value: function setHeaderRowCount(count) {
            var text = "";
            if (count) {
                //filterEnd event send count=1 for "no data to display" row, we have to make sure props.data has elements..
                if (this.props.data && this.props.data.length > 0) {
                    text = count + " " + _get(DataTable.prototype.__proto__ || Object.getPrototypeOf(DataTable.prototype), 'translate', this).call(this, "row(s)");
                }
            }
            this.writeRowCountText(text);
        }
    }, {
        key: 'writeRowCountText',
        value: function writeRowCountText(text) {
            var $rowCount = $("#" + this.state.id + "-rowcount");
            if ($rowCount) {
                $rowCount.text(text);
            }
        }

        /**
         * DİKKAT: Bu metod, renderGroupedDataRows metodu baz alınarak oluşturuldu.
         * renderGroupedDataRows metodundaki newLevel ve uniqueIndex değerlerinin oluşturulma mantığı
         * burada aynen kullanıldı.
         */

    }, {
        key: 'generateGroupIndexArray',
        value: function generateGroupIndexArray(groupIndexArray, groupedData, level, groupIndex) {
            var _this5 = this;

            var newLevel = level ? level + 1 : 1;
            Object.keys(groupedData).forEach(function (key, index) {
                var uniqueIndex = groupIndex ? groupIndex + "." + index : "" + index;
                groupIndexArray.push(uniqueIndex);
                if (!_lodash2.default.isArray(groupedData[key])) {
                    _this5.generateGroupIndexArray(groupIndexArray, groupedData[key], newLevel, uniqueIndex);
                }
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            $.tablesorter.destroy($("#" + this.state.id), true, function (table) {});
        }
    }, {
        key: 'isGroupByEnabled',
        value: function isGroupByEnabled() {
            return this.props.groupBy && this.props.groupBy.length > 0;
        }
    }, {
        key: 'isSortByEnabled',
        value: function isSortByEnabled() {
            return this.props.sortBy && this.props.sortBy.length > 0;
        }
    }, {
        key: 'handleToggleInsertFormClick',
        value: function handleToggleInsertFormClick(e) {
            e.preventDefault();
            this.toggleInsertRow();
        }
    }, {
        key: 'toggleInsertRow',
        value: function toggleInsertRow() {
            var showInsertRow = !this.state.showInsertRow;
            this.setState({ showInsertRow: showInsertRow });
            if (showInsertRow) {
                this.props.oneditbegin && this.props.oneditbegin();
            }
        }
    }, {
        key: 'handleToggleFilterClick',
        value: function handleToggleFilterClick(e) {
            e.preventDefault();
            this.toggleFilterRow();
        }
    }, {
        key: 'toggleFilterRow',
        value: function toggleFilterRow() {
            this.setState({ showFilterRow: !this.state.showFilterRow });
        }
    }, {
        key: 'handleRowCreate',
        value: function handleRowCreate(data) {
            var _this6 = this;

            data._key = _uuid2.default.v4();
            this.setState({ showInsertRow: false }, function () {
                return _this6.setState({ showInsertRow: true });
            });
            this.props.oncreate && this.props.oncreate(data);
        }
    }, {
        key: 'handleRowUpdate',
        value: function handleRowUpdate(data) {
            this.setState({ editingRow: null });
            this.props.onupdate && this.props.onupdate(data);
        }
    }, {
        key: 'handleRowDelete',
        value: function handleRowDelete(data) {
            this.props.ondelete && this.props.ondelete(data);
        }
    }, {
        key: 'handleEditBegin',
        value: function handleEditBegin(row) {
            this.setState({ editingRow: row });
            this.props.oneditbegin && this.props.oneditbegin();
        }
    }, {
        key: 'handleEditCancel',
        value: function handleEditCancel(row) {
            this.setState({ editingRow: null });
        }
    }, {
        key: 'handleColumnFilter',
        value: function handleColumnFilter(filter) {
            var $tablesorter = $("#" + this.state.id);
            $tablesorter.trigger('search', [filter]);
        }
    }, {
        key: 'handleRowClick',
        value: function handleRowClick(data) {
            var selectedRows = _lodash2.default.cloneDeep(this.props.selectedRows);

            if (!selectedRows) {
                selectedRows = [];
            }

            var index = _lodash2.default.findIndex(selectedRows, { _key: data._key });
            if (index >= 0) {
                selectedRows.splice(index, 1);
            } else {
                selectedRows.push(data);
            }
            this.props.onrowclick && this.props.onrowclick(selectedRows);
        }
    }, {
        key: 'handleRowMouseEnter',
        value: function handleRowMouseEnter(data) {
            this.props.onrowmouseenter && this.props.onrowmouseenter(data);
        }
    }, {
        key: 'isRowSelected',
        value: function isRowSelected(row) {
            return _lodash2.default.find(this.props.selectedRows, { _key: row._key }) && true;
        }
    }, {
        key: 'groupBy',
        value: function groupBy(data, group, groupByLabelHolder) {
            var groupedData = {};

            data.forEach(function (row) {
                var groupByLabel = "";
                if (groupByLabelHolder) {
                    groupByLabel = _lodash2.default.get(groupByLabelHolder, group) + ": ";
                }
                var groupKey = _lodash2.default.isFunction(group) ? group(row) : groupByLabel + _lodash2.default.get(row, group);
                if (!groupedData[groupKey]) {
                    groupedData[groupKey] = [];
                }
                groupedData[groupKey].push(row);
            });

            return groupedData;
        }
    }, {
        key: 'iterateGroups',
        value: function iterateGroups(group, data, groupByLabelHolder) {
            var _this7 = this;

            if (_lodash2.default.isArray(data)) {
                data = this.groupBy(data, group, groupByLabelHolder);
            } else {
                Object.keys(data).forEach(function (key) {
                    data[key] = _this7.iterateGroups(group, data[key], groupByLabelHolder);
                });
            }
            return data;
        }
    }, {
        key: 'groupData',
        value: function groupData(groupBy, data, groupByLabelHolder) {
            var _this8 = this;

            var groupData = data;
            groupBy.forEach(function (eachGroup) {
                groupData = _this8.iterateGroups(eachGroup, groupData, groupByLabelHolder);
            });
            return groupData;
        }
    }, {
        key: 'sort',
        value: function sort(arr) {
            return _lodash2.default.sortBy(arr, this.props.sortBy);
        }
    }, {
        key: 'sortData',
        value: function sortData(data) {
            var _this9 = this;

            if (_lodash2.default.isArray(data)) {
                return this.sort(data);
            } else {
                Object.keys(data).forEach(function (key) {
                    data[key] = _this9.sortData(data[key]);
                });
                return data;
            }
        }
    }, {
        key: 'renderHeader',
        value: function renderHeader(columns) {
            return _react2.default.createElement(
                'thead',
                null,
                _react2.default.createElement(_DataTableHeaderRow.DataTableHeaderRow, { tableFilterable: this.props.filterable,
                    tableSortable: this.props.sortable && !this.isGroupByEnabled(),
                    columns: columns })
            );
        }
    }, {
        key: 'renderDataRows',
        value: function renderDataRows(columns, data) {
            var _this10 = this;

            var rowIndex = -1;
            return data.map(function (row) {
                if (!row._key) {
                    row._key = _uuid2.default.v4();
                }
                var disabled = _this10.props.onDisabledCheck && _this10.props.onDisabledCheck(row);
                rowIndex++;
                return _react2.default.createElement(_DataTableRow.DataTableRow, { key: row._key,
                    data: row,
                    columns: columns,
                    editable: _this10.props.editable,
                    editing: _this10.state.editingRow != null && row._key == _this10.state.editingRow._key,
                    selected: _this10.isRowSelected(row),
                    onsave: function onsave(data) {
                        return _this10.handleRowUpdate(data);
                    },
                    oneditbegin: function oneditbegin() {
                        return _this10.handleEditBegin(row);
                    },
                    oneditcancel: function oneditcancel() {
                        return _this10.handleEditCancel(row);
                    },
                    ondelete: function ondelete() {
                        return _this10.handleRowDelete(row);
                    },
                    onrowclick: function onrowclick(data) {
                        return _this10.handleRowClick(data);
                    },
                    onrowmouseenter: function onrowmouseenter(data) {
                        return _this10.handleRowMouseEnter(data);
                    },
                    disabled: disabled,
                    rowIndex: rowIndex });
            });
        }
    }, {
        key: 'showHideGroup',
        value: function showHideGroup(value) {
            var hiddenGroup = _lodash2.default.cloneDeep(this.state.hiddenGroup);
            if (_lodash2.default.find(hiddenGroup, function (v) {
                return v == value;
            })) {
                _lodash2.default.remove(hiddenGroup, function (v) {
                    return v == value;
                });
            } else {
                hiddenGroup.push(value);
            }
            this.setState({ hiddenGroup: hiddenGroup });
        }

        /**
         * DİKKAT: Bu metodtaki newLevel ve uniqueIndex değerlerinin oluşturulma mantığı değiştirildiğinde
         * generateGroupIndexArray metodundaki mantık da değiştirilmeli.
         */

    }, {
        key: 'renderGroupedDataRows',
        value: function renderGroupedDataRows(columns, groupedData, level, groupIndex) {
            var _this11 = this;

            var rows = [];
            var newLevel = level ? level + 1 : 1;
            var dataCount = 0;
            Object.keys(groupedData).forEach(function (key, index) {
                var uniqueIndex = groupIndex ? groupIndex + "." + index : "" + index;

                var isHidden = _lodash2.default.find(_this11.state.hiddenGroup, function (v) {
                    return v === uniqueIndex;
                });

                if (newLevel === 1) {
                    //hide
                }

                if (_lodash2.default.isArray(groupedData[key])) {
                    var dataRows = _this11.renderDataRows(columns, groupedData[key]);
                    dataCount += dataRows.length;
                    rows.push(_react2.default.createElement(_DataTableGroupByRow.DataTableGroupByRow, { key: uniqueIndex,
                        columnsLength: columns.length,
                        rowLength: dataRows.length,
                        isHidden: isHidden,
                        level: newLevel,
                        value: key,
                        onclick: function onclick() {
                            return _this11.showHideGroup(uniqueIndex);
                        } }));
                    if (!isHidden) {
                        rows = rows.concat(dataRows);
                    }
                } else {
                    var groupRows = _this11.renderGroupedDataRows(columns, groupedData[key], newLevel, uniqueIndex);
                    dataCount += groupRows.dataCount;
                    rows.push(_react2.default.createElement(_DataTableGroupByRow.DataTableGroupByRow, { key: uniqueIndex,
                        columnsLength: columns.length,
                        rowLength: groupRows.dataCount,
                        isHidden: isHidden,
                        level: newLevel,
                        value: key,
                        onclick: function onclick() {
                            return _this11.showHideGroup(uniqueIndex);
                        } }));
                    if (!isHidden) {
                        rows = rows.concat(groupRows.rows);
                    }
                }
            });
            return { rows: rows, dataCount: dataCount };
        }
    }, {
        key: 'renderBody',
        value: function renderBody(columns) {
            var rows = _react2.default.createElement(
                'tr',
                null,
                _react2.default.createElement(
                    'td',
                    { colSpan: columns.length },
                    this.state.showInsertRow ? "" : _get(DataTable.prototype.__proto__ || Object.getPrototypeOf(DataTable.prototype), 'translate', this).call(this, "No data to display")
                )
            );
            if (this.props.data && this.props.data.length > 0) {
                if (this.isGroupByEnabled()) {
                    var groupedData = this.groupData(this.props.groupBy, this.props.data, this.props.groupByLabelHolder);
                    if (this.isSortByEnabled()) {
                        groupedData = this.sortData(groupedData);
                    }
                    rows = this.renderGroupedDataRows(columns, groupedData).rows;
                } else {
                    var sortedData = this.props.data;
                    if (this.isSortByEnabled()) {
                        sortedData = this.sortData(sortedData);
                    }
                    rows = this.renderDataRows(columns, sortedData);
                }
            }
            return _react2.default.createElement(
                'tbody',
                null,
                rows
            );
        }
    }, {
        key: 'renderInsertRow',
        value: function renderInsertRow(columns) {
            var _this12 = this;

            var insertRow = null;
            if (this.props.insertable) {
                insertRow = _react2.default.createElement(
                    'tbody',
                    { className: 'tablesorter-infoOnly' },
                    _react2.default.createElement(_DataTableInsertRow.DataTableInsertRow, { columns: columns,
                        onsave: function onsave(data) {
                            return _this12.handleRowCreate(data);
                        },
                        visible: this.state.showInsertRow })
                );
            }
            return insertRow;
        }
    }, {
        key: 'renderFilterRow',
        value: function renderFilterRow(columns) {
            var _this13 = this;

            var filterRow = null;
            if (this.props.filterable) {
                filterRow = _react2.default.createElement(
                    'tbody',
                    { className: 'tablesorter-filter-row tablesorter-infoOnly' },
                    _react2.default.createElement(_DataTableFilterRow.DataTableFilterRow, { ref: function ref(c) {
                            return _this13.filterRowReference = c;
                        },
                        columns: columns,
                        onfilter: function onfilter(filter) {
                            return _this13.handleColumnFilter(filter);
                        },
                        visible: this.state.showFilterRow })
                );
            }
            return filterRow;
        }
    }, {
        key: 'renderToolbar',
        value: function renderToolbar() {
            var _this14 = this;

            var toggleInsertForm = "";
            var toggleFilterFields = "";
            if (this.props.insertable) {
                toggleInsertForm = _react2.default.createElement(_basic.Button, { flat: true, onclick: function onclick(e) {
                        return _this14.handleToggleInsertFormClick(e);
                    }, icon: 'plus', active: this.state.showInsertRow });
            }
            if (this.props.filterable) {
                toggleFilterFields = _react2.default.createElement(_basic.Button, { flat: true, onclick: function onclick(e) {
                        return _this14.handleToggleFilterClick(e);
                    }, icon: 'filter', active: this.state.showFilterRow });
            }
            var title = "";
            if (this.props.title) {
                title = this.props.title;
            }
            var rowCount = null;
            if (this.props.showRowCount) {
                rowCount = _react2.default.createElement('span', { className: 'uk-margin-left uk-text-small uk-text-italic', id: this.state.id + "-rowcount" });
            }

            var caption = null;
            if (title || toggleInsertForm || toggleFilterFields) {
                caption = _react2.default.createElement(
                    'caption',
                    { className: 'table-caption' },
                    _react2.default.createElement(
                        'div',
                        { className: 'table-caption-toolbar' },
                        toggleInsertForm,
                        toggleFilterFields
                    ),
                    _react2.default.createElement(
                        'h3',
                        { className: 'table-toolbar-title' },
                        _get(DataTable.prototype.__proto__ || Object.getPrototypeOf(DataTable.prototype), 'translate', this).call(this, title),
                        rowCount
                    )
                );
            }
            return caption;
        }

        /**
         * Bir footerRow içinde kaç tane column olmalı, veya bir başka deyişle bir footerRow içindeki column'ların colSpan değerlerinin toplamı ne olmalı?
         * {datatable'daki column sayısı (action column'lar dahil)} + {datatable.editable veya datatable.deletable ise 1}
         */

    }, {
        key: 'renderFooter',
        value: function renderFooter() {
            var _this15 = this;

            var footerRows = this.props.footerRows;

            if (footerRows && footerRows.length > 0) {

                var rows = [];

                footerRows.forEach(function (footerRow, footerRowIndex) {

                    var columns = [];

                    footerRow.columns.forEach(function (footerColumn, footerColumnIndex) {
                        columns.push(_react2.default.createElement(
                            'td',
                            { key: _this15.state.id + "-footerRow" + footerRowIndex + "-footerColumn" + footerColumnIndex, colSpan: footerColumn.colSpan },
                            footerColumn.content
                        ));
                    });

                    rows.push(_react2.default.createElement(
                        'tr',
                        { key: _this15.state.id + "-footerRow" + footerRowIndex },
                        columns
                    ));
                });

                /**
                 * Aşağıda neden tfoot yerine tbody kullandık? tfoot kullandığımızda yukarından gelen stil (sanırız uk-table'dan geliyor) thead gibi oluyor.
                 * Font color ve border, thead'te olduğu gibi görünüyor. Footer'ın tbody gibi görünmesi görsel açıdan daha güzel duruyor.
                 * Not: Bir table içinde birden fazla tbody olması HTML açısından geçerli bir durum.
                 */
                return _react2.default.createElement(
                    'tbody',
                    null,
                    rows
                );
            } else {
                return null;
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this16 = this;

            var containerClassName = "uk-overflow-container";
            if (this.props.noOverflow) {
                containerClassName = "";
            }
            var tableClassName = "uk-table uk-table-nowrap uk-table-condensed tablesorter tablesorter-oneorder";
            if (this.props.centerText) {
                tableClassName += " uk-text-center";
            }
            var overflowStyle = {};
            if (this.props.height) {
                overflowStyle = { height: this.props.height };
            }
            var topScrollbar = null;
            if (this.props.doubleHorizontalScrollbar === true) {
                topScrollbar = _react2.default.createElement(
                    'div',
                    { id: "parentOf-equivalentOf-" + this.state.id, className: 'uk-overflow-container' },
                    _react2.default.createElement(
                        'div',
                        { id: "equivalentOf-" + this.state.id },
                        '\xA0'
                    )
                );
            }
            var columns = this.getColumns();
            return _react2.default.createElement(
                _basic.Form,
                { ref: function ref(c) {
                        return _this16.form = c;
                    } },
                topScrollbar,
                _react2.default.createElement(
                    'div',
                    { id: "parentOf-" + this.state.id, className: containerClassName, style: overflowStyle },
                    _react2.default.createElement(
                        'table',
                        { id: this.state.id, className: tableClassName },
                        this.renderToolbar(),
                        this.renderHeader(columns),
                        this.renderFilterRow(columns),
                        this.renderInsertRow(columns),
                        this.renderBody(columns),
                        this.renderFooter()
                    )
                )
            );
        }
    }]);

    return DataTable;
}(_abstract.TranslatingComponent);

DataTable.contextTypes = {
    translator: _propTypes2.default.object
};