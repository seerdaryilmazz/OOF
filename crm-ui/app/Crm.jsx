import PropTypes from 'prop-types';
import React from 'react';
import { ConfigurationManagementService, UserService } from './services';
import * as axios from 'axios';

export class Crm extends React.Component {
    state = {
        dataLoaded: false,
        userList: [],
        optionList: []
    };

    constructor(props) {
        super(props);
        axios.all([
            UserService.getUsers(),
            ConfigurationManagementService.listOptions()
        ]).then(axios.spread((users, options)=>{
            this.setState({
                dataLoaded: true,
                userList: users.data,
                optionList: options.data,
            })
        }));
    }

    getOption(key, defaultValue, subsidiary = this.context.user.firstSubsidiary) {
        let options = _.filter(this.state.optionList, { key: key });
        let defaultOption = _.find(options, { subsidiary: null });
        let foundOption = _.defaultTo(_.find(options, { subsidiary: { id: _.get(subsidiary, 'id') } }), defaultOption);
        return foundOption ? foundOption.value : defaultValue;
    }

    getUser(username, path) {
        let user = _.find(this.state.userList, { username: username });
        if (path) {
            return _.get(user, path);
        }
        return user;
    }

    getChildContext() {
        return {
            getAllUsers: () => this.state.userList,
            getUsers: () => _.filter(this.state.userList, i => i.status.code === 'ACTIVE'),
            getUser: (username, path) => this.getUser(username, path),
            getOption: (key, defaultValue, subsidiary) => this.getOption(key, defaultValue, subsidiary)
        };
    }

    render() {
        if(this.state.dataLoaded){
            return this.props.children;
        }
        return null;
    }
}

Crm.contextTypes = {
    user: PropTypes.object
}

Crm.childContextTypes = {
    getOption: PropTypes.func,
    getUsers: PropTypes.func,
    getUser: PropTypes.func,
    getAllUsers: PropTypes.func
};