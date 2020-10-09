import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Card, Grid, GridCell } from "susam-components/layout";
import { PlanningMap } from './PlanningMap';



export class TrailerPlanningMap extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {};
    }

    componentDidMount(){
        $(window).resize(() => {
            this.mapHeight = ($(window).height() - $("#header_main").height());
            $('#mapContainer').height(this.getMapHeight());
        });
        $(window).trigger('resize');
    }
    getMapHeight(){
        return (this.mapHeight) + ("px");
    }
    handleCompress(){
        window.close();
    }

    render(){
        let style = {};
        style.height = this.getMapHeight();
        let listSize = "1-1";
        let settings = {showCompressButton: true};
        return(
            <Card zeroPadding = {true}>
                <Grid style = {{margin:"0px"}}>
                    <GridCell width={listSize} style = {{padding:"0px"}} noMargin = {true}>
                        <div id="mapContainer" style = {style}>
                            <PlanningMap settings = {settings}
                                         onCompress = {() => this.handleCompress()}/>
                        </div>
                    </GridCell>
                </Grid>
            </Card>
        );
    }
}