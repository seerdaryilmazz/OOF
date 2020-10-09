"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TimelineTable = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _abstract = require("../abstract");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**

 *  value:  array of data, each data contains n fields, each field is a instance of  "DayAndTime.jsx" object
 *          format:
 *          [
 *                  {
 *                      "keyField": "8f5cd5f3-6293-46fc-b519-2a897c2fecfc"
 *                      "field1": {
 *                          "day": {
 *                              "id": "THURSDAY",
 *                              "code": "THURSDAY",
 *                              "name": "Thursday"
 *                           },
 *                          "time": "04:00",
 *                          "dayIndex": 3,
 *                          "weekOffset": 0,
 *                          "weekDescription": "Same Week"
 *                          },
 *                       "field2,
 *                       field3,
 *                       ...
 *                  },
 *                  data2,
 *                  data3,
 *                  ...
 *            ]
 *
 *  keyField:   attribute of data, which is used as primary key
 *           format: string
 *  baseField:  attribute of the data that is used to construct green bars
 *          format: string
 *
 *  fields: fields to be displayed
 *          format: {[{id: "field2", color: "color1", description: "legend description 1"},
 *                   {id: "field3", color: "color2", description: "legend description 2"}]}
 *
 *  editHandler: function called upon clicking edit icon near green bars
 *          format: {(dataEntry) => this.prepareForEdit(dataEntry)}
 *
 *  deleteHandler: function called upon clicking delete icon near green bars
 *          format: {(dataEntry) => this.handleDelete(dataEntry)}

 *  inverted(boolean): false: start bar from current data's baseField, end at following data's baseField
 *                     true: start bar from previous data's baseField, end at data's baseField
 *
 *  fillWeek(boolean): copy the first element(or last) and add it at the end of the list(or start) to fill the week for better understanding of the graph
 *
 */
var TimelineTable = exports.TimelineTable = function (_TranslatingComponent) {
    _inherits(TimelineTable, _TranslatingComponent);

    function TimelineTable(props) {
        _classCallCheck(this, TimelineTable);

        var _this = _possibleConstructorReturn(this, (TimelineTable.__proto__ || Object.getPrototypeOf(TimelineTable)).call(this, props));

        _this.state = {};

        _this.WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        _this.DEFAULT_ICON = "ellipsis-v";
        return _this;
    }

    _createClass(TimelineTable, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            this.loadData(this.props);
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            this.loadData(nextProps);
        }
    }, {
        key: "loadData",
        value: function loadData(props) {
            this.setState({ data: _lodash2.default.cloneDeep(props.value), inverted: props.inverted, fillWeek: props.fillWeek });
        }
    }, {
        key: "handleEdit",
        value: function handleEdit(data) {
            this.props.editHandler(data[this.props.keyField]);
        }
    }, {
        key: "handleDelete",
        value: function handleDelete(data) {
            this.props.deleteHandler(data[this.props.keyField]);
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var baseField = this.props.baseField;
            var fields = this.props.fields;

            var data = this.state.data;

            if (!baseField || !data || data.length == 0) {
                return null;
            }

            //STARTS-1:
            //!!!determine the start end end points of the green bars by using given dates in "basefield",
            //also finds lowest weekoffset of the graph, which will be used later for adjusting data and fit it in graph
            var graphData = [];

            var lowestWeekOffset = 0;

            data.forEach(function (d, i) {

                //Not inverted: bars start with their respective data's date, ends with following data's end date
                // first green bar starts with "first elements date", ends with "following elements date"
                // seconds green bar starts with "second elements date", ends with "following elements date" and goes on...
                // last green bar starts with "last elements date", ends with "first elements date + 1 week"

                //Inverted: bars start with previous data's date, ends with their respective data's date
                // bars starts with previous data's given date, ends with currents data's end date
                // first green bar starts with "first elements date", ends with "following elements date"
                //seconds green bar starts with "second elements date", ends with "following elements date" and goes on...
                // last green bar starts with "last elements date", ends with "first elements date + 1 week"

                //Not Inverted:  d1---1. element---d2
                //                                 d2---2. element---d3
                //                                                   d3---3. element---d1
                //Inverted:      d3---1. element---d1
                //                                 d1---2. element---d2
                //                                                   d2---3. element---d3

                if (!_this2.state.inverted) {
                    d.start = d[baseField];
                    if (i == data.length - 1) {
                        d.end = _lodash2.default.cloneDeep(data[0][baseField]);
                        d.end.weekOffset = d.end.weekOffset + 1;
                    } else {
                        d.end = _lodash2.default.cloneDeep(data[i + 1][baseField]);
                    }
                } else {
                    d.end = d[baseField];
                    if (i == 0) {
                        d.start = _lodash2.default.cloneDeep(data[data.length - 1][baseField]);
                        d.start.weekOffset = d.start.weekOffset - 1;
                    } else {
                        d.start = _lodash2.default.cloneDeep(data[i - 1][baseField]);
                    }
                }

                if (d.start.weekOffset < lowestWeekOffset) {
                    lowestWeekOffset = d.start.weekOffset;
                }
                if (d.end.weekOffset < lowestWeekOffset) {
                    lowestWeekOffset = d.end.weekOffset;
                }

                fields.forEach(function (f) {
                    if (d[f.id].weekOffset < lowestWeekOffset) {
                        lowestWeekOffset = d[f.id].weekOffset;
                    }
                });

                graphData.push(d);
            });

            if (this.state.fillWeek && data.length > 1) {
                if (this.state.inverted) {
                    //duplicate & add  first elem at the end of the list again with +1 week offset
                    //(inverted)          .weekstart                                                .weekend
                    //                    <<<<<<<<<<<<<<<R1<<<<<<<<<<< R2<<<<<<<<<<<<<<<<<R3---(this is duplicated)---R1
                    var firstElem = _lodash2.default.cloneDeep(data[0]);
                    firstElem.start.weekOffset++;
                    firstElem.end.weekOffset++;
                    fields.forEach(function (f) {
                        firstElem[f.id].weekOffset++;
                    });
                    graphData.push(firstElem);
                } else {
                    //duplicate & add  last elem at the head of the list again with -1 week offset
                    //(not inverted)       .weekstart                                                .weekend
                    //       R3---(this is duplicated)---R1>>>>>>>>>>>>>>>>>>>R2>>>>>>>>>>>>>>>>R3>>>>>>>>>
                    var lastElem = _lodash2.default.cloneDeep(data[data.length - 1]);
                    lastElem.start.weekOffset--;
                    lastElem.end.weekOffset--;
                    fields.forEach(function (f) {
                        lastElem[f.id].weekOffset--;
                    });
                    graphData.unshift(lastElem);
                }
            }
            //ENDS-1


            //STARTS-2
            //if there exist any minus week offset, increase all weekoffsets
            // so that lowest week offset will be 0
            //calculate times as hours
            graphData.forEach(function (gd) {
                gd.start.weekOffset = gd.start.weekOffset - lowestWeekOffset;
                gd.end.weekOffset = gd.end.weekOffset - lowestWeekOffset;

                gd.start.calculated = calculate(gd.start);
                gd.end.calculated = calculate(gd.end);

                fields.forEach(function (f) {
                    gd[f.id].weekOffset = gd[f.id].weekOffset - lowestWeekOffset;
                    gd[f.id].calculated = calculate(gd[f.id]);
                });
            });
            //ENDS-2


            //STARTS-3
            //find the start and end intervals of the graph

            var startObj = void 0;
            var startHour = void 0;
            var endHour = void 0;

            graphData.forEach(function (d, i) {
                if (!_lodash2.default.isNumber(startHour) || d.start.calculated < startHour) {
                    startHour = d.start.calculated;
                    startObj = d.start;
                }
                if (!_lodash2.default.isNumber(startHour) || d.end.calculated < startHour) {
                    startHour = d.end.calculated;
                    startObj = d.end;
                }

                if (!_lodash2.default.isNumber(endHour) || d.start.calculated > endHour) {
                    endHour = d.start.calculated;
                }
                if (!_lodash2.default.isNumber(endHour) || d.end.calculated > endHour) {
                    endHour = d.end.calculated;
                }

                fields.forEach(function (f) {
                    if (!_lodash2.default.isNumber(startHour) || d[f.id].calculated < startHour) {
                        startHour = d[f.id].calculated;
                        startObj = d[f.id];
                    }
                    if (!_lodash2.default.isNumber(endHour) || d[f.id].calculated > endHour) {
                        endHour = d[f.id].calculated;
                    }
                });
            });

            //add some empty space to the end of the graph; 1/15 of the original graphs length
            endHour = endHour + endHour / 15;

            var percentagePerHour = 100 / (endHour - startHour);
            //ENDS-3


            //STARTS-4 calculate headers, their start positions and values, distribution on graph
            var hoursLeftToMidnight = 24 - startObj.calculated % 24;

            var startDayIndex = void 0;
            var currentPos = void 0;
            var headerContent = [];

            if (hoursLeftToMidnight == 24) {
                startDayIndex = startObj.dayIndex;
                currentPos = 0;
            } else {

                if (hoursLeftToMidnight > 16) {
                    headerContent.push(_react2.default.createElement(
                        "div",
                        { key: "header-first" },
                        _react2.default.createElement("div", { className: "uk-progress-bar", style: { position: "absolute", marginLeft: "0%", width: "0%" } }),
                        _react2.default.createElement(
                            "div",
                            { style: { position: "absolute", marginLeft: "1%" } },
                            _react2.default.createElement(
                                "span",
                                null,
                                this.WEEKDAYS[startObj.dayIndex]
                            )
                        )
                    ));
                }

                startDayIndex = (startObj.dayIndex + 1) % 7;
                currentPos = hoursLeftToMidnight * percentagePerHour;
            }

            while (currentPos < 100) {
                headerContent.push(_react2.default.createElement(
                    "div",
                    { key: "header" + headerContent.length },
                    _react2.default.createElement("div", { className: "uk-progress-bar",
                        style: { position: "absolute", marginLeft: currentPos - 0.2 + "%", width: "0.4%" } }),
                    _react2.default.createElement(
                        "div",
                        { style: { position: "absolute", marginLeft: currentPos + 1 + "%" } },
                        _react2.default.createElement(
                            "span",
                            null,
                            this.WEEKDAYS[startDayIndex]
                        )
                    )
                ));
                startDayIndex = (startDayIndex + 1) % 7;
                currentPos += 24 * percentagePerHour;
            }
            //ENDS-4


            //STARTS-5 put all the data inside graph
            var tableContent = [];

            graphData.forEach(function (d, i) {

                //the point where the bar starts
                var preBarWidth = (d.start.calculated - startHour) * percentagePerHour;

                //length of the bar
                var barWidth = (d.end.calculated - d.start.calculated) * percentagePerHour;

                tableContent.push(_react2.default.createElement(
                    "div",
                    { key: preBarWidth, className: "uk-progress uk-progress-success", style: { position: "relative" },
                        onMouseOver: function onMouseOver() {
                            _this2.setState({ mouseOverEntry: i });
                        },
                        onMouseLeave: function onMouseLeave() {
                            _this2.setState({ mouseOverEntry: null });
                        } },
                    _react2.default.createElement("div", { className: "uk-progress-bar", style: { width: "100%", backgroundColor: "#f5f5f5" } }),
                    _react2.default.createElement(
                        "div",
                        { className: "uk-progress-bar",
                            style: { position: "absolute", marginLeft: preBarWidth + "%", width: barWidth + "%" } },
                        _react2.default.createElement(
                            "span",
                            { className: "uk-align-left" },
                            d.start.time
                        ),
                        _react2.default.createElement(
                            "span",
                            { className: "uk-align-right" },
                            d.end.time
                        )
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "uk-progress-bar", hidden: _this2.state.mouseOverEntry != i,
                            style: { position: "absolute", marginLeft: preBarWidth + barWidth + 0.5 + "%" } },
                        _react2.default.createElement("i", { className: "uk-icon uk-icon-small uk-icon-pencil", onClick: function onClick() {
                                _this2.handleEdit(d);
                            } })
                    ),
                    _react2.default.createElement(
                        "div",
                        { className: "uk-progress-bar", hidden: _this2.state.mouseOverEntry != i,
                            style: { position: "absolute", marginLeft: preBarWidth + barWidth + 3 + "%" } },
                        _react2.default.createElement("i", { className: "uk-icon uk-icon-small uk-icon-remove", onClick: function onClick() {
                                _this2.handleDelete(d);
                            } })
                    ),
                    fields.map(function (f) {
                        var pos = (d[f.id].calculated - startHour) * percentagePerHour;
                        var classname = "uk-icon uk-icon-small uk-icon-";
                        if (f.icon) {
                            classname += f.icon;
                        } else {
                            classname += _this2.DEFAULT_ICON;
                        }

                        var style = {};
                        if (f.color) {
                            style.color = f.color;
                        }

                        var toolTip = f.description + "\n" + d[f.id].day.name + "," + d[f.id].time;
                        return _react2.default.createElement(
                            "div",
                            { key: f.id + d[f.id].calculated, className: "uk-progress-bar",
                                style: { position: "absolute", marginLeft: pos + "%" } },
                            _react2.default.createElement("i", { title: toolTip, className: classname, style: style })
                        );
                    })
                ));
            });
            //ENDS-5

            //STARTS-6 putlegends on map
            var legends = fields.map(function (f) {
                var classname = "uk-icon uk-icon-small uk-icon-";
                if (f.icon) {
                    classname += f.icon;
                } else {
                    classname += _this2.DEFAULT_ICON;
                }

                var style = { marginLeft: "5px" };
                if (f.color) {
                    style.color = f.color;
                }

                return _react2.default.createElement(
                    "div",
                    { key: f.id + "legend" },
                    _react2.default.createElement("i", { className: classname, style: style }),
                    _react2.default.createElement(
                        "span",
                        { style: { marginLeft: "50px" } },
                        f.description
                    )
                );
            });
            //ENDS-6


            return _react2.default.createElement(
                "div",
                null,
                _react2.default.createElement(
                    "div",
                    { className: "uk-progress uk-progress-primary", style: { position: "relative" } },
                    headerContent
                ),
                tableContent,
                legends
            );
        }
    }]);

    return TimelineTable;
}(_abstract.TranslatingComponent);

function calculate(elem) {
    var time = 0;

    if (elem.time) {
        time += Number.parseInt(elem.time.split(":")[0]);
    }

    if (elem.dayIndex) {
        time += elem.dayIndex * 24;
    }

    if (elem.weekOffset) {
        time += elem.weekOffset * 168;
    }

    return time;
}