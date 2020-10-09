import React from 'react';
import PropTypes from 'prop-types';
import {CookieUtils} from '../../utils';
import { Notification } from '../Notification';
import { UserImage } from './UserImage';

export class Navbar extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            eventCount:0,
            latestEvent:"",
            messages:[],
            warnings:[],
            alerts:[]
        };
        this.csrfToken = CookieUtils.getCookie("XSRF-TOKEN");
    }

    loadLocales() {
        $.ajax({
            url: '/translator-service/locale/by-status?status=ACTIVE',
            dataType: 'json',
            success: (data) => {
                this.setState({
                    locales: data
                });
            },
            error: (xhr, status, err) => {
                console.error("locale hata", status, err.toString());
            }
        });
    }

    loadEvents() {
        $.ajax({
            url: '/task-service/event/myevents',
            dataType: 'json',
            success: (data) => {
                this.setState({
                    eventCount: data.length,
                    messages: data.filter(event => event.eventSpec.eventSeverity === "INFO"),
                    warnings: data.filter(event => event.eventSpec.eventSeverity === "WARNING"),
                    alerts: data.filter(event => event.eventSpec.eventSeverity === "ALARM"),
                    latestEvent: data[data.length-1]
                });
            },
            error: (xhr, status, err) => {
                console.error("hata", status, err.toString());
            }
        });
    }
    loadEventsAfter(){
        $.ajax({
            url: '/task-service/event/eventsfrom/' + this.state.latestEvent.id,
            dataType: 'json',
            success: (data) => {
                if(data.length > 0){
                    var params = {timeout: 0};
                    if(data[0].eventSpec.eventSeverity === "WARNING"){
                        params.status = 'warning';
                    }
                    UIkit.notify("<i class='uk-icon-check'></i> " + data[0].eventSpec.eventType, params);
                    this.setState({
                        eventCount: this.state.eventCount + data.length,
                        messages: this.state.messages.concat(data.filter(event => event.eventSpec.eventSeverity === "INFO")),
                        warnings: this.state.warnings.concat(data.filter(event => event.eventSpec.eventSeverity === "WARNING")),
                        alerts: this.state.alerts.concat(data.filter(event => event.eventSpec.eventSeverity === "ALARM")),
                        latestEvent: data[0]
                    });
                }
            },
            error: (xhr, status, err) => {
                console.error("hata", status, err.toString());
            }
        });
    }
    refreshEvents(){
        if(this.state.latestEvent){
            this.loadEventsAfter();
        }else{
            this.loadEvents();
        }
    }

    componentDidMount(){
        this.loadLocales();
        // this.loadEvents();
        // this.loadEventsHandle = setInterval(this.refreshEvents.bind(this), 60000);

    }
    componentWillUnmount(){
        // clearInterval(this.loadEventsHandle);
    }

    handleSettingsClick(e){
        e.preventDefault();
        this.context.router.push('/settings');
    }

    handleChangeLanguage(value){
        this.context.translator.setLocale(value);
    }

    handleLogoutClick(e){
        e.preventDefault();
        $("#logout").submit();
    }

    render(){
        return(
            <ul className="uk-navbar-nav user_actions">
                <li><a href="#" id="main_search_btn" className="user_action_icon"><i className="material-icons md-24 md-light">&#xE8B6;</i></a></li>
                <li><a href="/" id="main_home_btn" className="user_action_icon"><i className="material-icons md-24 md-light">home</i></a></li>
                <li><a href="/ui/kpi/" id="my_kpi_btn" className="user_action_icon"><i className="uk-icon-line-chart uk-icon-medsmall2" style={{color: "white"}}></i></a></li>
                <li><a href="#" id="full_screen_toggle" className="user_action_icon uk-visible-large"><i className="material-icons md-24 md-light">&#xE5D0;</i></a></li>
                <Notification />
                <li data-uk-dropdown="{mode:'click',pos:'bottom-right'}">
                    <a href="#" className="user_action_image" style={{padding: "2px 0"}}><UserImage /></a>
                    <div className="uk-dropdown uk-dropdown-small">
                        <form id="logout" action="/logout" method="POST" encType="multipart/form-data">
                            <input type="hidden" name="_csrf" value = {this.csrfToken} />
                        </form>

                        <ul className="uk-nav js-uk-prevent">
                            <li><a href="/profile">My profile</a></li>
                            <li><a href="#" onClick = {(e) => this.handleSettingsClick(e)}>Settings</a></li>
                            <li><a href="#" onClick = {(e) => this.handleLogoutClick(e)}>Logout</a></li>
                        </ul>
                    </div>
                </li>
                <li data-uk-dropdown="{mode:'click',pos:'bottom-right'}">
                    <a href="#" className="user_action_image"><i className="material-icons md-24 md-light">language</i> {this.context.translator.getLanguage()}</a>
                    <div className="uk-dropdown uk-dropdown-small uk-dropdown-scrollable">
                        <ul className="uk-nav js-uk-prevent">
                            {this.state.locales && this.state.locales.map(locale=>{
                                return(
                                    <li key={locale.id}>
                                        <a href="javascript:;" onClick = {(e) => {e.preventDefault(); this.handleChangeLanguage(locale.isoCode)}}>{locale.originalName}</a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </li>
            </ul>
        );
    }

}

Navbar.contextTypes = {
    translator: PropTypes.object,
    router: PropTypes.object.isRequired
};