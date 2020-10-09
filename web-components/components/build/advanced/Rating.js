"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Rating = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _layout = require("../layout");

var _abstract = require("../abstract");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rating = exports.Rating = function (_TranslatingComponent) {
    _inherits(Rating, _TranslatingComponent);

    function Rating(props) {
        _classCallCheck(this, Rating);

        var _this = _possibleConstructorReturn(this, (Rating.__proto__ || Object.getPrototypeOf(Rating)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(Rating, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.setState({ value: this.props.value });
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            this.setState({ value: nextProps.value });
        }
    }, {
        key: "handleChange",
        value: function handleChange(e, value) {
            e.preventDefault();
            this.setState({ value: value });
            this.props.onchange && this.props.onchange(value);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var value = this.state.value || 1;
            var count = this.props.count || 10;
            var stars = [];

            var _loop = function _loop(i) {
                var icon = "star_border";
                if (i <= value) {
                    icon = "star";
                }
                stars.push(_react2.default.createElement(
                    "a",
                    { key: i, href: "#", onClick: function onClick(e) {
                            return _this2.handleChange(e, i);
                        } },
                    _react2.default.createElement(
                        "i",
                        { className: "material-icons md-36" },
                        icon
                    )
                ));
            };

            for (var i = 1; i <= count; i++) {
                _loop(i);
            }
            return _react2.default.createElement(
                "div",
                { className: "md-input-wrapper md-input-filled" },
                _react2.default.createElement(
                    "label",
                    null,
                    this.props.label
                ),
                stars
            );
        }
    }]);

    return Rating;
}(_abstract.TranslatingComponent);