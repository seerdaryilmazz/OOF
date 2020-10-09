'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Wizard = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _abstract = require('../abstract');

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Wizard = exports.Wizard = function (_TranslatingComponent) {
    _inherits(Wizard, _TranslatingComponent);

    function Wizard(props) {
        _classCallCheck(this, Wizard);

        var _this = _possibleConstructorReturn(this, (Wizard.__proto__ || Object.getPrototypeOf(Wizard)).call(this, props));

        _this.state = { step: 1, innerView: false };
        _this.state.totalSteps = _this.props.steps.length;
        return _this;
    }

    _createClass(Wizard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'isLastStep',
        value: function isLastStep() {
            return this.state.step == this.state.totalSteps;
        }
    }, {
        key: 'isFirstStep',
        value: function isFirstStep() {
            return this.state.step == 1;
        }
    }, {
        key: 'handleNextClick',
        value: function handleNextClick() {
            var _this2 = this;

            var step = this.props.steps[this.state.step - 1];
            if (!step.onNextClick) {
                this.toNextStep();
            }
            Promise.resolve(step.onNextClick()).then(function (value) {
                if (value) {
                    _this2.toNextStep();
                }
            }).catch(function (error) {
                console.log(error);
            });
        }
    }, {
        key: 'toNextStep',
        value: function toNextStep() {
            var nextStep = this.state.step + 1;
            if (nextStep <= this.state.totalSteps) {
                this.setState({ step: nextStep });
            }
        }
    }, {
        key: 'handlePrevClick',
        value: function handlePrevClick() {
            this.props.steps[this.state.step - 1].onPrevClick && this.props.steps[this.state.step - 1].onPrevClick();
            var prevStep = this.state.step - 1;
            if (prevStep > 0) {
                this.setState({ step: prevStep });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var nextStepClassName = "button_next";
            var prevStepClassName = "button_previous";
            if (this.isLastStep()) {
                nextStepClassName = nextStepClassName + (this.props.hideNextButton ? " uk-hidden" : " disabled");
            }
            if (this.isFirstStep()) {
                prevStepClassName = prevStepClassName + (this.props.hidePrevButton ? " uk-hidden" : " disabled");
            }
            var nextButtonLabel = "Next";
            var prevButtonLabel = "Previous";
            var nextButtonStyle = "";
            var textColorNext = "";

            if (!this.isLastStep()) {
                textColorNext = this.props.textColorNext;
            }

            var nextButtonIcon = "arrow-circle-right";
            var prevButtonIcon = "arrow-circle-left";

            var disablePrevButton = false;
            var disableNextButton = false;
            if (this.props.steps[this.state.step - 1].nextButtonLabel) {
                nextButtonLabel = this.props.steps[this.state.step - 1].nextButtonLabel;
                nextButtonStyle = this.props.steps[this.state.step - 1].nextButtonStyle;
            } else if (this.isLastStep()) {
                disableNextButton = true;
            }
            if (this.props.steps[this.state.step - 1].prevButtonLabel) {
                prevButtonLabel = this.props.steps[this.state.step - 1].prevButtonLabel;
            } else if (this.isFirstStep()) {
                disablePrevButton = true;
            }

            var nextButton = this.props.useIcon ? _react2.default.createElement(_basic.Button, { icon: nextButtonIcon, flat: true, waves: true, size: 'large', style: this.props.nextButtonStyle,
                onclick: function onclick() {
                    return _this3.handleNextClick();
                }, disabled: disableNextButton,
                disableCooldown: true, iconColorClass: this.props.nextButtonIconColorClass }) : _react2.default.createElement(_basic.Button, { label: nextButtonLabel, flat: false, waves: true, style: nextButtonStyle, textColor: textColorNext,
                onclick: function onclick() {
                    return _this3.handleNextClick();
                }, disabled: disableNextButton,
                disableCooldown: true });
            var prevButton = this.props.useIcon ? _react2.default.createElement(_basic.Button, { icon: prevButtonIcon, flat: true, waves: true, size: 'large', style: this.props.prevButtonStyle,
                onclick: function onclick() {
                    return _this3.handlePrevClick();
                }, disabled: disablePrevButton,
                disableCooldown: true, iconColorClass: this.props.prevButtonIconColorClass }) : _react2.default.createElement(_basic.Button, { label: prevButtonLabel, flat: false, waves: true, style: this.props.prevButtonStyle,
                onclick: function onclick() {
                    return _this3.handlePrevClick();
                }, disabled: disablePrevButton, textColor: this.props.textColorPrev,
                disableCooldown: true });

            return _react2.default.createElement(
                'div',
                { className: 'wizard clearfix' },
                _react2.default.createElement(
                    'div',
                    { className: 'steps clearfix' },
                    _react2.default.createElement(
                        'ul',
                        { role: 'tablist' },
                        this.props.steps.map(function (item, index) {
                            var width = 0;
                            var titleClassName = "";
                            if (index == 0) {
                                titleClassName = "first";
                            }
                            if (index == _this3.state.totalSteps - 1) {
                                titleClassName = "last";
                                width = 100 - Number.parseInt(100 / _this3.state.totalSteps) * (_this3.state.totalSteps - 1);
                            } else {
                                width = Number.parseInt(100 / _this3.state.totalSteps);
                            }
                            if (index == _this3.state.step - 1) {
                                titleClassName = titleClassName + " current";
                            } else {
                                titleClassName = titleClassName + " disabled";
                            }
                            return _react2.default.createElement(
                                'li',
                                { key: item.title, role: 'tab', className: titleClassName, style: { width: width + "%" } },
                                _react2.default.createElement(
                                    'a',
                                    null,
                                    _react2.default.createElement(
                                        'span',
                                        { className: 'number' },
                                        index + 1
                                    ),
                                    ' ',
                                    _react2.default.createElement(
                                        'span',
                                        { className: 'title' },
                                        item.title
                                    )
                                )
                            );
                        })
                    )
                ),
                _react2.default.cloneElement(this.props.children[this.state.step - 1], { onRenderInnerView: function onRenderInnerView(innerView) {
                        return _this3.setState({ innerView: innerView });
                    } }),
                !this.state.innerView && _react2.default.createElement(
                    'div',
                    { className: 'actions clearfix', style: { backgroundColor: '' + this.props.backgroundColor } },
                    _react2.default.createElement(
                        'ul',
                        { role: 'menu' },
                        _react2.default.createElement(
                            'li',
                            { className: prevStepClassName },
                            prevButton
                        ),
                        _react2.default.createElement(
                            'li',
                            { className: nextStepClassName },
                            nextButton
                        )
                    )
                )
            );
        }
    }]);

    return Wizard;
}(_abstract.TranslatingComponent);