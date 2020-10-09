"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Table = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _TableHeader = require("./header/TableHeader");

var _TableBody = require("./body/TableBody");

var _TableFooter = require("./footer/TableFooter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Table = exports.Table = function (_React$Component) {
    _inherits(Table, _React$Component);

    function Table(props) {
        _classCallCheck(this, Table);

        var _this = _possibleConstructorReturn(this, (Table.__proto__ || Object.getPrototypeOf(Table)).call(this, props));

        _this.getActionButtons = function (actions) {
            if (actions) {
                return actions.actionButtons;
            } else {
                return null;
            }
        };

        _this.getRowClick = function (actions) {
            if (actions) {
                return actions.rowClick;
            } else {
                return null;
            }
        };

        _this.getRowAdd = function (actions) {
            if (actions) {
                return actions.rowAdd;
            } else {
                return null;
            }
        };

        _this.getRowEdit = function (actions) {
            if (actions) {
                return actions.rowEdit;
            } else {
                return null;
            }
        };

        _this.getRowDelete = function (actions) {
            if (actions) {
                return actions.rowDelete;
            } else {
                return null;
            }
        };

        _this.getTableClassName = function (hover) {
            var className = "uk-table uk-table-nowrap";
            if (_this.props.hover) {
                className += " uk-table-hover";
            }

            return className;
        };

        _this.sortData = function (self, sortBy, sortOrder, headerSortObj) {
            if (_this.props.sortFunction) {
                _this.props.sortFunction(self, sortBy, sortOrder, headerSortObj);
            } else {
                self.sortInternally(self, sortBy, sortOrder, headerSortObj);
            }
        };

        _this.sortInternally = function (self, sortBy, sortOrder, headerSortObj) {

            var data = _this.state.data;
            var sortedData = [];

            var i = 0;
            var currIndex = 0;
            var temp = void 0;

            while (data.length > 0) {

                currIndex = 0;
                temp = data[0];
                for (i = 1; i < data.length; i++) {

                    if (sortOrder == "asc" && self.compare(self, data[i][sortBy], temp[sortBy], headerSortObj) < 0) {
                        temp = data[i];
                        currIndex = i;
                    } else if (sortOrder == "desc" && self.compare(self, data[i][sortBy], temp[sortBy], headerSortObj) > 0) {
                        temp = data[i];
                        currIndex = i;
                    }
                }
                ;

                data.splice(currIndex, 1);
                sortedData.push(temp);
            }

            headerSortObj.sorted = {};
            headerSortObj.sorted.order = sortOrder;
            headerSortObj.sorted.by = sortBy;

            self.state.headers.map(function (header) {
                if (header.sort && header.sort.sorted && header.data != sortBy) {
                    delete header.sort["sorted"];
                }
            });

            _this.setState({ data: sortedData });
        };

        _this.compare = function (self, param1, param2, headerSortObj) {

            if (headerSortObj.type) {
                if (headerSortObj.type == "text") {
                    return self.compareString(param1, param2);
                } else if (headerSortObj.type == "numeric") {
                    return self.compareNumeric(param1, param2);
                } else if (headerSortObj.type == "date") {
                    return self.compareDate(param1, param2, headerSortObj);
                }
            }

            return self.compareNumeric(param1, param2);
        };

        _this.compareString = function (param1, param2) {

            var str1 = param1 ? param1.toLowerCase() : "";
            var str2 = param2 ? param2.toLowerCase() : "";

            if (str1 > str2) {
                return 1;
            } else if (str1 < str2) {
                return -1;
            }
            return 0;
            orderinfo;
        };

        _this.compareNumeric = function (param1, param2) {

            if (param1 > param2) {
                return 1;
            } else if (param1 < param2) {
                return -1;
            }
            return 0;
        };

        _this.compareDate = function (param1, param2, headerSortObj) {

            var date1 = moment(param1, headerSortObj.format);
            var date2 = moment(param2, headerSortObj.format);

            if (date1 > date2) {
                return 1;
            } else if (date1 < date2) {
                return -1;
            }
            return 0;
        };

        _this.formatPredefinedChildrenForTable = function (children) {
            if (!children) return null;

            return _react2.default.createElement(
                "tbody",
                null,
                _react2.default.Children.map(children, function (child) {
                    return _react2.default.createElement(
                        "tr",
                        { key: _uuid2.default.v4() },
                        _react2.default.createElement(
                            "td",
                            { colSpan: "100%" },
                            child
                        )
                    );
                })
            );
        };

        _this.state = {};
        return _this;
    }

    _createClass(Table, [{
        key: "render",
        value: function render() {
            var headers = this.props.headers;
            var tableData = this.props.data ? this.props.data : [];
            var footers = this.props.footers;
            var actions = this.props.actions;
            var insertion = this.props.insertion;
            var icons = this.props.icons;
            var actionButtons = this.getActionButtons(actions);
            var rowClick = this.getRowClick(actions);
            var rowAdd = this.getRowAdd(actions);
            var rowEdit = this.getRowEdit(actions);
            var rowDelete = this.getRowDelete(actions);

            var self = this;

            var tableClassName = this.getTableClassName(this.props.hover);

            return _react2.default.createElement(
                "table",
                { className: tableClassName },
                _react2.default.createElement(_TableHeader.TableHeader, { headers: headers, actions: actions, insertion: insertion,
                    sortData: function sortData(sortBy, sortOrder, headerSortObj) {
                        return self.sortData(self, sortBy, sortOrder, headerSortObj);
                    } }),
                _react2.default.createElement(_TableBody.TableBody, { headers: headers, data: tableData, actionButtons: actionButtons, insertion: insertion,
                    icons: icons, rowClick: rowClick, rowAdd: rowAdd, rowEdit: rowEdit, rowDelete: rowDelete }),
                self.formatPredefinedChildrenForTable(this.props.children),
                _react2.default.createElement(_TableFooter.TableFooter, { headers: headers, footers: footers, icons: icons })
            );
        }
    }]);

    return Table;
}(_react2.default.Component);