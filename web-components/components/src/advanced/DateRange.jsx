import React from "react";
import uuid from "uuid";
import {Date} from "./Date";
import {Grid, GridCell} from "../layout/Grid";

export class DateRange extends React.Component{
    constructor(props){
        super(props);
        let id = this.props.id;
        if(!id){
            id = uuid.v4();
        }
        this.state = {startId: id + "_start", endId: id + "_end"};
        if(this.props.value){
            this.state.startDate = this.props.value.startDate;
            this.state.endDate = this.props.value.endDate;
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            startDate: nextProps.value ? nextProps.value.startDate : '',
            endDate: nextProps.value ? nextProps.value.endDate : '',
        });
    }
    componentDidUpdate(){
        var $dp_start = $('#' + this.state.startId),
            $dp_end = $('#' + this.state.endId);
        
        this.end_date.options.minDate = this.defaultTo($dp_start.val(), false);
        this.start_date.options.maxDate = this.defaultTo($dp_end.val(), false);
    }

    componentDidMount(){

        var $dp_start = $('#' + this.state.startId),
            $dp_end = $('#' + this.state.endId);

        this.start_date = $.UIkit.datepicker($dp_start);
        this.end_date = $.UIkit.datepicker($dp_end);

        this.end_date.options.minDate = this.defaultTo($dp_start.val(), false);
        this.start_date.options.maxDate = this.defaultTo($dp_end.val(), false);
        
        $dp_start.on('change',() => {
            this.end_date.options.minDate = this.defaultTo($dp_start.val(), false);
            this.handleStartDate($dp_start.val());
            setTimeout(function () {
                $dp_end.focus();
            },300);
        });

        $dp_end.on('change',() => {
            this.start_date.options.maxDate = this.defaultTo($dp_end.val(), false);
            this.handleEndDate($dp_end.val());
        });
    }

    defaultTo(value, defaultValue) {
        return _.isEmpty(value) ? defaultValue : value;
    }

    handleStartDate(value){
        let state = _.cloneDeep(this.state);
        state.startDate = value;
        this.setState(state);
        this.handleOnChange(state);
    }
    handleEndDate(value){
        let state = _.cloneDeep(this.state);
        state.endDate = value;
        this.setState(state);
        this.handleOnChange(state);
    }
    handleOnChange(state){
        if (state.startDate || state.endDate) {
            this.props.onchange && this.props.onchange({startDate: state.startDate, endDate: state.endDate});
        } else {
            this.props.onchange && this.props.onchange(null);
        }
    }

    render(){
        var style = {};
        if(this.props.hidden){
            style.display= 'none';
        }

        let width = this.props.vertical ? "1-1" : "1-2";

        let startRequired = this.props.required || this.props.startRequired;
        let endRequired = this.props.required || this.props.endRequired;

        return(
            <Grid collapse = {true}>
                <GridCell width={width} noMargin={this.props.noMargin}>
                    <Date id={this.state.startId} label = {this.props.startDateLabel}
                        value = {this.state.startDate} required = {startRequired} hideIcon = {this.props.hideIcon}
                        minDate = {this.props.minDate}/>
                </GridCell>
                <GridCell width={width} noMargin={this.props.noMargin}>
                    <Date id={this.state.endId} label = {this.props.endDateLabel}
                        value = {this.state.endDate} required = {endRequired} hideIcon = {this.props.hideIcon}
                        maxDate = {this.props.maxDate}/>
                </GridCell>
            </Grid>
        )
    }
}