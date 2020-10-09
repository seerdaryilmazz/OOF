import React from "react";
import {Span} from "susam-components/basic";
import uuid from "uuid";
import {Time} from "susam-components/advanced";
import {Grid, GridCell} from "susam-components/layout";

export class DateTimeMini extends React.Component {

    constructor(props) {
        super(props);
        this.moment = require("moment");
        this.state = {};

    }

    componentDidMount() {
        this.loadData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.loadData(nextProps);
    }

    loadData(props) {

        let originalData = props.data;

        if(originalData == null) {
            this.setState({originalData: originalData, date: null, time: null, timezone: null});
            return ;
        }

        let dataArr;
        if (originalData) {
            dataArr = originalData.split(" ");
        }

        if (!dataArr || dataArr.length < 2 || dataArr.length > 3) {
            console.log("Invalid data: " + originalData);
            return;
        }

        let date = dataArr[0];
        let time = dataArr[1];
        let timezone = dataArr[2];

        this.setState({originalData: originalData, date: date, time: time, timezone: timezone})
    }

    updateTime(value) {
        this.props.onchange(this.state.date + " " + value);
    }


    addDay(value) {
        let momentValue = this.moment(this.state.date, "DD/MM/YYYY");
        momentValue.add(value, 'days');
        let date = momentValue.format("DD/MM/YYYY");
        this.props.onchange(date + " " + this.state.time + " " + this.state.timezone);
    }

    render() {

        if (!this.state.originalData) {
            return null;
        }

        return (
            <GridCell width="5-10">
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <div className="uk-form-row">
                            <div className="md-input-wrapper md-input-filled"
                                 style={{padding: "14px 4px 0"}}>
                                <label>{this.props.label}</label>
                                <div style={{display: "flex"}}>
                                    <div>
                                        <i className="uk-icon-arrow-down uk-icon-medsmall"
                                           onClick={() => {
                                               this.addDay(-1)
                                           }}/>
                                    </div>
                                    <div>
                                        <span className="uk-text-upper" style={{margin:"0 10px"}}>{this.state.date}</span>
                                    </div>
                                    <div>
                                        <i className="uk-icon-arrow-up uk-icon-medsmall"
                                           onClick={() => {
                                               this.addDay(1)
                                           }}/>
                                    </div>
                                    <div style={{marginTop: "-14px"}}>
                                    <Time key={uuid.v4()} step="15"
                                          timezone = {this.state.timezone}
                                          hideIcon={true}
                                          from={null}
                                          value={this.state.time}
                                          onchange={(value) => {this.updateTime(value)}}
                                          hideTimezone={false}
                                          hideTime={false}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GridCell>
                </Grid>
            </GridCell>
        );
    }
}
