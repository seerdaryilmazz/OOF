'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.LoaderWrapper = exports.Loader = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _abstract = require('../abstract/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Loader = exports.Loader = function (_TranslatingComponent) {
    _inherits(Loader, _TranslatingComponent);

    function Loader(props) {
        _classCallCheck(this, Loader);

        var _this = _possibleConstructorReturn(this, (Loader.__proto__ || Object.getPrototypeOf(Loader)).call(this, props));

        _this.sizes = { XL: 120, L: 96, M: 72, S: 48, XS: 24 };
        return _this;
    }

    _createClass(Loader, [{
        key: 'render',
        value: function render() {
            var size = "L";
            if (this.props.size) {
                size = this.props.size;
            }
            var title = null;
            if (this.props.title) {
                title = _react2.default.createElement(
                    'div',
                    { className: 'uk-text-primary uk-text-upper' },
                    _get(Loader.prototype.__proto__ || Object.getPrototypeOf(Loader.prototype), 'translate', this).call(this, this.props.title)
                );
            }
            return _react2.default.createElement(
                'div',
                { className: 'uk-grid' },
                _react2.default.createElement(
                    'div',
                    { className: 'uk-width-medium-1-4 uk-container-center uk-text-center uk-margin-top' },
                    _react2.default.createElement(
                        'div',
                        { className: 'md-preloader' },
                        _react2.default.createElement(
                            'svg',
                            { xmlns: 'http://www.w3.org/2000/svg', version: '1.1', height: this.sizes[size], width: this.sizes[size], viewBox: '0 0 75 75' },
                            _react2.default.createElement('circle', { cx: '37.5', cy: '37.5', r: '33.5', strokeWidth: '4' })
                        )
                    ),
                    title
                )
            );
        }
    }]);

    return Loader;
}(_abstract.TranslatingComponent);

var LoaderWrapper = exports.LoaderWrapper = function (_Component) {
    _inherits(LoaderWrapper, _Component);

    function LoaderWrapper(props) {
        _classCallCheck(this, LoaderWrapper);

        return _possibleConstructorReturn(this, (LoaderWrapper.__proto__ || Object.getPrototypeOf(LoaderWrapper)).call(this, props));
    }

    _createClass(LoaderWrapper, [{
        key: 'render',
        value: function render() {
            if (this.props.busy) {
                return _react2.default.createElement(Loader, this.props);
            }
            return this.props.children;
        }
    }]);

    return LoaderWrapper;
}(_react.Component);

Loader.contextTypes = {
    translator: _propTypes2.default.object
};