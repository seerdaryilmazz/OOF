import React from "react";
import * as axios from "axios";
import _ from "lodash";


import {TranslatingComponent} from 'susam-components/abstract';
import {Notify, ReadOnlyDropDown, Form} from "susam-components/basic";
import {Grid, GridCell} from 'susam-components/layout';
import {LookupService} from '../services';
import {RichTextEditor} from "./RichTextEditor";

export class Note extends TranslatingComponent{

    static defaultProps = {
        note:{}
    }

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount(){
        this.initializeLookups();
    }

    initializeLookups(){
        axios.all([
            LookupService.getNoteTypes()
        ]).then(axios.spread((noteTypes) => {
            noteTypes = noteTypes.data;
            noteTypes=this.arrangeNoteTypes(noteTypes);
            this.setState({noteTypes: noteTypes});
        })).catch(error => {
            console.log(error);
            Notify.showError(error);
        });
    }

    arrangeNoteTypes(noteTypes){
        if(this.props.isSpotQuote===false || this.props.isSpotQuote===undefined){
            if(!_.isEmpty(noteTypes)){
                if(_.find(noteTypes,{code: "SPOT_PDF_NOTE"})){
                    console.log(_.find(noteTypes,{code: "SPOT_PDF_NOTE"}));
                    _.pull(noteTypes,_.find(noteTypes,{code: "SPOT_PDF_NOTE"}));
                    console.log(noteTypes);
                }
            }
        }
        return noteTypes;
    }


    handleChange(key, value){
        let note = _.cloneDeep(this.props.note);
        note[key] = value;
        this.props.onChange(note);
    }

    render(){
        if(!this.props.note){
            return null;
        }

        return (
            <Form ref = {c => this.form = c}>
                <Grid divider={true}>
                    <GridCell width="1-4">
                        <ReadOnlyDropDown options = {this.state.noteTypes} label="Note Type" required={true}
                                          valueField="code"
                                          translate={true}
                                          value = {this.props.note.type} readOnly={this.props.readOnly}
                                          onchange = {(noteType) => this.handleChange("type", noteType)}/>
                    </GridCell>
                    <GridCell width="1-1">
                        <RichTextEditor label="Content"
                                        asHtml={true}
                                        minHeight="200px"
                                        value={this.props.note.content}
                                        readOnly={this.props.readOnly}
                                        onChange={(content) => this.handleChange("content", content)}/>
                    </GridCell>
                </Grid>

            </Form>
        );
    }
}
