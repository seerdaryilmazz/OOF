import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { GridCell } from 'susam-components/layout';

export class WarningMessageWhenCalculatedPriceIsZero extends TranslatingComponent {

    shouldRender(freightPrice) {
        if (freightPrice && freightPrice.calculatedAmountOrg === 0) {
            return true;
        } else {
            return false;
        }
    }

    renderWarningMessage() {
        return (<span className="uk-text-danger">{super.translate("Please contact with the Pricing Department for the Freight price.")}</span>);
    }

    renderUsingQuote(quote) {
        let warningMessage = null;
        if (quote && quote.prices) {
            let freightPrice = _.find(quote.prices, (item) => {
                return item.billingItem.code == "1101";
            });
            if (this.shouldRender(freightPrice)) {
                warningMessage = (
                    <GridCell width="1-2">
                        {this.renderWarningMessage()}
                    </GridCell>
                );
            }
        }
        return warningMessage;
    }

    renderUsingPrice(price) {
        let warningMessage = null;
        if (price && price.billingItem.code == "1101" && this.shouldRender(price)) {
            warningMessage = (
                <GridCell width="1-1" noMargin={true}>
                    {this.renderWarningMessage()}
                </GridCell>
            );
        }
        return warningMessage;
    }

    render() {
        if (this.props.quote) {
            return this.renderUsingQuote(this.props.quote);
        } else if (this.props.price) {
            return this.renderUsingPrice(this.props.price);
        } else {
            return null;
        }
    }
}

WarningMessageWhenCalculatedPriceIsZero.contextTypes = {
    translator: PropTypes.object
};

