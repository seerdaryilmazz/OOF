import React from 'react';
import PropTypes from 'prop-types'
import { Alert } from '../layout';

export class Secure extends React.Component {
    constructor(props) {
        super(props);
        let p = {}
        for(let key in props){
            if(!["operations", "readOnly", "message","children"].includes(key)){
                p[key] = props[key];
            }
        }
        this.state = {prop: p};
    }

    isAuthorizedOperation() {
        if (_.isUndefined(this.props.operations)) {
            return false;
        }
        let operations = _.isArray(this.props.operations) ? this.props.operations : [this.props.operations];
        let permissions = _.intersection(this.context.operations, operations);
        if (permissions === undefined) {
            return null;
        }
        return permissions.length > 0;
    }

    isAuthorizedUser() {
        let {users} = this.props;
        if (_.isUndefined(users)) {
            return false;
        }
        let key = this.props.usersKey || 'username';
        return 0 <= _.findIndex(users, i => i === _.get(this.context.user, key));
    }

    isAuthorized(){
        if(_.isUndefined(this.props.users) && _.isUndefined(this.props.operations)){
            return true;
        } else if(_.isUndefined(this.props.users) && this.isAuthorizedOperation()){
            return true;
        } else if(_.isUndefined(this.props.operations) && this.isAuthorizedUser()){
            return true;
        } else if(this.isAuthorizedUser() || this.isAuthorizedOperation()) {
            return true;
        }
        return false;
    }

    render() {
        if (this.isAuthorized()) {
            const children = React.Children.map(this.props.children, (child, index) => React.cloneElement(child, Object.assign({}, this.state.prop, { key: index })));
            return 1 === children.length ? children[0] : <span>{children}</span>;
        } else if (this.props.readOnly) {
            return <span>{React.Children.map(this.props.children, child => React.cloneElement(child, { readOnly: this.props.readOnly }))}</span>;
        } else if (this.props.message) {
            return <Alert message={this.props.message} translate={true} type="danger" />
        }
        return null;
    }
}

Secure.contextTypes = {
    user: PropTypes.object,
    operations: PropTypes.array
};