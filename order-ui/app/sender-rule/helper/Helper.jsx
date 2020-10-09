import React from 'react';
import { Grid, GridCell } from "susam-components/layout";
import { v4 } from "uuid";


export function PrintPackageDetail(packageDetail, translator) {
    return (
        <div className="md-list-content">
            <div className="md-list-heading">{packageDetail.packageType.name}
                <span className="uk-text-small uk-text-muted">
                    {' (' + (packageDetail.width ? packageDetail.width : " --" )} x
                    {' ' + (packageDetail.length ? packageDetail.length : " --")} x
                    {' ' + (packageDetail.height ? packageDetail.height : " --")}
                    {')'}
                    {packageDetail.stackSize ? ` ${translator.translate("Stackability")} : ` + packageDetail.stackSize.name : ""}
                </span>
            </div>
        </div>
    )
}

export class SenderLocationPrinter {

    constructor(translator){
        this.translator = translator;
    }

    renderSenderLocations(senderLocation){
        return (
            <li key = {senderLocation._key} className = {false ? "md-bg-blue-50" : ""}>
                <div className="md-list-content">
                    <div className="md-list-heading">{senderLocation.loadingCompany.name} / {senderLocation.loadingLocation.name}
                    </div>
                </div>
            </li>
        );
    }

    print(data) {
        if(data == null || data.length == 0){
            return(
                <ul className = "md-list">
                    <li>
                        <div className="md-list-content">
                            <div className="md-list-heading">{this.translator.translate("ALL LOCATIONS")}
                            </div>
                        </div>
                    </li>
                </ul>

            );
        }
        return(
            <ul className = "md-list">
                {data.map(item => this.renderSenderLocations(item))}
            </ul>
        );

    }
}

export class PackageDetailPrinter {

    constructor(translator){
        this.translator = translator;
    }

    renderPackageDetails(packageDetail){
        return (
            <li key = {packageDetail._key} className = {false ? "md-bg-blue-50" : ""}>
                {PrintPackageDetail(packageDetail, this.translator)}
            </li>
        );
    }

    print(data) {
        if(!data){
            return null;
        }
        return(
            <ul className = "md-list">
                {data.map(item => this.renderPackageDetails(item))}
            </ul>
        );

    }
}
export class GoodsPrinter {

    constructor(translator){
        this.translator = translator;
    }

    renderGoods(goods) {
        return (
            <li key={v4()}>
                <div className="md-list-content">
                    <div className="md-list-heading">
                        <Grid>
                            <GridCell width="1-6" noMargin={true}>
                                HS: {goods.code}
                            </GridCell>
                            <GridCell width="5-6" noMargin={true}>
                                {goods.name}
                            </GridCell>
                        </Grid>
                    </div>
                </div>
            </li>
        );
    }

    print(data) {
        if(!data){
            return null;
        }
        return (
             <ul className = "md-list">
                 {data.map(item => this.renderGoods(item))}
             </ul>
        );
    }
}

export class GoodsDecisionPrinter{
    constructor(translator){
        this.translator = translator;
    }

    print(data){
        let content;
        if(data == true){
            content = this.translator.translate("Ask");
        }else{
            content = (data == false) ? "Don't Ask" : data;
        }
        return(
            <div className="md-list-heading">{content}
            </div>
        );
    }
}

export class DangerousGoodsDetailPrinter{
    constructor(translator){
        this.translator = translator;
    }

    renderAdrDetail(item){
        return (
            <li key = {item.id}>
                <div className="md-list-content">
                    <div className="md-list-heading">
                        {this.translator.translate("UNNR") + ': ' + item.unNumber}
                        {' ' + this.translator.translate("Class") + ': ' + (item.adrClass ? item.adrClass : " -")}
                        {' ' + this.translator.translate("Packing") + ': ' + (item.packingGroup ? item.packingGroup : " -")}
                    </div>
                </div>
            </li>
        );
    }

    print(data){

        if(data && data.length>0){
            return(
                <ul className = "md-list">
                    {data.map(item => this.renderAdrDetail(item))}
                </ul>
            );
        }else{
            return(
                <div className="md-list-content">
                    <div className="md-list-heading">-</div>
                </div>
            )
        }

    }
}


export class IdCodeNamePrinter{
    renderName(item){
        return (
            <li key = {v4()}>
                <div className="md-list-content">
                    <div className="md-list-heading">
                        {item.name}
                    </div>
                </div>
            </li>
        );
    }

    print(data){

        if(data && data.length>0){
            return(
                <ul className = "md-list">
                    {data.map(item => this.renderName(item))}
                </ul>
            );
        }else{
            return(
                <div className="md-list-content">
                    <div className="md-list-heading">-</div>
                </div>
            )
        }

    }
}


