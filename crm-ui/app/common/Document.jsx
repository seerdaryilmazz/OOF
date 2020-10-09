import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell} from "susam-components/layout";
import {TextInput} from 'susam-components/basic';
import {FileInput} from 'susam-components/advanced';

export class Document extends TranslatingComponent{

    static defaultProps = {
        document:{}
    }

    constructor(props) {
        super(props);
        this.state = {};
    }
    
    handleFileChange(value) {
        this.props.onFileChange(value)
    }

    render(){
        if(!this.props.document){
            return null;
        }
        return (
            <Grid >
                <GridCell width="1-1">
                    <TextInput label="Name"
                               placeholder="Select a document below and this field will be automatically filled."
                               disabled={true}
                               value={this.props.document.displayName}
                               required={true}/>
                </GridCell>
                <GridCell width="1-1">
                    <FileInput ref={(c) => this.fileInput = c}
                               name="document"
                               onchange={(input) => this.handleFileChange(input[0])}
                               required={true}/>
                </GridCell>
            </Grid>
        );
    }
}
