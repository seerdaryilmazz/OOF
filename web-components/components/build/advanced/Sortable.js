"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Sortable = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _layout = require("../layout");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Sortable = exports.Sortable = function (_React$Component) {
    _inherits(Sortable, _React$Component);

    function Sortable(props) {
        _classCallCheck(this, Sortable);

        var _this = _possibleConstructorReturn(this, (Sortable.__proto__ || Object.getPrototypeOf(Sortable)).call(this, props));

        _this.state = {
            id: _this.props.id ? _this.props.id : _uuid2.default.v4(),
            keyField: _this.props.keyField ? _this.props.keyField : "id",
            displayField: _this.props.displayField ? _this.props.displayField : "name",
            lastItems: null
        };
        return _this;
    }

    _createClass(Sortable, [{
        key: "initSortable",
        value: function initSortable() {
            var _this2 = this;

            var sortable = $('#' + this.state.id);
            var options = {};
            if (this.props.handleClass) {
                options.handleClass = this.props.handleClass;
            }
            if (this.props.dragCustomClass) {
                options.dragCustomClass = this.props.dragCustomClass;
            }
            UIkit.sortable(sortable, options);

            if (this.props.onchange) {
                sortable.on('stop.uk.sortable', function (e, so, de, a) {
                    var result = [];

                    sortable.find('li').each(function (index, li) {
                        var filtered = _lodash2.default.filter(_this2.props.items, function (item) {
                            var val = _lodash2.default.get(item, _this2.state.keyField);
                            return _lodash2.default.isEqual(_lodash2.default.isNumber(val) ? val.toString() : val, $(li).attr('id'));
                        });

                        if (filtered && filtered.length == 1) {
                            result.push(filtered[0]);
                        }
                    });

                    if (!_lodash2.default.isEqual(_this2.state.lastItems, result)) {
                        _this2.setState({ lastItems: result });
                        _this2.props.onchange(result);
                    }
                });
            }
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.initSortable();
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            this.initSortable();
        }
    }, {
        key: "renderItem",
        value: function renderItem(item) {
            var buttons = null;
            var width = "1-1";
            if (this.props.buttons && this.props.buttons.length > 0) {
                buttons = _react2.default.createElement(
                    _layout.GridCell,
                    { width: "1-10", noMargin: "true" },
                    this.props.buttons.map(function (button) {
                        var className = "uk-icon-hover uk-icon-" + button.icon;
                        return _react2.default.createElement("a", { href: "javascript:void(0)", className: className, onClick: function onClick() {
                                return button.action(item);
                            } });
                    })
                );
                width = "9-10";
            }

            return _react2.default.createElement(
                _layout.Grid,
                null,
                _react2.default.createElement(
                    _layout.GridCell,
                    { width: width, noMargin: "true" },
                    this.props.renderItem ? this.props.renderItem(item) : item[this.state.displayField]
                ),
                buttons
            );
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            var items = [];

            if (this.props.items && this.props.items.length > 0) {
                items = this.props.items.map(function (item) {
                    var val = _lodash2.default.get(item, _this3.state.keyField);
                    return _react2.default.createElement(
                        "li",
                        { key: val, id: val, style: { borderWidth: 0 } },
                        _this3.renderItem(item)
                    );
                });
            }
            return _react2.default.createElement(
                "ul",
                { key: this.state.id, id: this.state.id, className: "uk-sortable md-list" },
                items
            );
        }
    }]);

    return Sortable;
}(_react2.default.Component);