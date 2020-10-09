'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

exports.withReadOnly = withReadOnly;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _layout = require('../layout');

var _abstract = require('../abstract/');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function withReadOnly(WrappedComponent) {
    var ReadOnlyComponent = function (_TranslatingComponent) {
        _inherits(ReadOnlyComponent, _TranslatingComponent);

        function ReadOnlyComponent(props) {
            _classCallCheck(this, ReadOnlyComponent);

            return _possibleConstructorReturn(this, (ReadOnlyComponent.__proto__ || Object.getPrototypeOf(ReadOnlyComponent)).call(this, props));
        }

        _createClass(ReadOnlyComponent, [{
            key: 'renderReadOnly',
            value: function renderReadOnly() {
                var labelField = this.props.labelField;
                if (!labelField) {
                    labelField = "name";
                }

                var value = "";
                if (_lodash2.default.isArray(this.props.value)) {
                    if (this.props.value.length > 0) {
                        this.props.value.forEach(function (item) {
                            if (value.length > 0) value += ", ";
                            value += item[labelField];
                        });
                    }
                } else {
                    if (this.props.value != null) {
                        if (this.props.value[labelField]) {
                            value = this.props.value[labelField];
                        } else {
                            value = this.props.value;
                        }
                    }
                }

                value = this.props.translate ? _get(ReadOnlyComponent.prototype.__proto__ || Object.getPrototypeOf(ReadOnlyComponent.prototype), 'translate', this).call(this, value) : value;

                return _react2.default.createElement(
                    _layout.Grid,
                    null,
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: '1-1', noMargin: true },
                        _react2.default.createElement(
                            'div',
                            { className: 'uk-form-row' },
                            _react2.default.createElement(
                                'div',
                                { className: 'md-input-wrapper md-input-filled' },
                                _react2.default.createElement(
                                    'label',
                                    null,
                                    _get(ReadOnlyComponent.prototype.__proto__ || Object.getPrototypeOf(ReadOnlyComponent.prototype), 'translate', this).call(this, this.props.label)
                                )
                            )
                        )
                    ),
                    _react2.default.createElement(
                        _layout.GridCell,
                        { width: '1-1' },
                        value
                    )
                );
            }
        }, {
            key: 'render',
            value: function render() {
                if (this.props.readOnly) {
                    return this.renderReadOnly();
                } else {
                    return _react2.default.createElement(WrappedComponent, this.props);
                }
            }
        }]);

        return ReadOnlyComponent;
    }(_abstract.TranslatingComponent);

    ReadOnlyComponent.contextTypes = {
        translator: _propTypes2.default.object
    };

    return ReadOnlyComponent;
}