import React from 'react';
import { DropDown } from 'susam-components/basic';
import { PricingRuleService } from '../services';

export class PayweightDropdown extends React.Component {
    state = {
        payweights: []
    };

    constructor(props) {
        super(props);
        this.listPayweights();
    }

    listPayweights() {
        PricingRuleService.listPayweight().then(response=>{
            this.setState({payweights: response.data}, ()=>{
                let {payweights} = this.state;
                this.handlePayweightChange(_.find(payweights, i=>i.defaultPayweight));
            })
        })
    }

    handlePayweightChange(value){
        let {onchange} = this.props;
        onchange && onchange(value);
    }

    render() {
        return <DropDown {...this.props}
            label={this.props.label || 'Payweight'}
            options={this.state.payweights}
            value={this.props.value}
            onchange={value => this.handlePayweightChange(value)} />
    }

}