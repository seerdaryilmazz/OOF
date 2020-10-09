import PropTypes from 'prop-types';
import React from 'react';
import { Calendar } from 'susam-components/advanced';
import { CrmActivityService } from '../services';
var moment = require('moment');

export class ActivityCalendar extends React.Component {
    state = {};
    componentDidMount(){
        this.load();
    }

    load(mm = moment()){
        let daysInMonth = mm.daysInMonth();
        let start = mm.date(1).hour(0).minute(0).format('DD/MM/YYYY HH:mm') + ' ' + this.context.user.timeZoneId
        let end = mm.date(daysInMonth).hour(23).minute(59).format('DD/MM/YYYY HH:mm') + ' ' + this.context.user.timeZoneId;
        let parameters = {
            username: this.context.user.username,
            minStartDate: start,
            maxStartDate:end,
            page: 0,
            pageSize: 100
        }
        CrmActivityService.search(parameters).then(response=>{
            let events = response.data.content.map(i=>({
                url: `/ui/crm/activity/view/${i.id}`, 
                date: moment(_.split(i.calendar.startDate,' ')[0],'DD/MM/YYYY').format('YYYY-MM-DD'), 
                timeStart: `${_.split(i.calendar.startDate,' ')[1]}`,
                timeEnd: `${_.split(i.calendar.endDate,' ')[1]} ${_.split(i.calendar.startDate,' ')[2]}`,
                title: i.calendar.subject,
                accountName: i.account.name
            }));
            this.setState({events: events})
        })
    }

    render(){
        return <Calendar events={this.state.events} 
            onAddEvent={()=>window.alert("qwefg")}
            onMonthChange={month=>this.load(month)} />
    }
}

ActivityCalendar.contextTypes = {
    router: PropTypes.object,
    translator: PropTypes.object,
    user: PropTypes.object
};