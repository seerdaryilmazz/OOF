"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.WorkingHour = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WorkingHour = exports.WorkingHour = function (_React$Component) {
    _inherits(WorkingHour, _React$Component);

    function WorkingHour(props) {
        _classCallCheck(this, WorkingHour);

        var _this = _possibleConstructorReturn(this, (WorkingHour.__proto__ || Object.getPrototypeOf(WorkingHour)).call(this, props));

        _this.MODE_NONE = "none";
        _this.MODE_WRITE = "write";
        _this.MODE_ERASE = "erase";

        _this.state = { mode: _this.MODE_NONE };

        _this.CELLVALUE_EMPTY = "0";
        _this.CELLVALUE_FILLED = "1";

        _this.CONFIG_DEFAULT_START_HOUR = "08:00";
        _this.CONFIG_DEFAULT_END_HOUR = "17:00";

        _this.CONFIG_DEFAULT_INTERVAL = 30;

        _this.CONFIG_DEFAULT_CONTENT_HEADER_RATIO = 1;

        _this.DAYS = [{ key: 1, code: "MONDAY", value: "Monday" }, { key: 2, code: "TUESDAY", value: "Tuesday" }, { key: 3, code: "WEDNESDAY", value: "Wednesday" }, { key: 4, code: "THURSDAY", value: "Thursday" }, { key: 5, code: "FRIDAY", value: "Friday" }, { key: 6, code: "SATURDAY", value: "Saturday" }, { key: 7, code: "SUNDAY", value: "Sunday" }];

        var propsData = [];
        if (_this.props.data) {
            propsData = _this.props.data;
        }

        var config = _this.loadConfig(_this.props);
        var data = _this.formatData(propsData, config);

        _this.state.config = config;
        _this.state.data = data;

        return _this;
    }

    _createClass(WorkingHour, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            var config = this.state.config;

            var data = void 0;
            if (nextProps.data) {
                data = this.formatData(nextProps.data, config);
            }
            this.setState({ data: data });
        }
    }, {
        key: "loadConfig",
        value: function loadConfig(props) {

            var config = {
                startHour: this.CONFIG_DEFAULT_START_HOUR,
                endHour: this.CONFIG_DEFAULT_END_HOUR,
                days: this.DAYS,
                interval: this.CONFIG_DEFAULT_INTERVAL,
                ratio: this.CONFIG_DEFAULT_CONTENT_HEADER_RATIO
            };

            if (props) {
                if (props.startHour) {
                    config.startHour = props.startHour;
                }
                if (props.endHour) {
                    config.endHour = props.endHour;
                }
                if (props.interval) {
                    config.interval = props.interval;
                }
                if (props.days) {
                    config.days = this.DAYS.filter(function (d) {
                        return props.days.includes(d.code);
                    });
                }
                if (props.ratio) {
                    config.ratio = props.ratio;
                }
            }

            var moment = require('moment');
            var currHour = moment(config.startHour, "HH:mm", true);
            var endHour = moment(config.endHour, "HH:mm", true);

            config.hours = [];
            while (!currHour.isAfter(endHour)) {
                var elem = { key: config.hours.length, startValue: currHour.format("HH:mm"), startMoment: moment(currHour.format("HH:mm"), "HH:mm", true) };
                config.hours.push(elem);
                currHour.add(config.interval, 'minutes');
                elem.endValue = currHour.format("HH:mm");
                elem.endMoment = moment(currHour.format("HH:mm"), "HH:mm", true);
            }

            return config;
        }
    }, {
        key: "formatData",
        value: function formatData(incData, config) {
            var _this2 = this;

            var moment = require('moment');

            var result = this.initializeEmptyData(config);

            if (incData) {
                config.days.forEach(function (configDay) {

                    var rangeList = incData.find(function (i) {
                        return i.day.code == configDay.code;
                    });

                    if (rangeList && rangeList.timeWindows) {
                        rangeList.timeWindows.forEach(function (range) {
                            if (range.startTime && range.endTime) {

                                var startTime = moment(range.startTime, "HH:mm", true);
                                var endTime = moment(range.endTime, "HH:mm", true);

                                config.hours.forEach(function (configHour) {

                                    if ((startTime.diff(configHour.endMoment) < 0 || configHour.endMoment.format("HH:mm") == "00:00") && (endTime.diff(configHour.startMoment) > 0 || endTime.format("HH:mm") == "00:00")) {
                                        result[configDay.key][configHour.key] = _this2.CELLVALUE_FILLED;
                                    }
                                });
                            } else {
                                console.error("Invalid data in working hours component");
                            }
                        });
                    }
                });
            }

            return result;
        }
    }, {
        key: "initializeEmptyData",
        value: function initializeEmptyData(config) {
            var _this3 = this;

            var result = {};

            config.days.forEach(function (day) {
                result[day.key] = {};
                config.hours.forEach(function (hour) {
                    result[day.key][hour.key] = _this3.CELLVALUE_EMPTY;
                });
            });

            return result;
        }
    }, {
        key: "handleMouseClickCell",
        value: function handleMouseClickCell(day, hour) {
            var _this4 = this;

            var data = this.state.data;

            var clickedCell = data[day][hour];

            if (this.state.mode == this.MODE_NONE) {
                if (clickedCell == this.CELLVALUE_FILLED) {
                    this.setState({ mode: this.MODE_ERASE, currentSelection: { startDay: day, startHour: hour } }, function () {
                        _this4.handleMouseOverCell(day, hour);
                    });
                } else {
                    this.setState({ mode: this.MODE_WRITE, currentSelection: { startDay: day, startHour: hour } }, function () {
                        _this4.handleMouseOverCell(day, hour);
                    });
                }
            } else {
                this.finalizeData();
            }
        }
    }, {
        key: "finalizeData",
        value: function finalizeData() {
            var _this5 = this;

            var data = this.state.data;
            var currentSelection = this.state.currentSelection;

            var startDayIndex = currentSelection.startDay <= currentSelection.endDay ? currentSelection.startDay : currentSelection.endDay;
            var endDayIndex = currentSelection.startDay <= currentSelection.endDay ? currentSelection.endDay : currentSelection.startDay;
            var startHourIndex = currentSelection.startHour <= currentSelection.endHour ? currentSelection.startHour : currentSelection.endHour;
            var endHourIndex = currentSelection.startHour <= currentSelection.endHour ? currentSelection.endHour : currentSelection.startHour;

            var iDay = void 0;
            for (iDay = startDayIndex; iDay <= endDayIndex; iDay = iDay + 1) {
                var iHour = void 0;
                for (iHour = startHourIndex; iHour <= endHourIndex; iHour = iHour + 1) {
                    if (this.state.mode == this.MODE_ERASE) {
                        data[iDay][iHour] = this.CELLVALUE_EMPTY;
                    } else if (this.state.mode == this.MODE_WRITE) {
                        data[iDay][iHour] = this.CELLVALUE_FILLED;
                    }
                }
            }

            this.setState({ data: data, mode: this.MODE_NONE, currentSelection: null }, function () {
                var dataToBeExported = _this5.prepareDataForExport(_this5.state.data);
                _this5.props.dataUpdateHandler(dataToBeExported);
            });
        }
    }, {
        key: "prepareDataForExport",
        value: function prepareDataForExport(data) {
            var _this6 = this;

            var config = this.state.config;
            var result = [];

            var startHour = void 0;
            var possibleEndHour = void 0;
            config.days.forEach(function (day) {
                var dayKey = day.key;
                var resultElem = {};
                resultElem.day = day;
                resultElem.timeWindows = [];
                config.hours.forEach(function (hour) {
                    var hourKey = hour.key;
                    if (data[dayKey][hourKey] == _this6.CELLVALUE_FILLED) {
                        if (!startHour) {
                            startHour = hour.startValue;
                        }
                        possibleEndHour = hour.endValue;
                        if (hour.startValue == config.endHour) {
                            resultElem.timeWindows.push({ startTime: startHour, endTime: possibleEndHour });
                            startHour = null;
                        }
                    } else {
                        if (startHour) {
                            resultElem.timeWindows.push({ startTime: startHour, endTime: possibleEndHour });
                            startHour = null;
                        }
                        possibleEndHour = null;
                    }
                });
                if (resultElem) {
                    result.push(resultElem);
                }
            });

            return result;
        }
    }, {
        key: "handleMouseOverCell",
        value: function handleMouseOverCell(day, hour) {
            var currentSelection = this.state.currentSelection;

            if (currentSelection) {
                currentSelection.endDay = day;
                currentSelection.endHour = hour;
                this.setState({ currentSelection: currentSelection });
            }
        }
    }, {
        key: "renderContent",
        value: function renderContent(day, hour) {

            var data = this.state.data;
            var mode = this.state.mode;

            if (mode != this.MODE_NONE && this.areValuesInsideCurrentSelection(day, hour)) {
                if (mode == this.MODE_WRITE) {
                    return _react2.default.createElement(
                        "div",
                        { style: { backgroundColor: "#a5d6a7" } },
                        "\xA0"
                    );
                } else if (mode == this.MODE_ERASE) {
                    return _react2.default.createElement(
                        "div",
                        { style: { backgroundColor: "#ff5252" } },
                        "\xA0"
                    );
                }
            }
            if (data[day][hour] == this.CELLVALUE_FILLED) {
                return _react2.default.createElement(
                    "div",
                    { style: { backgroundColor: "#448aff" } },
                    "\xA0"
                );
            } else {
                return _react2.default.createElement(
                    "div",
                    { style: { backgroundColor: "#FFFFFF" } },
                    "\xA0"
                );
            }
        }
    }, {
        key: "areValuesInsideCurrentSelection",
        value: function areValuesInsideCurrentSelection(day, hour) {
            var currentSelection = this.state.currentSelection;

            if (!currentSelection) {
                return false;
            }

            var isInsideDays = false;
            var isInsideHours = false;
            if (day <= currentSelection.startDay && day >= currentSelection.endDay || day >= currentSelection.startDay && day <= currentSelection.endDay) {
                isInsideDays = true;
            }
            if (hour <= currentSelection.startHour && hour >= currentSelection.endHour || hour >= currentSelection.startHour && hour <= currentSelection.endHour) {
                isInsideHours = true;
            }

            return isInsideDays && isInsideHours;
        }
    }, {
        key: "renderTable",
        value: function renderTable() {
            var _this7 = this;

            var config = this.state.config;

            var headers = [];

            headers.push(_react2.default.createElement("th", { key: "header-init" }));

            var hIndex = 0;
            config.hours.forEach(function (hour) {
                if (hIndex % config.ratio == 0) {
                    headers.push(_react2.default.createElement(
                        "th",
                        { colSpan: config.ratio, className: "uk-text-left", style: { padding: "2px" }, key: "header-" + hour.key },
                        hour.startValue
                    ));
                }
                hIndex++;
            });

            var days = config.days.map(function (day) {
                var dayKey = day.key;
                var hours = config.hours.map(function (hour) {
                    var hourKey = hour.key;
                    return _react2.default.createElement(
                        "td",
                        { key: dayKey + "-" + hourKey, style: { border: "1px solid #ddd", padding: "1px" },
                            "data-uk-tooltip": true, title: hour.startValue + " - " + hour.endValue + ", " + day.value,
                            onMouseDown: function onMouseDown(event) {
                                _this7.handleMouseClickCell(dayKey, hourKey);
                            }, onMouseOver: function onMouseOver(event) {
                                _this7.handleMouseOverCell(dayKey, hourKey);
                            } },
                        _this7.renderContent(dayKey, hourKey)
                    );
                });
                hours.splice(0, 0, _react2.default.createElement(
                    "td",
                    { key: dayKey + "-init" },
                    day.value
                ));

                return _react2.default.createElement(
                    "tr",
                    { key: "day-" + day.key },
                    hours
                );
            });

            return _react2.default.createElement(
                "table",
                { className: "uk-table uk-table-condensed" },
                _react2.default.createElement(
                    "thead",
                    null,
                    _react2.default.createElement(
                        "tr",
                        null,
                        headers
                    )
                ),
                _react2.default.createElement(
                    "tbody",
                    null,
                    days
                )
            );
        }
    }, {
        key: "render",
        value: function render() {

            var data = this.state.data;
            var config = this.state.config;

            if (!data || !config) {
                return null;
            }

            return _react2.default.createElement(
                "div",
                null,
                this.renderTable()
            );
        }
    }]);

    return WorkingHour;
}(_react2.default.Component);