import React from "react";
import {Span, TextInput} from "susam-components/basic";
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

        if (originalData == this.state.originalData) {
            return;
        }

        if(originalData == null) {
            this.setState({originalData: originalData});
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
        let timezone = dataArr.length == 3 ? dataArr[2] : null;

        this.setState({originalData: originalData, date: date, time: time, timezone: timezone})
    }

    updateTime(value) {
        this.props.onchange(this.state.date + " " + value + " " + this.state.timezone);
    }


    addDay(value) {
        let momentValue = this.moment(this.state.date, "DD/MM/YYYY");
        momentValue.add(value, 'days');
        let date = momentValue.format("DD/MM/YYYY");
        this.props.onchange(date + " " + this.state.time + (this.state.timezone ? " " + this.state.timezone : ""));
    }

    render() {

        if (!this.state.originalData) {
            return null;
        }



        return (

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
                                <TextInput
                                           helperText = {this.state.timezone}
                                           mask = "'showMaskOnFocus':'true', 'mask':'h:s'"
                                           onchange={(value) => this.updateTime(value)}
                                           value={this.state.time}/>
                            </div>
                        </div>
                    </div>
                </div>
            </GridCell>
        );
    }
}
