import React from "react";
import { TranslatingComponent } from "susam-components/abstract";




export class PlanSearchResults extends TranslatingComponent {

    constructor(props) {
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



    render(){

        return(
            <div>


            </div>

        );

    }

}