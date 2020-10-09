import PropTypes from 'prop-types';
import React from 'react';
var moment = require("moment");

const TEMPLATE = `<div class="md-card-toolbar">
                    <div class="md-card-toolbar-actions">
                        <i class="md-icon clndr_add_event material-icons">&#xE145;</i>
                        <i class="md-icon clndr_today material-icons">&#xE8DF;</i>
                        <i class="md-icon clndr_previous material-icons">&#xE408;</i>
                        <i class="md-icon clndr_next material-icons uk-margin-remove">&#xE409;</i>
                    </div>
                    <h3 class="md-card-toolbar-heading-text">
                        {{ month }} {{ year }}
                    </h3>
                </div>
                <div class="clndr_days">
                    <div class="clndr_days_names">
                        {{#each daysOfTheWeek}}
                        <div class="day-header">{{ this }}</div>
                        {{/each}}
                    </div>
                    <div class="clndr_days_grid">
                        {{#each days}}
                        <div class="{{ this.classes }}" {{#if this.id }} id="{{ this.id }}" {{/if}}>
                            <span>{{ this.day }}</span>
                        </div>
                        {{/each}}
                    </div>
                </div>
                <div class="clndr_events">
                    <i class="material-icons clndr_events_close_button">&#xE5CD;</i>
                    {{#each eventsThisMonth}}
                    <div class="clndr_event" data-clndr-event="{{ dateFormat this.date format='YYYY-MM-DD' }}">
                        <a href="{{ this.url }}" target="_blank">
                            <span class="clndr_event_title">{{ this.title }}</span>
                            <span class="clndr_event_more_info">
                                {{this.accountName}}
                            </span>
                            <span class="clndr_event_more_info">
                                {{~dateFormat this.date format='MMM Do'}}
                                {{~#ifCond this.timeStart '||' this.timeEnd}} ({{/ifCond}}
                                {{~#if this.timeStart }} {{~this.timeStart~}} {{/if}}
                                {{~#ifCond this.timeStart '&&' this.timeEnd}} - {{/ifCond}}
                                {{~#if this.timeEnd }} {{~this.timeEnd~}} {{/if}}
                                {{~#ifCond this.timeStart '||' this.timeEnd}}){{/ifCond~}}
                            </span>
                        </a>
                    </div>
                    {{/each}}
                </div>`;

var handleMonthChange;
var handleAddEvent;

export class Calendar extends React.Component {

    componentDidMount() {
        this.calendar = this.init();
        handleMonthChange = (month) => {
            this.props.onMonthChange && this.props.onMonthChange(month);
        }
        handleAddEvent = () => {
            this.props.onAddEvent && this.props.onAddEvent();
        }
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.events, this.props.events)) {
            this.calendar.setEvents(this.props.events);
        }
    }

    init() {
        var i = $("#clndr_events");
        if (i.length) {
            moment.locale(this.context.translator.getLocale());
            var e = $("#clndr_events_template").html();
            var t = Handlebars.compile(e);
            var theCalendar = i.clndr({
                moment: moment,
                events: _.defaultTo(this.props.events, []),
                formatWeekdayHeader: function (day) {
                    return day.format('ddd');
                },
                render: function (e) {
                    return t(e)
                },
                clickEvents: {
                    onMonthChange: function (e) {
                        handleMonthChange(e);
                    },
                    click: function (e) {
                        if (e.events.length) {
                            var t = $(".clndr_events")
                                , a = e.date._i;
                            $(e.element).siblings(".day").removeClass("day-active").end().addClass("day-active"),
                                t.children("[data-clndr-event=" + a + "]").length ? (t.children(".clndr_event").hide(),
                                    i.hasClass("events_visible") ? t.children("[data-clndr-event=" + a + "]").velocity("transition.slideUpIn", {
                                        stagger: 100,
                                        drag: !0
                                    }) : (l(),
                                        i.addClass("events_visible"),
                                        t.children("[data-clndr-event=" + a + "]").velocity("transition.slideUpIn", {
                                            stagger: 100,
                                            drag: !0,
                                            delay: 280
                                        }))) : $(e.element).hasClass("last-month") ? (setTimeout(function () {
                                            i.find(".calendar-day-" + e.date._i).click()
                                        }, 380),
                                            i.find(".clndr_previous").click()) : $(e.element).hasClass("next-month") && (setTimeout(function () {
                                                i.find(".calendar-day-" + e.date._i).click()
                                            }, 380),
                                                i.find(".clndr_next").click())
                        }
                    }
                }
            });
            var r = function () {
                i.addClass("animated_change").removeClass("events_visible"),
                    setTimeout(function () {
                        i.removeClass("animated_change")
                    }, 380)
            };
            i.on("click", ".clndr_next", function (e) {
                e.preventDefault(),
                    r(),
                    setTimeout(function () {
                        theCalendar.forward({ withCallbacks: true })
                    }, 280)
            }),
                i.on("click", ".clndr_previous", function (e) {
                    e.preventDefault(),
                        r(),
                        setTimeout(function () {
                            theCalendar.back({ withCallbacks: true })
                        }, 280)
                }),
                i.on("click", ".clndr_today", function (e) {
                    e.preventDefault(),
                        r(),
                        setTimeout(function () {
                            theCalendar.setYear(moment().format("YYYY")).setMonth(moment().format("M") - 1, { withCallbacks: true })
                        }, 280)
                }),
                i.on("click", ".clndr_add_event", function () {
                    (handleAddEvent(),
                        i.removeClass("events_visible"),
                        setTimeout(function () {
                            $window.resize()
                        }, 280))
                }),
                i.on("click", ".clndr_events_close_button", function () {
                    i.removeClass("events_visible events_over")
                });
            var s = 7 * i.find(".day > span").outerWidth() + 240 + 32 + 14;
            function l() {
                i.width() < s ? i.addClass("events_over") : i.removeClass("events_over")
            }
            l(),
                $(window).on("debouncedresize", function () {
                    l()
                })
            return theCalendar;
        }
        return null;
    }

    render() {
        return (
            <div className="md-card">
                <script id="clndr_events_template" type="text/x-handlebars-template">
                    {TEMPLATE}
                </script>
                <div id="clndr_events" className="clndr-wrapper" />
            </div>
        )
    }
}

Calendar.contextTypes = {
    translator: PropTypes.object
}