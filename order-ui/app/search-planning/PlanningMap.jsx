import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { GoogleMaps } from "../trailer-planning/map/GoogleMaps";




export class PlanningMap extends TranslatingComponent{

    componentDidMount(){
        GoogleMaps.addScripts("initMapPlanning", () => setTimeout(() => {
            this.map = GoogleMaps.createMap("mapPlanning", null, "", false, () => {});
            if(this.props.settings){
                GoogleMaps.renderControlButtons(this.map, this.props.settings, (item) => this.handleControlClick(item));
            }
        }, 500));
    }
    render(){
        return <div id="mapPlanning" style={{width: "100%", height: "100%", position: "relative"}}/>;
    }
}