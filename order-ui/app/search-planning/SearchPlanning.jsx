import _ from "lodash";
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Notify } from "susam-components/basic";
import { Card, Grid, GridCell } from "susam-components/layout";
import { TripService } from "../services";
import { PlanDetails } from './PlanDetails';
import { PlanningMap } from './PlanningMap';
import { PlanningTable } from './PlanningTable';





export class SearchPlanning extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {mode: "BOTH"};
    }

    componentDidMount(){
        $(window).resize(() => {
            this.contentHeight = window.innerHeight - $("#header_main").height();
            $('#mapContainer').height(this.getMapHeight() + "px");
            $('#resultsTableCell > form > div.uk-overflow-container').height(this.getTableHeight() + "px");
        });
        $(window).trigger('resize');

        this.loadTripPlans();
    }

    loadTripPlans() {
        TripService.findTripPlans().then(response => {
            this.setState({tripPlans: _.orderBy(response.data.tripPlans, ['code'], ['desc'])})
        }).catch(error => {
            Notify.showError(error);
        });
    }

    componentWillUnmount(){

    }

    getMapHeight(){
        if(this.state.mode == "BOTH"){
            return this.contentHeight / 2;
        }else if(this.state.mode == "MAP"){
            return this.contentHeight;
        }else if(this.state.mode == "LIST"){
            return 0;
        }

    }
    getTableHeight(){
        if(this.state.mode == "BOTH"){
            return (this.contentHeight - this.getMapHeight()) - ($("#groupControls").outerHeight(true) + 2);
        }else if(this.state.mode == "MAP"){
            return 0;
        }else if(this.state.mode == "LIST"){
            return this.contentHeight - ($("#groupControls").outerHeight(true) + 2);
        }
    }

    handleEnlargeList(){
        let mode = _.cloneDeep(this.state.mode);
        if(this.state.mode == "BOTH"){
            mode = "LIST";
        }else if(this.state.mode == "MAP"){
            mode = "BOTH";
        }
        this.setState({mode: mode}, () => $(window).trigger('resize'));
    }
    handleNarrowList(){
        let mode = _.cloneDeep(this.state.mode);
        if(this.state.mode == "BOTH"){
            mode = "MAP";
        }else if(this.state.mode == "LIST"){
            mode = "BOTH";
        }
        this.setState({mode: mode}, () => $(window).trigger('resize'));
    }
    handleNarrowMap(){
        this.setState({mode: "BOTH"}, () => $(window).trigger('resize'));
    }

    handleSelectPlan(plan){
        this.setState({selectedPlan: plan});
    }

    render(){
        let style = {};
        style.borderLeft = "1px solid rgb(224,224,224)";
        style.borderRight = "1px solid rgb(224,224,224)";
        style.height = this.getMapHeight() + "px";
        style.display = this.state.mode == "LIST" ? "none" : "block";

        let mapSettings = {
            showCompressButton: false,
            showExpandButton: false,
            showNarrowButton: this.state.mode == "MAP"
        };
        let listSettings = {
            showCompressButton: false,
            showExpandButton: false,
            showEnlargeButton: this.state.mode != "LIST",
            showNarrowButton: this.state.mode != "MAP"
        };
        return(
            <Card zeroPadding = {true}>
                <Grid style = {{margin:"0px"}} smallGutter = {true}>
                    <GridCell width="7-10" style = {{padding:"0px"}} noMargin = {true}>
                        <div id="mapContainer" style = {style}>
                            <PlanningMap settings = {mapSettings}
                                         selectedPlan = {this.state.selectedPlan}
                                         onNarrow = {() => this.handleNarrowMap()}/>
                        </div>
                        <div style = {{border: "1px solid rgb(224,224,224)"}}>
                            <PlanningTable plans = {this.state.tripPlans}
                                           selectedPlan = {this.state.selectedPlan}
                                           onSelect = {(plan) => this.handleSelectPlan(plan)}
                                           settings = {listSettings}
                                           hide = {this.state.mode == "MAP"}
                                           onEnlargeList = {() => this.handleEnlargeList()}
                                           onNarrowList = {() => this.handleNarrowList()}/>
                        </div>
                    </GridCell>
                    <GridCell width="3-10">
                        <PlanDetails selectedPlan = {this.state.selectedPlan}/>
                    </GridCell>
                </Grid>
            </Card>


        );
    }
}
SearchPlanning.contextTypes = {
    storage: React.PropTypes.object
};