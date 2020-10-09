import React from "react";
import PropTypes from 'prop-types';
import _ from 'lodash';
import NotAuthorized from './NotAuthorized';
import {Notify, Loader} from 'susam-components/basic';

export function withAuthorization(WrappedComponent, operations, config){
    class SecureComponent extends React.Component {
        constructor(props){
            super(props);
            this.config = _.defaults(config, {hideWhenNotAuthorized: false});
            this.operations = _.isArray(operations) ? operations : [operations];
        }
        matchOperationNames(){
            if(this.permissions === undefined && this.context.operations !== undefined){
                this.permissions = _.intersection(this.context.operations, this.operations);
            }
        }
        isAuthorized(){
            this.matchOperationNames();
            if(this.permissions === undefined){
                return null;
            }
            return this.permissions.length > 0;
        }

        render() {
            let isAuthorized = this.isAuthorized();
            if(isAuthorized === null){
                return null;
            }
            if(isAuthorized){
                return <WrappedComponent {...this.props} />;
            }else{
                if(!this.config.hideWhenNotAuthorized){
                    return <NotAuthorized operationNames = {this.operations.join(",")}/>;
                }
            }

            return null;

        }
    }
    SecureComponent.contextTypes = {
        operations: PropTypes.array
    };
    return SecureComponent;
}