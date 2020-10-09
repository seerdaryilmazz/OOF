import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import * as DataTable from 'susam-components/datatable';



export class PlanSummary extends TranslatingComponent{

    constructor(props){
        super(props);

    }

    render(){
        let details = {};
        if(this.props.trailerLoad) {
            details.packageTypes = this.props.trailerLoad.packageTypes;
            details.grossWeight = this.props.trailerLoad.grossWeight;
            details.volume = this.props.trailerLoad.volume;
            details.ldm = this.props.trailerLoad.ldm;
            details.payWeight = this.props.trailerLoad.payWeight;
        }

        return(
            <DataTable.Table data={[details]}>

                <DataTable.Text header="Package Count" reader = {new PackageTypeReader()}/>
                <DataTable.Text header="Gross Weight" reader = {new GrossWeightReader()}/>
                <DataTable.Text header="Volume" reader = {new VolumeReader()}/>
                <DataTable.Text header="LDM" reader = {new LDMReader()}/>
                <DataTable.Text field="payWeight" header="Pay Weight" />

            </DataTable.Table>
        );
    }

}

class PackageTypeReader{
    readCellValue(row){
        let count = 0;
        if(row.packageTypes) {
            row.packageTypes.forEach(packageType => {
                count += packageType.count ? packageType.count : 0
            })
        }
        return count;
    }
    readSortValue(row){
        return this.readCellValue(row);
    }
}

class GrossWeightReader{
    readCellValue(row){
        return row.grossWeight ? (row.grossWeight + " kg") : "-";
    }
    readSortValue(row){
        return this.readCellValue(row);
    }
}


class VolumeReader{
    readCellValue(row){
       return row.volume ? (Number((row.volume).toFixed(2)) + " m3") : "-";
    }
    readSortValue(row){
        return this.readCellValue(row);
    }
}

class LDMReader{
    readCellValue(row){
        return row.ldm ? Number((row.ldm).toFixed(2)) : "-";
    }
    readSortValue(row){
        return this.readCellValue(row);
    }
}