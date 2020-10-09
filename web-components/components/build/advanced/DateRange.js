"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DateRange = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

var _Date = require("./Date");

var _Grid = require("../layout/Grid");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DateRange = exports.DateRange = function (_React$Component) {
    _inherits(DateRange, _React$Component);

    function DateRange(props) {
        _classCallCheck(this, DateRange);

        var _this = _possibleConstructorReturn(this, (DateRange.__proto__ || Object.getPrototypeOf(DateRange)).call(this, props));

        var id = _this.props.id;
        if (!id) {
            id = _uuid2.default.v4();
        }
        _this.state = { startId: id + "_start", endId: id + "_end" };
        if (_this.props.value) {
            _this.state.startDate = _this.props.value.startDate;
            _this.state.endDate = _this.props.value.endDate;
        }
        return _this;
    }

    _createClass(DateRange, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            this.setState({
                startDate: nextProps.value ? nextProps.value.startDate : '',
                endDate: nextProps.value ? nextProps.value.endDate : ''
            });
        }
    }, {
        key: "componentDidUpdate",
        value: function componentDidUpdate() {
            var $dp_start = $('#' + this.state.startId),
                $dp_end = $('#' + this.state.endId);

            this.end_date.options.minDate = this.defaultTo($dp_start.val(), false);
            this.start_date.options.maxDate = this.defaultTo($dp_end.val(), false);
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            var $dp_start = $('#' + this.state.startId),
                $dp_end = $('#' + this.state.endId);

            this.start_date = $.UIkit.datepicker($dp_start);
            this.end_date = $.UIkit.datepicker($dp_end);

            this.end_date.options.minDate = this.defaultTo($dp_start.val(), false);
            this.start_date.options.maxDate = this.defaultTo($dp_end.val(), false);

            $dp_start.on('change', function () {
                _this2.end_date.options.minDate = _this2.defaultTo($dp_start.val(), false);
                _this2.handleStartDate($dp_start.val());
                setTimeout(function () {
                    $dp_end.focus();
                }, 300);
            });

            $dp_end.on('change', function () {
                _this2.start_date.options.maxDate = _this2.defaultTo($dp_end.val(), false);
                _this2.handleEndDate($dp_end.val());
            });
        }
    }, {
        key: "defaultTo",
        value: function defaultTo(value, defaultValue) {
            return _.isEmpty(value) ? defaultValue : value;
        }
    }, {
        key: "handleStartDate",
        value: function handleStartDate(value) {
            var state = _.cloneDeep(this.state);
            state.startDate = value;
            this.setState(state);
            this.handleOnChange(state);
        }
    }, {
        key: "handleEndDate",
        value: function handleEndDate(value) {
            var state = _.cloneDeep(this.state);
            state.endDate = value;
            this.setState(state);
            this.handleOnChange(state);
        }
    }, {
        key: "handleOnChange",
        value: function handleOnChange(state) {
            if (state.startDate || state.endDate) {
                this.props.onchange && this.props.onchange({ startDate: state.startDate, endDate: state.endDate });
            } else {
                this.props.onchange && this.props.onchange(null);
            }
        }
    }, {
        key: "render",
        value: function render() {
            var style = {};
            if (this.props.hidden) {
                style.display = 'none';
            }

            var width = this.props.vertical ? "1-1" : "1-2";

            var startRequired = this.props.required || this.props.startRequired;
            var endRequired = this.props.required || this.props.endRequired;

            return _react2.default.createElement(
                _Grid.Grid,
                { collapse: true },
                _react2.default.createElement(
                    _Grid.GridCell,
                    { width: width, noMargin: this.props.noMargin },
                    _react2.default.createElement(_Date.Date, { id: this.state.startId, label: this.props.startDateLabel,
                        value: this.state.startDate, required: startRequired, hideIcon: this.props.hideIcon,
                        minDate: this.props.minDate })
                ),
                _react2.default.createElement(
                    _Grid.GridCell,
                    { width: width, noMargin: this.props.noMargin },
                    _react2.default.createElement(_Date.Date, { id: this.state.endId, label: this.props.endDateLabel,
                        value: this.state.endDate, required: endRequired, hideIcon: this.props.hideIcon,
                        maxDate: this.props.maxDate })
                )
            );
        }
    }]);

    return DateRange;
}(_react2.default.Component);