import _ from "lodash";
import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { PlanningMap } from './PlanningMap';
import { SegmentsTable } from './SegmentsTable';



export class PlanningSegments extends TranslatingComponent{
    constructor(props){
        super(props);
        this.state = {mode: "BOTH"};
    }

    componentDidMount(){
        $(window).resize(() => {
            this.contentHeight = window.innerHeight - $("#header_main").height();
            $('#mapContainer').height(this.getMapHeight() + "px");
            $('#segmentsTableCell > form > div.uk-overflow-container').height(this.getTableHeight() + "px");
        });
        $(window).trigger('resize');
    }



    handleExpandMap(){
        this.mapWindow = window.open('/ui/order/trailer-planning-map', 'MAP VIEW', 'height=' + screen.height + ',width=' + screen.width + ',menubar=no,location=no,resizable=no,scrollbars=no,status=no,left=0,top=0');
        $(this.mapWindow).on("beforeunload", () => {
            this.handleCompressMap();
        });
        this.mapWindowOpen = true;
        this.setState({mode: "LIST"}, () => $(window).trigger('resize'));
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
    handleExpandList(){
        this.listWindow = window.open('/ui/order/trailer-planning-list', 'LIST VIEW', 'height=' + screen.height + ',width=' + screen.width + ',menubar=no,location=no,resizable=no,scrollbars=no,status=no,left=0,top=0');
        $(this.listWindow).on("beforeunload", () => {
            this.handleCompressList();
        });
        this.listWindowOpen = true;
        this.setState({mode: "MAP"}, () => $(window).trigger('resize'));
    }
    handleNarrowMap(){
        this.setState({mode: "BOTH"}, () => $(window).trigger('resize'));
    }
    handleCompressList(){
        this.listWindow.close();
        this.listWindowOpen = false;
        this.setState({mode: "BOTH"}, () => $(window).trigger('resize'));
    }
    handleCompressMap(){
        this.mapWindow.close();
        this.mapWindowOpen = false;
        this.setState({mode: "BOTH"}, () => $(window).trigger('resize'));
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

    render(){
        let style = {};
        style.borderLeft = "1px solid rgb(224,224,224)";
        style.borderRight = "1px solid rgb(224,224,224)";
        style.height = this.getMapHeight() + "px";
        style.display = this.state.mode == "LIST" ? "none" : "block";

        let mapSettings = {
            showCompressButton: false,
            showExpandButton: !this.listWindowOpen,
            showNarrowButton: !this.listWindowOpen && this.state.mode == "MAP"
        };

        let listSettings = {
            showCompressButton: false,
            showExpandButton: !this.mapWindowOpen,
            showEnlargeButton: !this.mapWindowOpen && this.state.mode != "LIST",
            showNarrowButton: !this.mapWindowOpen && this.state.mode != "MAP"
        };
        return(
            <div>
                <div id="mapContainer" style = {style}>
                    <PlanningMap settings = {mapSettings}
                                 onExpand = {() => this.handleExpandMap()}
                                 onNarrow = {() => this.handleNarrowMap()}/>
                </div>
                <div style = {{border: "1px solid rgb(224,224,224)"}}>
                    <SegmentsTable settings = {listSettings}
                                   hide = {this.state.mode == "MAP"}
                                   onEnlargeList = {() => this.handleEnlargeList()}
                                   onNarrowList = {() => this.handleNarrowList()}
                                   onExpandList = {() => this.handleExpandList()} />
                </div>
            </div>
        );
    }
}
