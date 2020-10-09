"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PageWizard = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PageWizard = exports.PageWizard = function (_React$Component) {
    _inherits(PageWizard, _React$Component);

    function PageWizard(props) {
        _classCallCheck(this, PageWizard);

        var _this = _possibleConstructorReturn(this, (PageWizard.__proto__ || Object.getPrototypeOf(PageWizard)).call(this, props));

        _this.createHeaders = function (currPageUrl, currentStep, children, self) {

            var enableTabSwitch = false;

            if (self.props.enableTabSwitch) {
                enableTabSwitch = true;
            }

            var totalChildren = children.length;

            var index = 1;

            return _react2.default.createElement(
                "div",
                { className: "steps clearfix" },
                _react2.default.createElement(
                    "ul",
                    { role: "tablist" },
                    children.map(function (child) {

                        var className = self.getClassName(index, currentStep, totalChildren);

                        var href = currPageUrl + "/" + index;

                        if (!enableTabSwitch) {
                            href = "javascript:void(null);";
                        }

                        return _react2.default.createElement(
                            "li",
                            { key: index, role: "tab", className: className, "aria-disabled": "false",
                                "aria-selected": currentStep == index },
                            _react2.default.createElement(
                                "a",
                                { id: "wizard_advanced-t-0", href: href,
                                    "aria-controls": "wizard_advanced-p-0" },
                                _react2.default.createElement(
                                    "span",
                                    { className: "number" },
                                    index++
                                ),
                                _react2.default.createElement(
                                    "span",
                                    { className: "title" },
                                    child.props.header
                                )
                            )
                        );
                    })
                )
            );
        };

        _this.getClassName = function (index, currentStep, totalChildren) {

            var className = "";
            if (index == 1) {
                className = "first ";
            }

            if (index < currentStep) {
                className += "done ";
            } else if (currentStep == index) {
                className += "current ";
            }

            if (index == totalChildren) {
                className += "last";
            }

            return className;
        };

        _this.createFooters = function (currPageUrl, currentStep, totalChildrenNo, currentChild, self) {

            var prevElem = self.getFooterPrevElem(currPageUrl, currentStep, currentChild, self);
            var nextElem = self.getFooterNextElem(currPageUrl, currentStep, totalChildrenNo, currentChild, self);

            return _react2.default.createElement(
                "div",
                { className: "actions clearfix" },
                _react2.default.createElement(
                    "ul",
                    { role: "menu", "aria-label": "Pagination" },
                    prevElem,
                    nextElem
                )
            );
        };

        _this.getFooterPrevElem = function (currPageUrl, currentStep, currentChild, self) {

            var nextPageHref = currPageUrl + "/" + (currentStep - 1);

            var className = "button_previous";

            if (currentStep == 1) {
                nextPageHref = currPageUrl + "/1";
                className = "button_previous disabled";
            }

            return _react2.default.createElement(
                "li",
                { className: className },
                _react2.default.createElement(
                    "a",
                    { href: "javascript:void(null);", onClick: function onClick() {
                            return self.previousStep(nextPageHref);
                        },
                        role: "menuitem" },
                    _react2.default.createElement(
                        "i",
                        { className: "material-icons" },
                        "\uE314"
                    ),
                    "Previous"
                )
            );
        };

        _this.getFooterNextElem = function (currPageUrl, currentStep, totalChildrenNo, currentChild, self) {

            var nextPageHref = currPageUrl + "/" + (currentStep - 1 + 2);

            var className = "button_next";

            var label = "Next";
            var icon = _react2.default.createElement(
                "i",
                { className: "material-icons" },
                "\uE315"
            );

            if (currentStep == totalChildrenNo) {
                nextPageHref = "";
                className = "button_finish";
                label = "Finish";
                icon = null;
            }

            return _react2.default.createElement(
                "li",
                { className: className },
                _react2.default.createElement(
                    "a",
                    { href: "javascript:void(null);",
                        onClick: function onClick() {
                            return self.tryAdvanceNextStep(nextPageHref, currentStep, totalChildrenNo, currentChild, self);
                        },
                        role: "menuitem" },
                    label,
                    icon
                )
            );
        };

        _this.previousStep = function (newLocation) {
            window.location = newLocation;
        };

        _this.tryAdvanceNextStep = function (newLocation, currentStep, totalChildrenNo, currentChild, self) {

            if (currentChild.props.onComplete) {
                var result = currentChild.props.onComplete(currentStep);
                if (!result) {
                    return;
                }
            }

            if (currentStep == totalChildrenNo) {
                self.finalizeWizard(self);
            } else {
                window.location = newLocation;
            }
        };

        _this.finalizeWizard = function (self) {
            if (self.props.onComplete) {
                self.props.onComplete();
            }

            if (self.props.onCompleteHref) {
                window.location = self.props.onCompleteHref;
            }
        };

        _this.state = {};
        return _this;
    }

    _createClass(PageWizard, [{
        key: "render",
        value: function render() {

            var self = this;

            var currentStep = this.props.currentStep;

            var currPageUrl = this.props.currPageUrl;

            var children = this.props.children;
            var currentChild = this.props.children[this.props.currentStep - 1];

            var headers = this.createHeaders(currPageUrl, currentStep, children, self);
            var footers = this.createFooters(currPageUrl, currentStep, children.length, currentChild, self);

            var headerName = children[currentStep - 1].props.header;

            if (currentChild.props.beforeLoad) {
                currentChild.props.beforeLoad(currentStep);
            }

            return _react2.default.createElement(
                "div",
                { id: "wizard_advanced", role: "application", className: "wizard clearfix" },
                headers,
                footers,
                _react2.default.createElement(
                    "h3",
                    { id: "wizard_advanced-h-0", tabIndex: "-1", className: "title" },
                    headerName
                ),
                _react2.default.createElement(
                    "div",
                    { className: "content clearfix" },
                    currentChild
                )
            );
        }
    }]);

    return PageWizard;
}(_react2.default.Component);