'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TruncateText = undefined;

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

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Created by bugra.ciftci on 13/06/2017.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


var TruncateText = exports.TruncateText = function (_TranslatingComponent) {
    _inherits(TruncateText, _TranslatingComponent);

    function TruncateText(props) {
        _classCallCheck(this, TruncateText);

        return _possibleConstructorReturn(this, (TruncateText.__proto__ || Object.getPrototypeOf(TruncateText)).call(this, props));
    }

    _createClass(TruncateText, [{
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'span',
                { className: 'uk-text-truncate',
                    'data-uk-tooltip': '{cls:\'long-text\', pos:\'right\'}',
                    title: _get(TruncateText.prototype.__proto__ || Object.getPrototypeOf(TruncateText.prototype), 'translate', this).call(this, this.props.title) },
                _get(TruncateText.prototype.__proto__ || Object.getPrototypeOf(TruncateText.prototype), 'translate', this).call(this, this.props.value)
            );
        }
    }]);

    return TruncateText;
}(_abstract.TranslatingComponent);

TruncateText.propTypes = {

    value: _propTypes2.default.string,
    title: _propTypes2.default.string

};