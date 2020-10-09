'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ListHeading = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _basic = require('../basic/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by bugra.ciftci on 14/06/2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var ListHeading = exports.ListHeading = function (_React$Component) {
    _inherits(ListHeading, _React$Component);

    function ListHeading(props) {
        _classCallCheck(this, ListHeading);

        var _this = _possibleConstructorReturn(this, (ListHeading.__proto__ || Object.getPrototypeOf(ListHeading)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(ListHeading, [{
        key: 'render',
        value: function render() {

            var className = "md-list-heading";
            if (this.props.alignLeft) {
                className += " uk-align-left";
            }

            var title = "";
            if (this.props.title) {
                title = this.props.title;
            }

            return _react2.default.createElement(
                'span',
                { className: className,
                    style: this.props.style },
                title ? _react2.default.createElement(_basic.TruncateText, { title: title,
                    value: this.props.value }) : this.props.value
            );
        }
    }]);

    return ListHeading;
}(_react2.default.Component);

ListHeading.propTypes = {

    value: _propTypes2.default.string,
    title: _propTypes2.default.string,
    style: _propTypes2.default.object,
    alignLeft: _propTypes2.default.bool

};