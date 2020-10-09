import PropTypes from 'prop-types';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { StateTrackerRegistry } from '../abstract';
import { Notify } from '../basic';
import { AuthorizationService } from '../oneorder/AuthorizationService';
import { UserService } from '../oneorder/UserService';
import { Translator } from '../translator';
import { LocalStorage } from '../utils/LocalStorage';

export class Application extends React.Component{
    constructor(props){
        super(props);
        this.translator = new Translator(this.props.name);
        // TODO : Check technical debt OO-817
        Notify.translator = this.translator;
        this.translator.onChangeLocale = (locale) => this.handleChangeLocale(locale);
        this.translator.onMessagesReceived = () => this.handleMessageReceived();
        this.state = {locale: this.translator.locale};
        this.stateTrackerRegistry = new StateTrackerRegistry();
        this.storage = new LocalStorage(this.props.name);
    };

    getOperations(){
        AuthorizationService.operations().then(response => {
            let operations = response.data.map(item => item.name);
            this.setState({operations: operations});
        }).catch(error => {
            Notify.showError(error);
        });
    }
    getMyUser(){
        UserService.me().then(response => {
            this.setState({user: response.data});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    componentWillMount(){
        this.getOperations();
    }

    handleChangeLocale(locale){
        this.setState({locale: locale}, ()=>this.setHtmlLang());
    }
    handleMessageReceived(){
        this.setState({messagesReceived: new Date()});
    }
    componentDidMount(){
        this.translator.loadTranslations();
        this.getMyUser();
        this.setHtmlLang();
    };

    setHtmlLang(){
        $("html").attr("lang", this.translator.getLanguage().toLowerCase());
    }

    getChildContext() {
        return {
            isMobile: isMobile,
            appName: this.props.name,
            translator: this.translator,
            storage: this.storage,
            stateTrackerRegistry: this.stateTrackerRegistry,
            user: this.state.user,
            operations: this.state.operations
        };
    }

    render() {
        if (this.state.user && this.state.messagesReceived) {
            return (
                <div>
                    {this.props.children}
                </div>
            );
        } else {
            return null;
        }
    };
}
Application.childContextTypes = {
    isMobile: PropTypes.bool,
    appName: PropTypes.string,
    translator: PropTypes.object,
    storage: PropTypes.object,
    user: PropTypes.object,
    stateTrackerRegistry: PropTypes.object,
    operations: PropTypes.array,
};
