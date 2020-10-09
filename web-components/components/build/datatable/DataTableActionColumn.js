'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataTableActionColumn = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataTableActionColumn = exports.DataTableActionColumn = function (_React$Component) {
    _inherits(DataTableActionColumn, _React$Component);

    function DataTableActionColumn(props) {
        _classCallCheck(this, DataTableActionColumn);

        return _possibleConstructorReturn(this, (DataTableActionColumn.__proto__ || Object.getPrototypeOf(DataTableActionColumn)).call(this, props));
    }

    _createClass(DataTableActionColumn, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps() {}
    }, {
        key: 'renderHeader',
        value: function renderHeader() {
            var width = this.props.width ? this.props.width + "%" : "";
            var className = "filter-false sorter-false";
            return _react2.default.createElement('th', { className: className, width: width });
        }
    }, {
        key: 'renderData',
        value: function renderData() {
            var _this2 = this;

            return _react2.default.createElement(
                'td',
                { className: 'uk-vertical-align' },
                _react2.default.Children.map(this.props.children, function (child) {
                    return _react2.default.cloneElement(child, { data: _this2.props.data });
                })
            );
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.data) {
                return this.renderData();
            } else {
                return this.renderHeader();
            }
        }
    }]);

    return DataTableActionColumn;
}(_react2.default.Component);