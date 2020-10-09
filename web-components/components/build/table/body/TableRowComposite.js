'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TableRowComposite = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Button = require('../../basic/Button');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * headers
 * insertion
 * values
 */
var TableRowComposite = exports.TableRowComposite = function (_React$Component) {
    _inherits(TableRowComposite, _React$Component);

    function TableRowComposite(props) {
        _classCallCheck(this, TableRowComposite);

        var _this = _possibleConstructorReturn(this, (TableRowComposite.__proto__ || Object.getPrototypeOf(TableRowComposite)).call(this, props));

        _this.prepareRowDatafromInsertion = function (headers, insertion) {

            return headers.map(function (header) {

                var colElems = insertion[header.data];
                var className = _this.getClassName(header);
                var hidden = _this.isHidden(header);

                var style = {};
                if (hidden) {
                    style.display = 'none';
                }

                if (!colElems) {
                    return _react2.default.createElement(
                        'td',
                        { key: header.data, className: className, style: style },
                        _this.getSafeValueFromState(header.data)
                    );
                }

                return _react2.default.createElement(
                    'td',
                    { key: header.data, className: className, style: style },
                    insertion[header.data].map(function (elem) {
                        return _react2.default.cloneElement(elem, {
                            key: header.data,
                            value: _this.getSafeValueFromState(header.data),
                            checked: _this.getSafeValueFromState(header.data),
                            onchange: function onchange(value) {
                                return _this.updateState(header.data, value);
                            }
                        });
                    })
                );
            });
        };

        _this.state = { values: _this.props.values };
        return _this;
    }

    _createClass(TableRowComposite, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var headers = this.props.headers;
            var insertion = this.props.insertion;
            var mode = this.props.mode;

            if (insertion) {

                var buttonName = "";
                if (mode == "add") {
                    buttonName = "Add";
                } else if (mode == "edit") {
                    buttonName = "Save";
                }

                return _react2.default.createElement(
                    'tr',
                    null,
                    this.prepareRowDatafromInsertion(headers, insertion),
                    _react2.default.createElement(
                        'td',
                        { className: 'uk-text-center' },
                        _react2.default.createElement(_Button.Button, { label: buttonName, flat: true, waves: true, size: 'medium', onclick: function onclick() {
                                return _this2.buttonClicked();
                            } })
                    )
                );
            } else {
                return null;
            }
        }
    }, {
        key: 'buttonClicked',
        value: function buttonClicked() {
            this.props.onsave(this.state.values);
        }
    }, {
        key: 'getSafeValueFromState',
        value: function getSafeValueFromState(key) {
            var value = this.state.values[key];
            if (!value) {
                value = "";
            }
            return value;
        }
    }, {
        key: 'updateState',
        value: function updateState(dataName, newValue) {
            var state = _lodash2.default.cloneDeep(this.state);
            state.values[dataName] = newValue;
            this.setState(state);
        }
    }, {
        key: 'isHidden',
        value: function isHidden(header) {
            if (!header.hidden) {
                return false;
            }
            return true;
        }
    }, {
        key: 'getClassName',
        value: function getClassName(header) {
            return this.getClassNameAlignment(header);
        }
    }, {
        key: 'getClassNameAlignment',
        value: function getClassNameAlignment(header) {

            var className = "uk-text-";

            if (header.alignment) {
                className += header.alignment;
            } else {
                className += "center";
            }

            return className;
        }
    }]);

    return TableRowComposite;
}(_react2.default.Component);