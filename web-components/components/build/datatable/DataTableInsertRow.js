'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataTableInsertRow = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _abstract = require('../abstract/');

var _basic = require('../basic');

var _DataTableActionColumn = require('./DataTableActionColumn');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataTableInsertRow = exports.DataTableInsertRow = function (_React$Component) {
    _inherits(DataTableInsertRow, _React$Component);

    function DataTableInsertRow(props) {
        _classCallCheck(this, DataTableInsertRow);

        var _this = _possibleConstructorReturn(this, (DataTableInsertRow.__proto__ || Object.getPrototypeOf(DataTableInsertRow)).call(this, props));

        _this.id = _uuid2.default.v4();
        _this.state = { data: {} };
        return _this;
    }

    _createClass(DataTableInsertRow, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            var _this2 = this;

            if (this.props.visible && prevProps.visible !== this.props.visible) {
                this.props.columns && this.props.columns.forEach(function (column) {
                    if (column.props.defaultValue) {
                        _this2.handleDataUpdate(column, column.props.defaultValue);
                    }
                });
            }
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps() {}
    }, {
        key: 'handleDataUpdate',
        value: function handleDataUpdate(column, value) {
            var state = _lodash2.default.cloneDeep(this.state);
            if (column.props.reader) {
                column.props.reader.setValue(state.data, value);
            } else {
                _lodash2.default.set(state.data, column.props.field, value);
            }
            this.setState(state);
        }
    }, {
        key: 'handleRowCleanClick',
        value: function handleRowCleanClick() {
            var _this3 = this;

            setTimeout(function () {
                _this3.context.validation && _this3.context.validation.reset();
            }, 300);
            this.setState({ data: {} });
        }
    }, {
        key: 'handleRowSaveClick',
        value: function handleRowSaveClick() {
            if (this.context.validation && !this.context.validation.validateGroup(this.id + '-insert-row')) {
                return;
            }
            this.props.onsave && this.props.onsave(this.state.data);
            this.handleRowCleanClick();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            if (!this.props.columns) {
                return _react2.default.createElement(
                    'tr',
                    null,
                    _react2.default.createElement(
                        'td',
                        null,
                        'no columns'
                    )
                );
            }
            var style = {};
            if (!this.props.visible) {
                style.display = "none";
            }
            var counter = 0;
            return _react2.default.createElement(
                'tr',
                { style: style },
                this.props.columns.map(function (column) {
                    if (column.type == _DataTableActionColumn.DataTableActionColumn) {
                        return _react2.default.createElement('td', { key: _this4.id + ":" + counter++ });
                    } else {
                        return _react2.default.cloneElement(column, {
                            key: _this4.id + ":" + counter++,
                            data: _this4.state.data,
                            isInsert: true,
                            validationGroup: _this4.id + '-insert-row',
                            ondataupdate: function ondataupdate(value) {
                                return _this4.handleDataUpdate(column, value);
                            },
                            oncancel: function oncancel() {
                                return _this4.handleRowCleanClick();
                            },
                            onsave: function onsave() {
                                return _this4.handleRowSaveClick();
                            }
                        });
                    }
                })
            );
        }
    }]);

    return DataTableInsertRow;
}(_react2.default.Component);

DataTableInsertRow.contextTypes = {
    validation: _propTypes2.default.object
};