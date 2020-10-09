'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Calendar = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var moment = require("moment");

var TEMPLATE = '<div class="md-card-toolbar">\n                    <div class="md-card-toolbar-actions">\n                        <i class="md-icon clndr_add_event material-icons">&#xE145;</i>\n                        <i class="md-icon clndr_today material-icons">&#xE8DF;</i>\n                        <i class="md-icon clndr_previous material-icons">&#xE408;</i>\n                        <i class="md-icon clndr_next material-icons uk-margin-remove">&#xE409;</i>\n                    </div>\n                    <h3 class="md-card-toolbar-heading-text">\n                        {{ month }} {{ year }}\n                    </h3>\n                </div>\n                <div class="clndr_days">\n                    <div class="clndr_days_names">\n                        {{#each daysOfTheWeek}}\n                        <div class="day-header">{{ this }}</div>\n                        {{/each}}\n                    </div>\n                    <div class="clndr_days_grid">\n                        {{#each days}}\n                        <div class="{{ this.classes }}" {{#if this.id }} id="{{ this.id }}" {{/if}}>\n                            <span>{{ this.day }}</span>\n                        </div>\n                        {{/each}}\n                    </div>\n                </div>\n                <div class="clndr_events">\n                    <i class="material-icons clndr_events_close_button">&#xE5CD;</i>\n                    {{#each eventsThisMonth}}\n                    <div class="clndr_event" data-clndr-event="{{ dateFormat this.date format=\'YYYY-MM-DD\' }}">\n                        <a href="{{ this.url }}" target="_blank">\n                            <span class="clndr_event_title">{{ this.title }}</span>\n                            <span class="clndr_event_more_info">\n                                {{this.accountName}}\n                            </span>\n                            <span class="clndr_event_more_info">\n                                {{~dateFormat this.date format=\'MMM Do\'}}\n                                {{~#ifCond this.timeStart \'||\' this.timeEnd}} ({{/ifCond}}\n                                {{~#if this.timeStart }} {{~this.timeStart~}} {{/if}}\n                                {{~#ifCond this.timeStart \'&&\' this.timeEnd}} - {{/ifCond}}\n                                {{~#if this.timeEnd }} {{~this.timeEnd~}} {{/if}}\n                                {{~#ifCond this.timeStart \'||\' this.timeEnd}}){{/ifCond~}}\n                            </span>\n                        </a>\n                    </div>\n                    {{/each}}\n                </div>';

var handleMonthChange;
var handleAddEvent;

var Calendar = exports.Calendar = function (_React$Component) {
    _inherits(Calendar, _React$Component);

    function Calendar() {
        _classCallCheck(this, Calendar);

        return _possibleConstructorReturn(this, (Calendar.__proto__ || Object.getPrototypeOf(Calendar)).apply(this, arguments));
    }

    _createClass(Calendar, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.calendar = this.init();
            handleMonthChange = function handleMonthChange(month) {
                _this2.props.onMonthChange && _this2.props.onMonthChange(month);
            };
            handleAddEvent = function handleAddEvent() {
                _this2.props.onAddEvent && _this2.props.onAddEvent();
            };
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate(prevProps) {
            if (!_.isEqual(prevProps.events, this.props.events)) {
                this.calendar.setEvents(this.props.events);
            }
        }
    }, {
        key: 'init',
        value: function init() {
            var i = $("#clndr_events");
            if (i.length) {
                var _l = function _l() {
                    i.width() < s ? i.addClass("events_over") : i.removeClass("events_over");
                };

                moment.locale(this.context.translator.getLocale());
                var e = $("#clndr_events_template").html();
                var t = Handlebars.compile(e);
                var theCalendar = i.clndr({
                    moment: moment,
                    events: _.defaultTo(this.props.events, []),
                    formatWeekdayHeader: function formatWeekdayHeader(day) {
                        return day.format('ddd');
                    },
                    render: function render(e) {
                        return t(e);
                    },
                    clickEvents: {
                        onMonthChange: function onMonthChange(e) {
                            handleMonthChange(e);
                        },
                        click: function click(e) {
                            if (e.events.length) {
                                var t = $(".clndr_events"),
                                    a = e.date._i;
                                $(e.element).siblings(".day").removeClass("day-active").end().addClass("day-active"), t.children("[data-clndr-event=" + a + "]").length ? (t.children(".clndr_event").hide(), i.hasClass("events_visible") ? t.children("[data-clndr-event=" + a + "]").velocity("transition.slideUpIn", {
                                    stagger: 100,
                                    drag: !0
                                }) : (_l(), i.addClass("events_visible"), t.children("[data-clndr-event=" + a + "]").velocity("transition.slideUpIn", {
                                    stagger: 100,
                                    drag: !0,
                                    delay: 280
                                }))) : $(e.element).hasClass("last-month") ? (setTimeout(function () {
                                    i.find(".calendar-day-" + e.date._i).click();
                                }, 380), i.find(".clndr_previous").click()) : $(e.element).hasClass("next-month") && (setTimeout(function () {
                                    i.find(".calendar-day-" + e.date._i).click();
                                }, 380), i.find(".clndr_next").click());
                            }
                        }
                    }
                });
                var r = function r() {
                    i.addClass("animated_change").removeClass("events_visible"), setTimeout(function () {
                        i.removeClass("animated_change");
                    }, 380);
                };
                i.on("click", ".clndr_next", function (e) {
                    e.preventDefault(), r(), setTimeout(function () {
                        theCalendar.forward({ withCallbacks: true });
                    }, 280);
                }), i.on("click", ".clndr_previous", function (e) {
                    e.preventDefault(), r(), setTimeout(function () {
                        theCalendar.back({ withCallbacks: true });
                    }, 280);
                }), i.on("click", ".clndr_today", function (e) {
                    e.preventDefault(), r(), setTimeout(function () {
                        theCalendar.setYear(moment().format("YYYY")).setMonth(moment().format("M") - 1, { withCallbacks: true });
                    }, 280);
                }), i.on("click", ".clndr_add_event", function () {
                    handleAddEvent(), i.removeClass("events_visible"), setTimeout(function () {
                        $window.resize();
                    }, 280);
                }), i.on("click", ".clndr_events_close_button", function () {
                    i.removeClass("events_visible events_over");
                });
                var s = 7 * i.find(".day > span").outerWidth() + 240 + 32 + 14;

                _l(), $(window).on("debouncedresize", function () {
                    _l();
                });
                return theCalendar;
            }
            return null;
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { className: 'md-card' },
                _react2.default.createElement(
                    'script',
                    { id: 'clndr_events_template', type: 'text/x-handlebars-template' },
                    TEMPLATE
                ),
                _react2.default.createElement('div', { id: 'clndr_events', className: 'clndr-wrapper' })
            );
        }
    }]);

    return Calendar;
}(_react2.default.Component);

Calendar.contextTypes = {
    translator: _propTypes2.default.object
};