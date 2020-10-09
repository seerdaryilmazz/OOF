import _ from 'lodash';
import PropTypes from 'prop-types';
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Grid, GridCell } from 'susam-components/layout';

export { ActionHeader } from './ActionHeader';
export { CalculationUtils } from './CalculationUtils';
export { EmailUtils } from './EmailUtils';
export { LoadingIndicator } from './LoadingIndicator';
export { MessageUtils } from './MessageUtils';
export { ObjectUtils } from './ObjectUtils';
export { PackageUtils } from './PackageUtils';
export { PhoneNumberUtils } from './PhoneNumberUtils';
export { PotentialUtils } from './PotentialUtils';
export { PromiseUtils } from './PromiseUtils';
export { QuoteUtils } from './QuoteUtils';
export { ResponsiveFrame } from "./ResponsiveFrame";
export { StringUtils } from './StringUtils';


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
                        <div style={{overflow: "hidden", whiteSpace:"pre-line", textAlign:"justify"}}>
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