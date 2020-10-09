'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GridCell = exports.Grid = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Grid = exports.Grid = function (_React$Component) {
    _inherits(Grid, _React$Component);

    function Grid(props) {
        _classCallCheck(this, Grid);

        var _this = _possibleConstructorReturn(this, (Grid.__proto__ || Object.getPrototypeOf(Grid)).call(this, props));

        _this.state = {};
        return _this;
    }

    _createClass(Grid, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'render',
        value: function render() {
            var className = "uk-grid";
            var matchOptions = "";
            if (this.props.gridMargin) {
                className = className + " uk-grid-margin";
            } else {
                className = className + " uk-row-first";
            }
            if (this.props.collapse) {
                className = className + " uk-grid-collapse";
            }
            if (this.props.divider) {
                className = className + " uk-grid-divider";
            }
            if (this.props.removeTopMargin) {
                className = className + " uk-margin-top-remove";
            }
            if (this.props.hidden) {
                className = className + " uk-hidden";
            }
            if (this.props.gridMatch) {
                className = className + " uk-grid-match";
                matchOptions = "{target:'.md-card'}";
            }
            if (this.props.overflow) {
                className = className + " uk-overflow-container";
            }
            if (this.props.smallGutter) {
                className = className + " uk-grid-small";
            }

            return _react2.default.createElement(
                'div',
                { className: className, style: this.props.style, 'data-uk-grid-match': matchOptions },
                this.props.children
            );
        }
    }]);

    return Grid;
}(_react2.default.Component);

var GridCell = exports.GridCell = function (_React$Component2) {
    _inherits(GridCell, _React$Component2);

    function GridCell(props) {
        _classCallCheck(this, GridCell);

        var _this2 = _possibleConstructorReturn(this, (GridCell.__proto__ || Object.getPrototypeOf(GridCell)).call(this, props));

        var id = _this2.props.id ? _this2.props.id : _uuid2.default.v4();
        _this2.state = { id: id };
        return _this2;
    }

    _createClass(GridCell, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'render',
        value: function render() {
            var className = [];

            if (this.props.width) {
                className.push("uk-width-medium-" + this.props.width);
            } else if (this.props.widthSmall) {
                className.push("uk-width-small-" + this.props.widthSmall);
            } else if (this.props.widthLarge) {
                className.push("uk-width-large-" + this.props.widthLarge);
            } else {
                className.push("uk-width-medium-1-1");
            }

            if (!this.props.noMargin) {
                if (this.props.margin) {
                    className.push("uk-margin-" + this.props.margin);
                } else {
                    className.push("uk-grid-margin");
                }
            }
            if (this.props.hidden) {
                className.push("uk-hidden");
            }

            if (this.props.center) {
                className.push("uk-container-center");
            }
            if (this.props.textCenter) {
                className.push("uk-text-center");
            }

            var children = this.props.children;
            if (this.props.verticalAlign) {
                children = _react2.default.createElement(
                    'div',
                    { className: "uk-vertical-align-" + this.props.verticalAlign },
                    this.props.children
                );
                className.push("uk-vertical-align");
            }
            return _react2.default.createElement(
                'div',
                { className: className.join(" "), id: this.state.id, style: this.props.style },
                children
            );
        }
    }]);

    return GridCell;
}(_react2.default.Component);