'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataTableHeaderRow = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _abstract = require('../abstract/');

var _DataTableActionColumn = require('./DataTableActionColumn');

var _DataTableInsertRow = require('./DataTableInsertRow');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataTableHeaderRow = exports.DataTableHeaderRow = function (_React$Component) {
    _inherits(DataTableHeaderRow, _React$Component);

    function DataTableHeaderRow(props) {
        _classCallCheck(this, DataTableHeaderRow);

        var _this = _possibleConstructorReturn(this, (DataTableHeaderRow.__proto__ || Object.getPrototypeOf(DataTableHeaderRow)).call(this, props));

        _this.id = _uuid2.default.v4();
        return _this;
    }

    _createClass(DataTableHeaderRow, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps() {}
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var counter = 0;
            return _react2.default.createElement(
                'tr',
                null,
                this.props.columns.map(function (column) {
                    return _react2.default.cloneElement(column, {
                        key: _this2.id + ":" + counter++,
                        isHeader: true,
                        tableFilterable: _this2.props.tableFilterable,
                        tableSortable: _this2.props.tableSortable
                    });
                })
            );
        }
    }]);

    return DataTableHeaderRow;
}(_react2.default.Component);