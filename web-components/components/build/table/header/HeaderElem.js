'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HeaderElem = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * name
 * data
 * alignment
 * sortable
 * hidden
 * width
 */
var HeaderElem = exports.HeaderElem = function (_React$Component) {
    _inherits(HeaderElem, _React$Component);

    function HeaderElem(props) {
        _classCallCheck(this, HeaderElem);

        var _this = _possibleConstructorReturn(this, (HeaderElem.__proto__ || Object.getPrototypeOf(HeaderElem)).call(this, props));

        _initialiseProps.call(_this);

        return _this;
    }

    _createClass(HeaderElem, [{
        key: 'render',
        value: function render() {

            var header = this.props.header;

            var className = this.getClassName(this.props);
            var style = this.getStyle(this, header);
            var width = this.getWidth(header);

            var sortElem = this.getSortElem(this, header);

            return _react2.default.createElement(
                'th',
                { className: className, style: style, width: width },
                header.name,
                sortElem
            );
        }
    }]);

    return HeaderElem;
}(_react2.default.Component);

var _initialiseProps = function _initialiseProps() {
    var _this2 = this;

    this.getStyle = function (self, header) {

        var hidden = _this2.isHidden(header);

        var style = {};
        if (hidden) {
            style.display = 'none';
        }

        return style;
    };

    this.isHidden = function (header) {
        if (!header.hidden) {
            return false;
        }
        return true;
    };

    this.getClassName = function (props) {

        return _this2.getClassNameAlignment(props.header);
    };

    this.getWidth = function (header) {

        if (header.width) {
            return header.width;
        } else {
            return -1;
        }
    };

    this.getClassNameAlignment = function (header) {

        var className = "uk-text-";

        if (header.alignment) {
            className += header.alignment;
        } else {
            className += "center";
        }

        return className;
    };

    this.getSortElem = function (self, header) {

        var sortType = _this2.getCurrentSortType(header);

        if (sortType == "asc") {
            return _react2.default.createElement(
                'a',
                { href: 'javascript:void(null);', onClick: function onClick() {
                        return _this2.props.sortData(header.data, "desc", header.sort);
                    } },
                _react2.default.createElement('i', { className: 'md-icon uk-icon-sort-amount-desc' })
            );
        } else if (sortType == "desc") {
            return _react2.default.createElement(
                'a',
                { href: 'javascript:void(null);', onClick: function onClick() {
                        return _this2.props.sortData(header.data, "asc", header.sort);
                    } },
                _react2.default.createElement('i', { className: 'md-icon uk-icon-sort-amount-asc' })
            );
        } else if (sortType == "none") {
            return _react2.default.createElement(
                'a',
                { href: 'javascript:void(null);', onClick: function onClick() {
                        return _this2.props.sortData(header.data, "asc", header.sort);
                    } },
                _react2.default.createElement('i', { className: 'md-icon uk-icon-sort-amount-asc' })
            );
        }
        return null;
    };

    this.getCurrentSortType = function (header) {
        if (header.sort) {

            if (header.sort.sorted && header.sort.sorted.order) {
                return header.sort.sorted.order;
            } else {
                return "none";
            }
        }
        return null;
    };
};