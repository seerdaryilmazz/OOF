import React from "react";

export class WorkingHour extends React.Component {

    constructor(props) {
        super(props);

        this.MODE_NONE = "none";
        this.MODE_WRITE = "write";
        this.MODE_ERASE = "erase";

        this.state = {mode: this.MODE_NONE};

        this.CELLVALUE_EMPTY = "0";
        this.CELLVALUE_FILLED = "1";

        this.CONFIG_DEFAULT_START_HOUR = "08:00";
        this.CONFIG_DEFAULT_END_HOUR = "17:00";

        this.CONFIG_DEFAULT_INTERVAL = 30;

        this.CONFIG_DEFAULT_CONTENT_HEADER_RATIO = 1;

        this.DAYS = [{key: 1, code: "MONDAY", value: "Monday"},
            {key: 2,code: "TUESDAY", value: "Tuesday"},
            {key: 3, code: "WEDNESDAY", value: "Wednesday"},
            {key: 4, code: "THURSDAY", value: "Thursday"},
            {key: 5, code: "FRIDAY", value: "Friday"},
            {key: 6, code: "SATURDAY", value: "Saturday"},
            {key: 7, code: "SUNDAY", value: "Sunday"}
        ];

        let propsData = [];
        if(this.props.data) {
            propsData = this.props.data;
        }

        let config = this.loadConfig(this.props);
        let data = this.formatData(propsData, config);

        this.state.config = config;
        this.state.data = data;

    }

    componentWillReceiveProps(nextProps) {
        let config = this.state.config;

        let data;
        if (nextProps.data) {
            data = this.formatData(nextProps.data, config);
        }
        this.setState({data: data});
    }

    loadConfig(props) {

        let config = {
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
            if(props.days) {
                config.days = this.DAYS.filter(d => {return props.days.includes(d.code)})
            }
            if(props.ratio) {
                config.ratio = props.ratio;
            }
        }


        let moment = require('moment');
        let currHour = moment(config.startHour, "HH:mm", true);
        let endHour = moment(config.endHour, "HH:mm", true);

        config.hours = [];
        while(!currHour.isAfter(endHour)) {
            let elem = {key: config.hours.length, startValue: currHour.format("HH:mm"), startMoment: moment(currHour.format("HH:mm"), "HH:mm", true)};
            config.hours.push(elem);
            currHour.add(config.interval, 'minutes');
            elem.endValue = currHour.format("HH:mm");
            elem.endMoment = moment(currHour.format("HH:mm"), "HH:mm", true)
        }

        return config;

    }

    formatData(incData, config) {

        let moment = require('moment');

        let result = this.initializeEmptyData(config);

        if (incData) {
            config.days.forEach(configDay => {

                let rangeList = incData.find(i => i.day.code == configDay.code);

                if (rangeList && rangeList.timeWindows) {
                    rangeList.timeWindows.forEach(range => {
                        if (range.startTime && range.endTime) {

                            let startTime = moment(range.startTime, "HH:mm", true);
                            let endTime = moment(range.endTime, "HH:mm", true);

                            config.hours.forEach(configHour => {

                                if(
                                    (startTime.diff(configHour.endMoment) < 0 || configHour.endMoment.format("HH:mm") == "00:00")
                                    &&
                                    (endTime.diff(configHour.startMoment) > 0 ||  endTime.format("HH:mm") == "00:00")
                                ) {
                                    result[configDay.key][configHour.key] = this.CELLVALUE_FILLED;
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

    initializeEmptyData(config) {

        let result={};

        config.days.forEach(day => {
            result[day.key] = {};
            config.hours.forEach(hour => {
                result[day.key][hour.key] = this.CELLVALUE_EMPTY;
            });
        });

        return result;
    }

    handleMouseClickCell(day, hour) {

        let data = this.state.data;

        let clickedCell = data[day][hour];

        if (this.state.mode == this.MODE_NONE) {
            if (clickedCell == this.CELLVALUE_FILLED) {
                this.setState({mode: this.MODE_ERASE, currentSelection: {startDay: day, startHour: hour}}, () => {
                    this.handleMouseOverCell(day, hour)
                });
            } else {
                this.setState({mode: this.MODE_WRITE, currentSelection: {startDay: day, startHour: hour}}, () => {
                    this.handleMouseOverCell(day, hour)
                });
            }
        } else {
            this.finalizeData();
        }

    }

    finalizeData() {

        let data = this.state.data;
        let currentSelection = this.state.currentSelection;


        let startDayIndex = (currentSelection.startDay <= currentSelection.endDay) ? currentSelection.startDay : currentSelection.endDay;
        let endDayIndex = (currentSelection.startDay <= currentSelection.endDay) ? currentSelection.endDay : currentSelection.startDay;
        let startHourIndex = (currentSelection.startHour <= currentSelection.endHour) ? currentSelection.startHour : currentSelection.endHour;
        let endHourIndex = (currentSelection.startHour <= currentSelection.endHour) ? currentSelection.endHour : currentSelection.startHour;

        let iDay;
        for (iDay = startDayIndex; iDay <= endDayIndex; iDay = iDay + 1) {
            let iHour;
            for (iHour = startHourIndex; iHour <= endHourIndex; iHour = iHour + 1) {
                if (this.state.mode == this.MODE_ERASE) {
                    data[iDay][iHour] = this.CELLVALUE_EMPTY;
                } else if (this.state.mode == this.MODE_WRITE) {
                    data[iDay][iHour] = this.CELLVALUE_FILLED;
                }
            }
        }

        this.setState({data: data, mode: this.MODE_NONE, currentSelection: null}, () => {
            let dataToBeExported = this.prepareDataForExport(this.state.data);
            this.props.dataUpdateHandler(dataToBeExported);
        });
    }

    prepareDataForExport(data) {

        let config = this.state.config;
        let result = [];

        let startHour;
        let possibleEndHour;
        config.days.forEach(day => {
            let dayKey = day.key;
            let resultElem = {};
            resultElem.day = day;
            resultElem.timeWindows = [];
            config.hours.forEach(hour => {
                let hourKey = hour.key;
                if (data[dayKey][hourKey] == this.CELLVALUE_FILLED) {
                    if (!startHour) {
                        startHour = hour.startValue;
                    }
                    possibleEndHour = hour.endValue;
                    if(hour.startValue == config.endHour) {
                        resultElem.timeWindows.push({startTime: startHour, endTime: possibleEndHour});
                        startHour = null;
                    }
                } else {
                    if (startHour) {
                        resultElem.timeWindows.push({startTime: startHour, endTime: possibleEndHour});
                        startHour = null;
                    }
                    possibleEndHour = null;
                }
            });
            if(resultElem) {
                result.push(resultElem)
            }
        });

        return result;
    }


    handleMouseOverCell(day, hour) {
        let currentSelection = this.state.currentSelection;

        if(currentSelection) {
            currentSelection.endDay = day;
            currentSelection.endHour = hour;
            this.setState({currentSelection:currentSelection});

        }
    }

    renderContent(day, hour) {

        let data = this.state.data;
        let mode = this.state.mode;

        if(mode != this.MODE_NONE && this.areValuesInsideCurrentSelection(day, hour)) {
            if(mode == this.MODE_WRITE) {
                return <div style = {{backgroundColor: "#a5d6a7"}}>&nbsp;</div>;
            } else if(mode == this.MODE_ERASE) {
                return <div style = {{backgroundColor: "#ff5252"}}>&nbsp;</div>;
            }

        }
        if (data[day][hour] == this.CELLVALUE_FILLED) {
            return <div style = {{backgroundColor: "#448aff"}}>&nbsp;</div>;
        } else {
            return <div style = {{backgroundColor: "#FFFFFF"}}>&nbsp;</div>;
        }
    }

    areValuesInsideCurrentSelection(day, hour) {
        let currentSelection = this.state.currentSelection;

        if(!currentSelection) {
            return false;
        }

        let isInsideDays = false;
        let isInsideHours = false;
        if((day <= currentSelection.startDay && day >= currentSelection.endDay) || (day >= currentSelection.startDay && day <= currentSelection.endDay)) {
            isInsideDays = true;
        }
        if((hour <= currentSelection.startHour && hour >= currentSelection.endHour) || (hour >= currentSelection.startHour && hour <= currentSelection.endHour)) {
            isInsideHours = true;
        }

        return isInsideDays && isInsideHours;
    }

    renderTable() {

        let config = this.state.config;

        let headers = [];

        headers.push(<th key="header-init"></th>);



        let hIndex = 0;
        config.hours.forEach(hour => {
            if (hIndex % config.ratio == 0) {
                headers.push(
                    <th colSpan={config.ratio} className="uk-text-left" style = {{padding: "2px"}} key={"header-" + hour.key}>
                        {hour.startValue}
                    </th>
                );
            }
            hIndex++;
        });

        let days = config.days.map(day => {
            let dayKey = day.key;
            let hours = config.hours.map(hour => {
                let hourKey = hour.key;
                return(
                    <td key={dayKey + "-" + hourKey} style={{border: "1px solid #ddd", padding: "1px"}}
                        data-uk-tooltip title={hour.startValue + " - " + hour.endValue + ", " + day.value}
                        onMouseDown={(event) => {this.handleMouseClickCell(dayKey, hourKey)}} onMouseOver={(event) => {this.handleMouseOverCell(dayKey, hourKey)}}>
                        {this.renderContent(dayKey, hourKey)}
                    </td>
                );
            });
            hours.splice(0, 0, <td key={dayKey + "-init"}>{day.value}</td>);

            return(
                <tr key={"day-" + day.key}>
                    {hours}
                </tr>
            );
        });

        return (
            <table className="uk-table uk-table-condensed">
                <thead>
                <tr>{headers}</tr>
                </thead>
                <tbody>
                {days}
                </tbody>
            </table>
        )

    }

    render() {

        let data = this.state.data;
        let config = this.state.config;

        if (!data || !config) {
            return null;
        }

        return (
            <div>
                {this.renderTable()}
            </div>
        );
    }
}
