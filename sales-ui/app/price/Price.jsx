import React from 'react';
import PropTypes from 'prop-types';
import { TranslatingComponent } from 'susam-components/abstract';
import { NumericInput } from 'susam-components/advanced';

export class Price extends TranslatingComponent {

    handleChange(value){
        let { currency, price} = this.props
        let priceValue = _.cloneDeep(price)
        priceValue.currency = _.get(price, 'currency', currency);
        priceValue.payweight = price.payweight;
        priceValue.value = value;
        priceValue.tariff = price.tariff;
        this.props.onchange && this.props.onchange(priceValue);
    }

    render(){
        let {price, currency, readOnly} = this.props;
        let unit = _.get(price, 'currency', currency);
        if(readOnly){
            let lang = _.toLower(this.context.translator.getLanguage());
            if(_.isEmpty(price)){
                return null;
            } else if('RATE' === _.get(price, 'priceType.code')){
                return <span>{price.value && Intl.NumberFormat(lang, { style: 'percent'}).format(price.value/100)}</span>
            } else {
                return <span>{price.value && Intl.NumberFormat(lang, { style: 'currency', currency: unit }).format(price.value)}</span>
            }
        }
        return <NumericInput digits="2" digitsOptional = {true} value={price.value} onchange={value=>this.handleChange(value)}  />
    }
}

Price.defaultProps = {
    price: {}
}

Price.contextTypes = {
    translator: PropTypes.object
}
