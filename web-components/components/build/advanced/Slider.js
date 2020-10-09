'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Slider = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Slider = exports.Slider = function (_React$Component) {
    _inherits(Slider, _React$Component);

    function Slider(props) {
        _classCallCheck(this, Slider);

        var _this = _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        return _this;
    }

    _createClass(Slider, [{
        key: 'loadSlider',
        value: function loadSlider() {
            var _this2 = this;

            var config = {
                min: this.props.min ? this.props.min : 1,
                max: this.props.max ? this.props.max : 20,
                from: this.props.from ? this.props.from : 1,
                to: this.props.to ? this.props.to : 1,
                grid: this.props.grid ? this.props.grid : false,
                onFinish: function onFinish(data) {
                    _this2.handleMove(data);
                }
            };
            $(this._input).ionRangeSlider(config);
            this.slider = $(this._input).data("ionRangeSlider");
        }
    }, {
        key: 'unloadSlider',
        value: function unloadSlider() {
            this.slider.destroy();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.loadSlider();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.slider.update({
                from: this.props.from ? this.props.from : 1,
                to: this.props.to ? this.props.to : 1
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.unloadSlider();
        }
    }, {
        key: 'handleMove',
        value: function handleMove(data) {
            this.props.onchange && this.props.onchange(data.from);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var wrapperClassName = "md-input-wrapper md-input-filled";
            var inputClassName = "ion-slider";

            var label = this.props.label;
            if (this.props.hideLabel) {
                label = "";
            }

            var requiredForLabel = "";
            if (this.props.required && label) {
                requiredForLabel = _react2.default.createElement(
                    'span',
                    { className: 'req' },
                    '*'
                );
            }

            return _react2.default.createElement(
                'div',
                { className: wrapperClassName },
                _react2.default.createElement(
                    'label',
                    null,
                    label,
                    requiredForLabel
                ),
                _react2.default.createElement('input', { ref: function ref(c) {
                        return _this3._input = c;
                    },
                    id: this.state.id,
                    type: 'text', className: inputClassName })
            );
        }
    }]);

    return Slider;
}(_react2.default.Component);