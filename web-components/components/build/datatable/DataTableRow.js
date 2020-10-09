'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataTableRow = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Column = require('./columns/Column');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataTableRow = exports.DataTableRow = function (_React$Component) {
    _inherits(DataTableRow, _React$Component);

    function DataTableRow(props) {
        _classCallCheck(this, DataTableRow);

        var _this = _possibleConstructorReturn(this, (DataTableRow.__proto__ || Object.getPrototypeOf(DataTableRow)).call(this, props));

        _this.state = { id: _uuid2.default.v4() };
        return _this;
    }

    _createClass(DataTableRow, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.setState({ data: this.props.data, editing: false });
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.setState({ data: nextProps.data, editing: nextProps.editing });
        }
    }, {
        key: 'startEditing',
        value: function startEditing() {
            this.setState({ editing: true });
            this.context.validation && this.context.validation.reset();
            this.props.oneditbegin && this.props.oneditbegin();
        }
    }, {
        key: 'handleDataUpdate',
        value: function handleDataUpdate(column, value) {
            var state = _lodash2.default.cloneDeep(this.state);
            if (column.props.reader) {
                column.props.reader.setValue(state.data, value);
            } else {
                state.data[column.props.field] = value;
            }

            this.setState(state);
        }
    }, {
        key: 'handleRowCancelClick',
        value: function handleRowCancelClick() {
            this.context.validation && this.context.validation.reset();
            this.setState({ data: this.props.data, editing: false });
            this.props.oneditcancel && this.props.oneditcancel();
        }
    }, {
        key: 'handleRowSaveClick',
        value: function handleRowSaveClick() {
            if (this.context.validation && !this.context.validation.validateGroup(this.state.id)) {
                return;
            }
            this.props.onsave && this.props.onsave(this.state.data);
            this.setState({ editing: false });
        }
    }, {
        key: 'handleRowDeleteClick',
        value: function handleRowDeleteClick() {
            this.props.ondelete && this.props.ondelete();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var counter = 0;
            var rowIndex = this.props.rowIndex;
            var classNames = [];
            this.props.selected && classNames.push("md-bg-light-blue-50");
            classNames.push(rowIndex % 2 === 0 ? "even" : "odd");
            return _react2.default.createElement(
                'tr',
                { onClick: function onClick(e) {
                        return _this2.props.onrowclick(_this2.state.data);
                    }, className: classNames.join(" "), onMouseEnter: function onMouseEnter(e) {
                        return _this2.props.onrowmouseenter(_this2.state.data);
                    } },
                this.props.columns.map(function (column) {
                    var props = {};
                    if (column.type.prototype instanceof _Column.Column) {
                        props = {
                            counter: counter,
                            key: _this2.state.id + ":" + counter++,
                            data: _this2.state.data,
                            isEdit: _this2.state.editing,
                            validationGroup: _this2.state.id,
                            disabled: _this2.props.disabled,
                            ondataupdate: function ondataupdate(value) {
                                return _this2.handleDataUpdate(column, value);
                            }
                        };
                    } else {
                        props = {
                            key: _this2.state.id + ":" + counter++,
                            data: _this2.state.data,
                            isEdit: _this2.state.editing,
                            oneditbegin: function oneditbegin() {
                                return _this2.startEditing();
                            },
                            onsave: function onsave() {
                                return _this2.handleRowSaveClick();
                            },
                            oncancel: function oncancel() {
                                return _this2.handleRowCancelClick();
                            },
                            ondelete: function ondelete() {
                                return _this2.handleRowDeleteClick();
                            }
                        };
                    }
                    return _react2.default.cloneElement(column, props);
                })
            );
        }
    }]);

    return DataTableRow;
}(_react2.default.Component);

DataTableRow.contextTypes = {
    validation: _propTypes2.default.object
};