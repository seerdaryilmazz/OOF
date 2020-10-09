import React from 'react';
import uuid from 'uuid';
import _ from 'lodash';

import {DateTime} from './DateTime';
import {Grid, GridCell} from '../layout/Grid';

export class DateTimeRange extends React.Component{
    constructor(props){
        super(props);
        let id = uuid.v4();
        if(this.props.id){
            id = this.props.id;
        }
        this.startId = id + "_start";
        this.endId = id + "_end";
    }

    handleStartDate(value){
        this.handleOnChange(value, this.props.value ? this.props.value.endDateTime : null);
    }
    handleEndDate(value){
        this.handleOnChange(this.props.value ? this.props.value.startDateTime : null, value);
    }
    handleOnChange(startDateTime, endDateTime){
        this.props.onchange && this.props.onchange({startDateTime: startDateTime, endDateTime: endDateTime});
    }

    render(){
        let style = {};
        if(this.props.hidden){
            style.display= 'none';
        }
        let startDateTime = this.props.value && this.props.value.startDateTime;
        let endDateTime = this.props.value && this.props.value.endDateTime;

        return(
            <Grid>
                <GridCell width="1-2" noMargin = {true}>
                    <DateTime key = {this.startId} id = {this.startId} label = {this.props.startDateLabel}
                              hideIcon = {this.props.hideIcon} timeAsTextInput = {this.props.timeAsTextInput}
                              onchange = {(value) => this.handleStartDate(value) } value = {startDateTime}
                              hideTimezone={this.props.hideTimezone} timezone = {this.props.timezone}
                              maxDate = {endDateTime}/>
                </GridCell>
                <GridCell width="1-2" noMargin = {true}>
                    <DateTime key = {this.endId} id = {this.endId} label = {this.props.endDateLabel}
                              hideIcon = {this.props.hideIcon} timeAsTextInput = {this.props.timeAsTextInput}
                              onchange = {(value) => this.handleEndDate(value) } value = {endDateTime}
                              hideTimezone={this.props.hideTimezone} timezone = {this.props.timezone}
                              minDate = {startDateTime}/>
                </GridCell>
            </Grid>
        )
    }
}