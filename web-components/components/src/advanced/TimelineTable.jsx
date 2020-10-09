import _ from "lodash";
import React from "react";

import {TranslatingComponent} from '../abstract';

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
export class TimelineTable extends TranslatingComponent {


    constructor(props) {
        super(props);
        this.state = {};

        this.WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        this.DEFAULT_ICON = "ellipsis-v";
    }

    componentDidMount() {
        this.loadData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.loadData(nextProps);
    }

    loadData(props) {
        this.setState({data: _.cloneDeep(props.value), inverted: props.inverted, fillWeek: props.fillWeek});
    }

    handleEdit(data) {
        this.props.editHandler(data[this.props.keyField]);
    }

    handleDelete(data) {
        this.props.deleteHandler(data[this.props.keyField]);
    }

    render() {

        let baseField = this.props.baseField;
        let fields = this.props.fields;

        let data = this.state.data;

        if (!baseField || !data || data.length == 0) {
            return null;
        }


        //STARTS-1:
        //!!!determine the start end end points of the green bars by using given dates in "basefield",
        //also finds lowest weekoffset of the graph, which will be used later for adjusting data and fit it in graph
        let graphData = [];

        let lowestWeekOffset = 0;

        data.forEach((d, i) => {

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

            if(!this.state.inverted) {
                d.start = d[baseField];
                if (i == data.length - 1) {
                    d.end = _.cloneDeep(data[0][baseField]);
                    d.end.weekOffset = d.end.weekOffset + 1;
                } else {
                    d.end = _.cloneDeep(data[i + 1][baseField]);
                }
            } else {
                d.end = d[baseField];
                if (i == 0) {
                    d.start = _.cloneDeep(data[data.length - 1][baseField]);
                    d.start.weekOffset = d.start.weekOffset - 1;
                } else {
                    d.start = _.cloneDeep(data[i - 1][baseField]);
                }
            }


            if (d.start.weekOffset < lowestWeekOffset) {
                lowestWeekOffset = d.start.weekOffset;
            }
            if (d.end.weekOffset < lowestWeekOffset) {
                lowestWeekOffset = d.end.weekOffset;
            }

            fields.forEach(f => {
                if (d[f.id].weekOffset < lowestWeekOffset) {
                    lowestWeekOffset = d[f.id].weekOffset;
                }
            });

            graphData.push(d);
        });

        if (this.state.fillWeek && data.length > 1) {
            if(this.state.inverted) {
                //duplicate & add  first elem at the end of the list again with +1 week offset
                //(inverted)          .weekstart                                                .weekend
                //                    <<<<<<<<<<<<<<<R1<<<<<<<<<<< R2<<<<<<<<<<<<<<<<<R3---(this is duplicated)---R1
                let firstElem = _.cloneDeep(data[0]);
                firstElem.start.weekOffset++;
                firstElem.end.weekOffset++;
                fields.forEach(f => {
                    firstElem[f.id].weekOffset++;

                });
                graphData.push(firstElem);
            } else {
                //duplicate & add  last elem at the head of the list again with -1 week offset
                //(not inverted)       .weekstart                                                .weekend
                //       R3---(this is duplicated)---R1>>>>>>>>>>>>>>>>>>>R2>>>>>>>>>>>>>>>>R3>>>>>>>>>
                let lastElem = _.cloneDeep(data[data.length-1]);
                lastElem.start.weekOffset--;
                lastElem.end.weekOffset--;
                fields.forEach(f => {
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
        graphData.forEach(gd => {
            gd.start.weekOffset = gd.start.weekOffset - lowestWeekOffset;
            gd.end.weekOffset = gd.end.weekOffset - lowestWeekOffset;

            gd.start.calculated = calculate(gd.start);
            gd.end.calculated = calculate(gd.end);

            fields.forEach(f => {
                gd[f.id].weekOffset = gd[f.id].weekOffset - lowestWeekOffset;
                gd[f.id].calculated = calculate(gd[f.id]);

            });
        })
        //ENDS-2


        //STARTS-3
        //find the start and end intervals of the graph

        let startObj;
        let startHour;
        let endHour;

        graphData.forEach((d, i) => {
            if (!_.isNumber(startHour) || d.start.calculated < startHour) {
                startHour = d.start.calculated;
                startObj = d.start;
            }
            if (!_.isNumber(startHour) || d.end.calculated < startHour) {
                startHour = d.end.calculated;
                startObj = d.end;
            }

            if (!_.isNumber(endHour) || d.start.calculated > endHour) {
                endHour = d.start.calculated;
            }
            if (!_.isNumber(endHour) || d.end.calculated > endHour) {
                endHour = d.end.calculated;
            }

            fields.forEach(f => {
                if (!_.isNumber(startHour) || d[f.id].calculated < startHour) {
                    startHour = d[f.id].calculated;
                    startObj = d[f.id];
                }
                if (!_.isNumber(endHour) || d[f.id].calculated > endHour) {
                    endHour = d[f.id].calculated;
                }
            });
        });

        //add some empty space to the end of the graph; 1/15 of the original graphs length
        endHour = endHour + (endHour / 15);

        let percentagePerHour = 100 / (endHour - startHour);
        //ENDS-3


        //STARTS-4 calculate headers, their start positions and values, distribution on graph
        let hoursLeftToMidnight = 24 - (startObj.calculated % 24);

        let startDayIndex;
        let currentPos;
        let headerContent = [];

        if (hoursLeftToMidnight == 24) {
            startDayIndex = startObj.dayIndex;
            currentPos = 0
        } else {

            if (hoursLeftToMidnight > 16) {
                headerContent.push(
                    <div key="header-first">
                        <div className="uk-progress-bar" style={{position: "absolute", marginLeft: "0%", width: "0%"}}/>
                        <div style={{position: "absolute", marginLeft: "1%"}}>
                            <span>{this.WEEKDAYS[startObj.dayIndex]}</span>
                        </div>
                    </div>
                );
            }

            startDayIndex = (startObj.dayIndex + 1) % 7;
            currentPos = hoursLeftToMidnight * percentagePerHour;
        }


        while (currentPos < 100) {
            headerContent.push(
                <div key={"header" + headerContent.length}>
                    <div className="uk-progress-bar"
                         style={{position: "absolute", marginLeft: (currentPos - 0.2) + "%", width: "0.4%"}}/>
                    <div style={{position: "absolute", marginLeft: (currentPos + 1) + "%"}}>
                        <span>{this.WEEKDAYS[startDayIndex]}</span>
                    </div>
                </div>
            );
            startDayIndex = (startDayIndex + 1) % 7;
            currentPos += (24 * percentagePerHour);
        }
        //ENDS-4


        //STARTS-5 put all the data inside graph
        let tableContent = [];

        graphData.forEach((d, i) => {

            //the point where the bar starts
            let preBarWidth = (d.start.calculated - startHour) * percentagePerHour;

            //length of the bar
            let barWidth = (d.end.calculated - d.start.calculated) * percentagePerHour;


            tableContent.push(
                <div key={preBarWidth} className="uk-progress uk-progress-success" style={{position: "relative"}}
                     onMouseOver={() => {
                         this.setState({mouseOverEntry: i})
                     }}
                     onMouseLeave={() => {
                         this.setState({mouseOverEntry: null})
                     }}>
                    <div className="uk-progress-bar" style={{width: "100%", backgroundColor: "#f5f5f5"}}></div>
                    <div className="uk-progress-bar"
                         style={{position: "absolute", marginLeft: preBarWidth + "%", width: barWidth + "%"}}>
                        <span className="uk-align-left">{d.start.time}</span>
                        <span className="uk-align-right">{d.end.time}</span>
                    </div>
                    <div className="uk-progress-bar" hidden={this.state.mouseOverEntry != i}
                         style={{position: "absolute", marginLeft: (preBarWidth + barWidth + 0.5) + "%"}}>
                        <i className="uk-icon uk-icon-small uk-icon-pencil" onClick={() => {
                            this.handleEdit(d)
                        }}></i>
                    </div>
                    <div className="uk-progress-bar" hidden={this.state.mouseOverEntry != i}
                         style={{position: "absolute", marginLeft: (preBarWidth + barWidth + 3) + "%"}}>
                        <i className="uk-icon uk-icon-small uk-icon-remove" onClick={() => {
                            this.handleDelete(d)
                        }}></i>
                    </div>

                    {
                        fields.map(f => {
                            let pos = (d[f.id].calculated - startHour) * percentagePerHour;
                            let classname = "uk-icon uk-icon-small uk-icon-";
                            if (f.icon) {
                                classname += f.icon;
                            } else {
                                classname += this.DEFAULT_ICON;
                            }

                            let style = {};
                            if (f.color) {
                                style.color = f.color;
                            }

                            let toolTip = f.description + "\n" + d[f.id].day.name + "," + d[f.id].time;
                            return (
                                <div key={f.id + d[f.id].calculated} className="uk-progress-bar"
                                     style={{position: "absolute", marginLeft: pos + "%"}}>
                                    <i title={toolTip} className={classname} style={style}>
                                    </i>
                                </div>
                            );
                        })
                    }
                </div>
            );

        });
        //ENDS-5

        //STARTS-6 putlegends on map
        let legends = fields.map(f => {
            let classname = "uk-icon uk-icon-small uk-icon-";
            if (f.icon) {
                classname += f.icon;
            } else {
                classname += this.DEFAULT_ICON;
            }

            let style = {marginLeft: "5px"};
            if (f.color) {
                style.color = f.color;
            }

            return (
                <div key={f.id + "legend"}>
                    <i className={classname} style={style}>
                    </i>
                    <span style={{marginLeft: "50px"}}>{f.description}</span>
                </div>
            );
        })
        //ENDS-6


        return (
            <div>
                <div className="uk-progress uk-progress-primary" style={{position: "relative"}}>
                    {headerContent}
                </div>
                {tableContent}
                {legends}
            </div>);
    }
}


function calculate(elem) {
    let time = 0;

    if(elem.time) {
        time += Number.parseInt(elem.time.split(":")[0]);
    }

    if(elem.dayIndex) {
        time += elem.dayIndex*24;
    }

    if(elem.weekOffset) {
        time += elem.weekOffset*168;
    }

    return time;
}