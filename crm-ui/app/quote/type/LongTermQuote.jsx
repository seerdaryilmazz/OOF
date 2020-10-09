import React from "react";
import _ from "lodash";
import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader, GridCell, Grid, Card, CardHeader} from "susam-components/layout";

import {QuoteCommonInfo} from "../QuoteCommonInfo";
import {BundledProductList} from "../product/";
import {ObjectUtils} from "../../utils";
import { Notify} from 'susam-components/basic';
import { TextArea, Checkbox } from "susam-components/basic";
import { CrmQuoteService } from "../../services";

export class LongTermQuote extends TranslatingComponent{

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    /**
     * Tek seferde birden çok değeri değiştirmek için...
     */

    handleChangeMultiple(keyValuePairs) {
        let quote = _.cloneDeep(this.props.quote);
        ObjectUtils.applyKeyValuePairs(keyValuePairs, quote);
        this.props.onChange(quote);
    }

    validate(){
        if(!this.quoteCommonInfo.validate()){
                return false;
        }
        return true;
    }

    handleChange(key, value) {
        let quote = _.cloneDeep(this.props.quote);
        _.set(quote, key, value);
        this.props.onChange && this.props.onChange(quote);
    }

    renderPageHeader(){
        let quoteNumberSuffix = !_.isNil(this.props.quote.number) ? " - " + this.props.quote.number : "";
        return (
            <GridCell noMargin={true} style={{paddingLeft:"10px",paddingTop:"10px",position:"fixed",zIndex:2,marginTop: "-54px", marginRight:"50px", background:"#eeeeee"}}>
                <PageHeader title={super.translate("Long Term Quote") + quoteNumberSuffix}/>
            </GridCell>
        );
    }

    renderBusinessVolume(){
        if(this.props.quote.serviceArea.code !== 'WHM'){
            return null;
        }
        else{
            return(
                <Card>
                    <CardHeader title="Business Volume" />
                    <Grid>
                            <GridCell width="2-5">
                                 <TextArea label="Inbound" value= {_.get(this.props.quote, 'businessVolume.inbound') || " "}
                                            rows={2}
                                            maxLength="255" readOnly = {this.props.readOnly}
                                            onchange = {(value) => this.handleChange("businessVolume.inbound", value)} />
                            </GridCell>
                            <GridCell width="2-5">
                                 <TextArea label="Storage" value= {_.get(this.props.quote, 'businessVolume.storage') || " "}
                                            rows={2}
                                            maxLength="255" readOnly = {this.props.readOnly}
                                            onchange = {(value) => this.handleChange("businessVolume.storage", value)} />
                            </GridCell>
                            <GridCell width="1-5">
                                <Checkbox label="Spot" value = {_.get(this.props.quote,'businessVolume.spot') || false} 
                                          disabled = {this.props.readOnly}
                                          onchange={(value) => this.handleChange("businessVolume.spot", value)} />
                            </GridCell>
                            <GridCell width="2-5">
                                <TextArea label="Outbound" value= {_.get(this.props.quote, 'businessVolume.outbound') || " "}
                                           rows={2}
                                           maxLength="255" readOnly = {this.props.readOnly}
                                           onchange = {(value) => this.handleChange("businessVolume.outbound", value)} />
                            </GridCell>
                            <GridCell width="2-5">
                                <TextArea label="Value Added Services" value= {_.get(this.props.quote, 'businessVolume.vas') || " "}
                                           rows={2} 
                                           maxLength="255" readOnly = {this.props.readOnly}
                                           onchange = {(value) => this.handleChange("businessVolume.vas", value)} />
                            </GridCell>
                            </Grid>
                </Card>
                
            );
        }
    }
    
    render(){
        if (!this.props.account) {
            return null;
        }
        return(
            <div>
                {this.renderPageHeader()}
                <QuoteCommonInfo ref = {c => this.quoteCommonInfo = c}
                                 account = {this.props.account}
                                 quote = {this.props.quote}
                                 onChange={(keyValuePairs) => this.handleChangeMultiple(keyValuePairs)}
                                 readOnly={this.props.readOnly}/>
                {this.renderBusinessVolume()}
                <BundledProductList quote = {this.props.quote}
                                    onChange={(keyValuePairs) => this.handleChangeMultiple(keyValuePairs)}
                                    readOnly={this.props.readOnly}/>
            </div>
        );
    }
}