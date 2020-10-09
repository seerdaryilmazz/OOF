import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button } from "susam-components/basic";
import * as DataTable from 'susam-components/datatable';
import { Grid, GridCell } from "susam-components/layout";


export class PlanningTable extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {};
    }

    handleArrowDownClick(){
        this.props.onNarrowList && this.props.onNarrowList();
    }
    handleArrowUpClick(){
        this.props.onEnlargeList && this.props.onEnlargeList();
    }

    handleSelectPlan(plan){
        this.props.onSelect && this.props.onSelect(plan);
    }
    render(){
        if(this.props.hide){
            return null;
        }
        let enlargeButton = null;
        let narrowButton = null;
        if(this.props.settings.showEnlargeButton){
            enlargeButton = <Button icon="arrow-up" flat = {true} onclick = {() => this.handleArrowUpClick()} />;
        }
        if(this.props.settings.showNarrowButton){
            narrowButton = <Button icon="arrow-down" flat = {true} onclick = {() => this.handleArrowDownClick()} />;
        }

        return (
            <div>
                <Grid>
                    <GridCell width="6-10">

                    </GridCell>
                    <GridCell width="4-10" id="groupControls">
                        <div className="uk-align-right">
                            {enlargeButton}
                            {narrowButton}
                        </div>
                    </GridCell>
                    <GridCell width="1-1" noMargin = {true} id="resultsTableCell">

                        <DataTable.Table data={this.props.plans} filterable={false} sortable={false}
                                         insertable={false} editable={false}
                                         selectedRows = {[this.props.selectedPlan]}>
                            <DataTable.ActionColumn>
                                <DataTable.ActionWrapper track="onclick" onaction = {(data) => {this.handleSelectPlan(data)}}>
                                    <Button label="select" flat = {true} style="primary" size="small"/>
                                </DataTable.ActionWrapper>
                            </DataTable.ActionColumn>
                            <DataTable.Text header="Code" field="code" sortable={true} filterable={true}/>
                            <DataTable.Text header="Plate Number" sortable={true} filterable={true}
                                            reader={new PlateNumberReader()} />
                            <DataTable.Text header="Service Type" field="serviceType" sortable={true} filterable={true} />
                            <DataTable.Text header="Status" sortable={true} filterable={true}
                                            reader={new PlanStatusReader()} printer={new PlanStatusPrinter()}/>
                            <DataTable.Text header="Progress" field="progress" sortable={true} filterable={true}/>
                            <DataTable.Text header="Origin" field="origin" sortable={true} filterable={true} center={true}/>
                            <DataTable.Text header="Destination" field="destination" sortable={true} filterable={true} center={true}/>

                            <DataTable.Text header="Number of Stops" field="numberOfStops" sortable={true} filterable={true} center={true} />
                            <DataTable.Text header="Properties" field="details.combined" sortable={true} filterable={true} center={true}/>

                        </DataTable.Table>
                    </GridCell>
                </Grid>
            </div>
        );
    }
}

class PlateNumberReader{
    readCellValue(row){
        return row.trailerPlates.join(",");
    }
    readSortValue(row){
        return this.readCellValue(row);
    }
}

class PlanStatusReader{
    readCellValue(row){
        let status = {name: "None", class: "none"};
        if(row.planCompleted) {
            status = PLAN_STATUS_COMPLETED;
        } else if(row.planStarted) {
            status = PLAN_STATUS_IN_PROGRESS;
        } else {
            status = PLAN_STATUS_NOT_STARTED;
        }
        return status;
    }
    readSortValue(row){
        return this.readCellValue(row).name;
    }
}
class PlanStatusPrinter{
    print(data){
        return <span className={"uk-badge uk-badge-" + data.class}>{data.name}</span>
    }
}

const PLAN_STATUS_NOT_STARTED = {
    id: "PLAN_NOT_STARTED",
    name: "Not Started",
    class: "danger"
}
const PLAN_STATUS_IN_PROGRESS = {
    id: "IN_PROGRESS",
    name: "In Progress",
    class: "success"
}
const PLAN_STATUS_COMPLETED = {
    id: "PLAN_COMPLETED",
    name: "Completed",
    class: "primary"
}