import React from "react";
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Grid, GridCell} from '../layout';
import {TranslatingComponent} from '../abstract/';

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

            var value = "";
            if (_.isArray(this.props.value)) {
                if(this.props.value.length > 0){
                    this.props.value.forEach((item) => {
                        if(value.length > 0) value += ", ";
                        value += item[labelField];
                    });
                }
            } else {
                if(this.props.value != null){
                    if(this.props.value[labelField]){
                        value = this.props.value[labelField];
                    }else{
                        value = this.props.value;
                    }
                }
            }

            value = this.props.translate ? super.translate(value) : value;

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
                        {value}
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

