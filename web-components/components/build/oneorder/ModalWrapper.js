'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ModalWrapper = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _abstract = require('../abstract');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ModalWrapper = exports.ModalWrapper = function (_TranslatingComponent) {
    _inherits(ModalWrapper, _TranslatingComponent);

    function ModalWrapper(props) {
        _classCallCheck(this, ModalWrapper);

        return _possibleConstructorReturn(this, (ModalWrapper.__proto__ || Object.getPrototypeOf(ModalWrapper)).call(this, props));
    }

    _createClass(ModalWrapper, [{
        key: 'wrap',
        value: function wrap(status, data) {
            return JSON.stringify({
                status: status,
                data: data
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var props = _.cloneDeep(this.props);
            props.onSuccess = function (data) {
                return parent.postMessage(_this2.wrap('success', data), _this2.props.targetOrigin);
            };
            props.onError = function (data) {
                return parent.postMessage(_this2.wrap('error', data), _this2.props.targetOrigin);
            };
            props.onCancel = function () {
                return parent.postMessage(_this2.wrap('cancel'), _this2.props.targetOrigin);
            };

            var component = this.props.route.options.components[this.props.params.component];
            return component ? _react2.default.createElement(component, props) : null;
        }
    }]);

    return ModalWrapper;
}(_abstract.TranslatingComponent);

ModalWrapper.contextTypes = {
    translator: _propTypes2.default.object,
    router: _react2.default.PropTypes.object,
    user: _react2.default.PropTypes.object
};