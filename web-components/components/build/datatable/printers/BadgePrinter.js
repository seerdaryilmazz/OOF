'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BadgePrinter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BadgePrinter = exports.BadgePrinter = function () {
    function BadgePrinter(props) {
        _classCallCheck(this, BadgePrinter);

        this.props = props;
    }

    _createClass(BadgePrinter, [{
        key: 'print',
        value: function print(value) {
            var className = "uk-badge uk-badge-small uk-badge";
            if (_lodash2.default.isObject(value)) {
                className += "-" + value.style;
                return _react2.default.createElement(
                    'i',
                    { className: className },
                    value.text
                );
            } else {
                return _react2.default.createElement(
                    'i',
                    { className: className },
                    value
                );
            }
        }
    }]);

    return BadgePrinter;
}();