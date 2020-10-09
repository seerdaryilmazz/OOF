import React from "react";
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Grid, GridCell} from 'susam-components/layout';
import {ActionHeader} from "./ActionHeader";
import {DateTimeUtils} from "./DateTimeUtils";
import {FabToolbar} from "./FabToolbar";
import {LoadingIndicator} from "./LoadingIndicator";
import {ResponsiveIframe} from "./ResponsiveFrame";
import {TranslatingComponent} from 'susam-components/abstract';

export {StringUtils} from './StringUtils';
export {PhoneNumberUtils} from './PhoneNumberUtils';
export {ActionHeader} from './ActionHeader';
export {FabToolbar} from './FabToolbar';
export {LoadingIndicator} from './LoadingIndicator';


export function withReadOnly(WrappedComponent){
    class ReadOnlyComponent extends TranslatingComponent {
        constructor(props){
            super(props);
        }
        renderReadOnly(){
            let labelField = this.props.labelField;
            if (!labelField) {
                labelField = "name";
            }



            let value = "";
            if (_.isArray(this.props.value)) {
                if(this.props.value.length > 0){
                    this.props.value.forEach((item) => {
                        if(value.length > 0) value += ", ";
                        value += item[labelField];
                    });
                }
            } else {
                if(this.props.value instanceof Object && this.props.value[labelField]){
                    value = this.props.value[labelField];
                }else{
                    if(this.props.options instanceof Object){
                      let selected = _.find(this.props.options, {code:this.props.value});
                      if(selected){
                          value = selected[labelField];
                      }
                    }
                }
            }
            if(!value && value === ""){
                value = this.props.value;
            }

            return (
                <Grid>
                    <GridCell width="1-1" noMargin={true}>
                        <div className="uk-form-row">
                            <div className="md-input-wrapper md-input-filled">
                                <label>{super.translate(this.props.label)}</label>
                            </div>
                        </div>
                    </GridCell>
                    <GridCell width="1-1">
                        <div style={{overflow: "hidden"}}>
                            {value}
                        </div>
                    </GridCell>
                </Grid>
            )
        }

        render() {
            if(this.props.readOnly){
                return this.renderReadOnly();
            }else{
                return <WrappedComponent {...this.props} />;
            }
        }
    }
    ReadOnlyComponent.contextTypes = {
            translator: PropTypes.object
        };
    return ReadOnlyComponent;
}

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
            /*return this.permissions.length > 0;*/
            return 1;
        }

        render() {
            let isAuthorized = this.isAuthorized();
            if(isAuthorized){
                return <WrappedComponent {...this.props} />;
            }
            return null;
        }
    }
    SecureComponent.contextTypes = {
        operations: PropTypes.array
    };
    return SecureComponent;
}