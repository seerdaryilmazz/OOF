'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TableBody = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _TableRowBasic = require('./TableRowBasic');

var _TableRowComposite = require('./TableRowComposite');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * headers
 * data
 * insertion
 * actionButtons
 * rowEdit
 */
var TableBody = exports.TableBody = function (_React$Component) {
    _inherits(TableBody, _React$Component);

    function TableBody(props) {
        _classCallCheck(this, TableBody);

        var _this = _possibleConstructorReturn(this, (TableBody.__proto__ || Object.getPrototypeOf(TableBody)).call(this, props));

        _this.tryFinishRowEdit = function (data, action) {

            var result = action(data, _this.state.rowDataOld);

            if (result) {
                _this.state.rowDataOld = null;
                _this.setState({ rowEditIndex: -1 });
            }

            return result;
        };

        _this.enableRowEditMode = function (index, rowData) {
            _this.state.rowDataOld = JSON.parse(JSON.stringify(rowData));
            _this.setState({ rowEditIndex: index });
        };

        _this.handleRowClick = function (index, rowData, rowClick) {
            if (rowClick) {
                rowClick(rowData);
                _this.setState({ selectedRowIndex: index });
            }
        };

        _this.state = { rowEditIndex: -1, selectedRowIndex: -1 };

        return _this;
    }

    _createClass(TableBody, [{
        key: 'render',
        value: function render() {

            var self = this;
            var headers = this.props.headers;
            var insertion = this.props.insertion;
            var tableData = this.props.data;
            var icons = this.props.icons;
            var actionButtons = this.props.actionButtons;
            var _rowClick = this.props.rowClick;
            var rowAdd = this.props.rowAdd;
            var rowEdit = this.props.rowEdit;
            var rowDelete = this.props.rowDelete;

            var rowEditIndex = self.state.rowEditIndex;

            if (!(tableData || insertion || predefinedChildren)) {
                return _react2.default.createElement(
                    'tbody',
                    null,
                    _react2.default.createElement(
                        'tr',
                        null,
                        _react2.default.createElement(
                            'td',
                            null,
                            'No Data'
                        )
                    )
                );
            }

            var insertionElem = null;
            if (insertion && rowAdd) {
                insertionElem = _react2.default.createElement(_TableRowComposite.TableRowComposite, { key: _uuid2.default.v4(), headers: headers, insertion: insertion, values: {}, mode: 'add',
                    onsave: function onsave(newData) {
                        return rowAdd(newData);
                    } });
            }

            var tableContent = null;
            if (tableData) {
                var index = 0;

                tableContent = tableData.map(function (rowData) {
                    if (rowData.deleted) return null;

                    if (index == rowEditIndex) {
                        return _react2.default.createElement(_TableRowComposite.TableRowComposite, { key: index, headers: headers, insertion: insertion, values: rowData, mode: 'edit', index: index++,
                            onsave: function onsave(newData) {
                                return self.tryFinishRowEdit(newData, rowEdit.action);
                            } });
                    } else {
                        return _react2.default.createElement(_TableRowBasic.TableRowBasic, { key: index, headers: headers, row: rowData, actionButtons: actionButtons,
                            icons: icons, rowClick: function rowClick(index) {
                                return self.handleRowClick(index, rowData, _rowClick);
                            }, rowEdit: rowEdit, rowDelete: rowDelete,
                            enableRowEditMode: function enableRowEditMode(index) {
                                return self.enableRowEditMode(index, rowData);
                            },
                            deleteRow: function deleteRow() {
                                return rowDelete.action(rowData);
                            },
                            index: index, selected: index++ == self.state.selectedRowIndex });
                    }
                });
            }

            return _react2.default.createElement(
                'tbody',
                null,
                insertionElem,
                tableContent
            );
        }
    }]);

    return TableBody;
}(_react2.default.Component);