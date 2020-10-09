import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Button } from "susam-components/basic";
import { Grid, GridCell } from "susam-components/layout";
import { PlanSummary } from './PlanSummary';




export class PlanDetails extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {};
    }
    handleResize = () => {
        this.setState({contentHeight: window.innerHeight - $("#header_main").height(), saveButtonHeight: $("#save_plan").height()});
    };

    componentDidMount(){
        $(window).resize(this.handleResize);
        $(window).trigger('resize');
    }
    renderStopIcon(stop){
        let iconClass = ["timeline_icon"];
        if(stop.hasLoadingOperation){
            iconClass.push("timeline_icon_danger");
        }
        if(stop.hasUnloadingOperation){
            iconClass.push("timeline_icon_primary");
        }
        if (stop.locationType == "Customer") {
            return <div className={iconClass.join(" ")}><i className="material-icons">place</i></div>;
        } else if (stop.locationType == "Warehouse") {
            return <div className="timeline_icon timeline_icon_success"><i className="material-icons">home</i></div>;
        } else if (stop.locationType == "Trailer") {
            return <div className="timeline_icon timeline_icon_warning"><i className="material-icons">local_shipping</i></div>;
        }
    }
    renderStatus(stop) {
        let status = stop._status;
        let subStatus = stop._subStatus;
        if(!status) {
            status = {};
        }
        if(subStatus) {
            return <span className={"uk-badge uk-badge-" + subStatus.class}>{subStatus.name}</span>
        } else {
            return <span className={"uk-badge uk-badge-" + status.class}>{status.name}</span>
        }
    }

    renderStop(stop){

        return (
        <div className="timeline_item">
            {this.renderStopIcon(stop)}
            <div className="timeline_content">
                {stop.locationName}
            </div>
        </div>
        );
    }

    renderSavePlanButton(){
        return(
            <div id="save_plan" style = {{position: "relative", bottom:"0px", left:"0px", right:"0px", borderTop: "1px solid rgb(224, 224, 224)"}}>
                <div style = {{padding: "12px"}}>
                    <Button label="Save Plan" size="block" style="primary" onclick = {() => this.handleSavePlan()} />
                </div>
            </div>
        );
    }

    render(){
        console.log(this.props.selectedPlan);
        if(!this.props.selectedPlan){
            return null;
        }
        let style = { paddingRight: "8px"};
        if(this.state.contentHeight && this.state.saveButtonHeight){
            style.height = this.state.contentHeight - this.state.saveButtonHeight;
        }
        let stops = [];
        this.props.selectedPlan.trips.forEach(item => {
            stops.push(
                <li key={item.fromTripStop.id} style={{borderWidth: 0}}>
                    {this.renderStop(item.fromTripStop)}
                </li>
            );
        });
        let lastStop = this.props.selectedPlan.trips[this.props.selectedPlan.trips.length-1].toTripStop;
        stops.push(
            <li key={lastStop.id} style={{borderWidth: 0}}>
                {this.renderStop(lastStop)}
            </li>
        );
        return(
            <div>
                <div className="uk-overflow-container" style = {style}>
                    <Grid>
                        <GridCell width="1-1">
                            <PlanSummary selectedPlan = {this.props.selectedPlan}/>
                        </GridCell>
                    </Grid>
                    <div className="timeline" style = {{marginLeft: "-10px", marginTop: "8px"}}>
                        <ul className="uk-sortable md-list">
                            {stops}
                        </ul>
                    </div>
                </div>
                {this.renderSavePlanButton()}
            </div>
        );
    }

}