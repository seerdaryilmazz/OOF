import React from "react";
import { TranslatingComponent } from "susam-components/abstract";
import { Card } from "susam-components/layout";
import { SegmentsTable } from './SegmentsTable';



export class TrailerPlanningList extends TranslatingComponent{

    constructor(props){
        super(props);
        this.state = {segments:[]};
    }

    componentDidMount(){
        $(window).resize(() => {
            this.tableHeight = ($(window).height() - 120);
            $('#segmentsTableCell > form > div.uk-overflow-container').height(this.getTableHeight());
        });
        $(window).trigger('resize');
    }

    getTableHeight(){
        return (this.tableHeight) + ("px");
    }

    handleCompress(){
        window.close();
    }

    render(){
        let listSettings = {showCompressButton: true};
        return(
            <Card zeroPadding = {true}>
                <SegmentsTable settings = {listSettings}
                           onCompressList = {() => this.handleCompress()} />
            </Card>
        );
    }
}