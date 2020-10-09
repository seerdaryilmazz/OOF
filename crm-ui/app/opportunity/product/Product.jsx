import React from "react";
import {TranslatingComponent} from 'susam-components/abstract';
import {FreightProduct} from "./FreightProduct";
import {CustomsProduct} from "./CustomsProduct";
import {WarehouseProduct} from "./WarehouseProduct";

export class Product extends TranslatingComponent {

    validate() {
        return this.productForm.validate();
    }

    render() {
        let serviceArea = this.props.serviceArea;
        if (["ROAD", "AIR", "SEA", "DTR"].includes(serviceArea)) {
            return (
                <FreightProduct ref={c => this.productForm = c}
                                product={this.props.product || undefined}
                                serviceArea={serviceArea}
                                onChange={(product) => this.props.onChange(product)}/>
            )
        } else if ("CCL" === serviceArea) {
            return (
                <CustomsProduct ref={c => this.productForm = c}
                                product={this.props.product || undefined}
                                serviceArea={serviceArea}
                                onChange={(product) => this.props.onChange(product)}/>
            )
        } else if ("WHM" === serviceArea) {
            return (
                <WarehouseProduct ref={c => this.productForm = c}
                                  product={this.props.product || undefined}
                                  serviceArea={serviceArea}
                                  onChange={(product) => this.props.onChange(product)}/>
            )
        } else {
            return null;
        }
    }
}