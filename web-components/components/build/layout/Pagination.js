"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Pagination = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Pagination = exports.Pagination = function (_React$Component) {
    _inherits(Pagination, _React$Component);

    function Pagination(props) {
        _classCallCheck(this, Pagination);

        return _possibleConstructorReturn(this, (Pagination.__proto__ || Object.getPrototypeOf(Pagination)).call(this, props));
    }

    _createClass(Pagination, [{
        key: "getPaginationControlButton",
        value: function getPaginationControlButton(disabled, icon, fn) {
            if (disabled) {
                return _react2.default.createElement(
                    "li",
                    { key: _uuid2.default.v4(), className: "uk-disabled" },
                    _react2.default.createElement(
                        "span",
                        null,
                        _react2.default.createElement("i", { className: icon })
                    )
                );
            } else {
                return _react2.default.createElement(
                    "li",
                    { key: _uuid2.default.v4() },
                    _react2.default.createElement(
                        "a",
                        { href: "javascript:void(0)", onClick: fn },
                        _react2.default.createElement("i", { className: icon })
                    )
                );
            }
        }
    }, {
        key: "paginationGoBack",
        value: function paginationGoBack() {
            this.paginationGo(this.props.page - 1);
        }
    }, {
        key: "paginationGoForward",
        value: function paginationGoForward() {
            this.paginationGo(this.props.page + 1);
        }
    }, {
        key: "paginationGo",
        value: function paginationGo(page) {
            this.props.onPageChange(page);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var pagination = null;
            var totalElements = null;

            if (this.props.totalElements > 0) {
                totalElements = _react2.default.createElement(
                    "div",
                    { className: "paginationTotalElements" },
                    "Total : ",
                    _react2.default.createElement(
                        "b",
                        null,
                        this.props.totalElements
                    )
                );
            }

            if (this.props.totalPages > 1) {
                var paginationElements = [];

                paginationElements.push(this.getPaginationControlButton(this.props.page == 1, "uk-icon-angle-double-left", function () {
                    return _this2.paginationGo(1);
                }));
                paginationElements.push(this.getPaginationControlButton(this.props.page == 1, "uk-icon-angle-left", function () {
                    return _this2.paginationGoBack();
                }));

                if (this.props.range) {
                    if (this.props.page > this.props.range + 1) {
                        paginationElements.push(_react2.default.createElement(
                            "li",
                            { key: _uuid2.default.v4(), className: "uk-disabled" },
                            _react2.default.createElement(
                                "span",
                                null,
                                _react2.default.createElement(
                                    "i",
                                    { className: "uk-icon" },
                                    "..."
                                )
                            )
                        ));
                    }

                    var _loop = function _loop(i) {
                        var element = _this2.props.page + i;
                        if (element >= 1 && element <= _this2.props.totalPages) {
                            if (_this2.props.page == element) {
                                paginationElements.push(_react2.default.createElement(
                                    "li",
                                    { key: _uuid2.default.v4(), className: "uk-active" },
                                    _react2.default.createElement(
                                        "span",
                                        { key: _uuid2.default.v4() },
                                        element
                                    )
                                ));
                            } else {
                                paginationElements.push(_react2.default.createElement(
                                    "li",
                                    { key: _uuid2.default.v4() },
                                    _react2.default.createElement(
                                        "a",
                                        { href: "javascript:void(0)", onClick: function onClick() {
                                                return _this2.paginationGo(element);
                                            } },
                                        element
                                    )
                                ));
                            }
                        }
                    };

                    for (var i = -this.props.range; i <= this.props.range; i++) {
                        _loop(i);
                    }
                    if (this.props.page < this.props.totalPages - this.props.range) {
                        paginationElements.push(_react2.default.createElement(
                            "li",
                            { key: _uuid2.default.v4(), className: "uk-disabled" },
                            _react2.default.createElement(
                                "span",
                                null,
                                _react2.default.createElement(
                                    "i",
                                    { className: "uk-icon" },
                                    "..."
                                )
                            )
                        ));
                    }
                } else {
                    var _loop2 = function _loop2(i) {
                        if (_this2.props.page == i) {
                            paginationElements.push(_react2.default.createElement(
                                "li",
                                { key: _uuid2.default.v4(), className: "uk-active" },
                                _react2.default.createElement(
                                    "span",
                                    { key: _uuid2.default.v4() },
                                    i
                                )
                            ));
                        } else {
                            paginationElements.push(_react2.default.createElement(
                                "li",
                                { key: _uuid2.default.v4() },
                                _react2.default.createElement(
                                    "a",
                                    { href: "javascript:void(0)", onClick: function onClick() {
                                            return _this2.paginationGo(i);
                                        } },
                                    i
                                )
                            ));
                        }
                    };

                    for (var i = 1; i <= this.props.totalPages; i++) {
                        _loop2(i);
                    }
                }

                paginationElements.push(this.getPaginationControlButton(this.props.page == this.props.totalPages, "uk-icon-angle-right", function () {
                    return _this2.paginationGoForward();
                }));
                paginationElements.push(this.getPaginationControlButton(this.props.page == this.props.totalPages, "uk-icon-angle-double-right", function () {
                    return _this2.paginationGo(_this2.props.totalPages);
                }));

                pagination = _react2.default.createElement(
                    "ul",
                    { key: _uuid2.default.v4(), className: "uk-pagination" },
                    paginationElements
                );
            }

            return _react2.default.createElement(
                "div",
                null,
                pagination,
                totalElements
            );
        }
    }]);

    return Pagination;
}(_react2.default.Component);