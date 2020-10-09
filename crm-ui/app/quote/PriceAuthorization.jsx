import React from 'react';
import { NumericInput } from 'susam-components/advanced';
import { Checkbox } from 'susam-components/basic';
import { Grid, GridCell, Secure } from 'susam-components/layout';
import { ObjectUtils } from '../utils';
import uuid from 'uuid';

export class PriceAuthorization extends React.Component {
    state = {};

    newAuthorization(clear) {
        let authorization = clear ? {} : _.cloneDeep(this.props.authorization) || {};
        authorization.priceRequest = authorization.priceRequest || !_.isEmpty(authorization.requestedAmount);
        authorization.minimumAmount = this.adjustAmount(_.get(this.props, 'price.priceCalculation.minAmount'));
        authorization.calculatedAmount = this.adjustAmount(_.get(this.props, 'price.priceCalculation.calculatedAmount'));
        return authorization
    }

    componentDidMount() {
        this.init();
    }

    updateValue(value, clear) {
        if(!this.props.onchange){
            return;
        }
        let authorization = null;
        if (false !== _.get(value, 'priceRequest')) {
            authorization = this.newAuthorization(clear);
            for (let key in value) {
                let val = _.get(value, key);
                _.set(authorization, key, val);
            }
        }
        this.props.onchange(authorization);
    }

    init() {
        if(this.props.authorization){
            this.props.onchange && this.props.onchange(this.newAuthorization());
        }
    }

    adjustAmount(amount) {
        return amount && {
            amount: amount,
            currency: this.props.price.charge.currency
        };
    }

    render() {
        let priceRequest = _.get(this.props, 'authorization.priceRequest');
        return (
            <Grid divider={true}>
                <GridCell width="2-3" key={1}>
                    <Grid collapse={true}>
                        <GridCell width="1-2">
                            <Checkbox label="Price Request"
                                onchange={value => this.updateValue({ 'priceRequest': value, 'requestedAmount': undefined })}
                                value={_.get(this.props, 'authorization.priceRequest')} />
                        </GridCell>
                        <GridCell width="1-2">
                            <NumericInput disabled={!priceRequest}
                                digitsOptional={false} required={priceRequest}
                                onchange={value => this.updateValue({ priceRequest: true, 'requestedAmount': this.adjustAmount(value)}, true)}
                                value={_.get(this.props, 'authorization.requestedAmount.amount')}
                                label="Requested Amount"
                                digits="2" />
                        </GridCell>
                    </Grid>
                </GridCell>
                <GridCell width="1-3" key={0}>
                    <Secure operations={["crm-quote.price-admin"]} readOnly={true}>
                        <NumericInput digitsOptional={false}
                                disabled={!priceRequest}
                                onchange={value => this.updateValue({ 'approvedAmount': this.adjustAmount(value), closeStatus: ObjectUtils.enumHelper('REQUESTED') })}
                                value={_.get(this.props, 'authorization.approvedAmount.amount')}
                                label="Approved Amount"
                                digits="2" />
                    </Secure>
                </GridCell>
            </Grid>
        );
    }
}

PriceAuthorization.contextTypes = {
    translator: React.PropTypes.object,
    user: React.PropTypes.object
};