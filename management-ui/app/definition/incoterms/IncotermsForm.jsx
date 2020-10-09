import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, CardHeader} from "susam-components/layout";
import {Notify, DropDown, Form, Span, TextInput} from "susam-components/basic";

export class IncotermsForm extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount(){
        this.initialize(this.props);
    }

    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    initialize(props) {
        if (props) {
            this.setState({activePeriod: props.selectedItem.code, activeLabel: props.selectedItem.name});
        }else{
            this.setState({activePeriod: "", activeLabel: ""});
        }
    }

    updateState(key, value){
        this.props.onchange && this.props.onchange(key, value);
    }

    updateCode(value){
        this.props.oncodechange && this.props.oncodechange(value);
    }

    validate(){
        return this.form.validate();
    }

    reset(){
        return this.form.reset();
    }

    render(){
        if(!this.props.selectedItem){
            return null;
        }

        return (
        <div>
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <CardHeader title="Incoterm Definition"/>
                </GridCell>
            </Grid>
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <Form ref = {(form) => this.form = form}>
                        <Grid>
                            <GridCell width="1-3">
                                <TextInput label="Code"
                                           value = {this.props.selectedItem.code}
                                           maxLength="3"
                                           uppercase = {true}
                                           onchange = {(value) => this.updateCode(value)}
                                           required = {true} />
                            </GridCell>
                            <GridCell width="2-3">
                                <TextInput label="Description (Full name)"
                                           value = {this.props.selectedItem.description}
                                           onchange = {(value) => this.updateState("description", value)}
                                           required = {true} />
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
            </Grid>
        </div>

        );
    }
}
