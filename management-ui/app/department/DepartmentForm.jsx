import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { Form, TextInput } from "susam-components/basic";
import { CardHeader, Grid, GridCell } from "susam-components/layout";


export class DepartmentForm extends TranslatingComponent {

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
            this.setState({code: props.selectedItem.code, name: props.selectedItem.name});
        }else{
            this.setState({code: "", name: ""});
        }
    }

    updateState(key, value){
        this.props.onchange && this.props.onchange(key, value); 
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
                    <CardHeader title="Department Definition"/>
                </GridCell>
            </Grid>
            <Grid>
                <GridCell width="1-1" noMargin={true}>
                    <Form ref = {(form) => {this.form = form}}>
                        <Grid>
                            <GridCell width="1-2">
                                <TextInput label="Code"
                                           value={this.props.selectedItem.code}
                                           readOnly={this.props.selectedItem.code === 'CUSTOMERSERVICE'}
                                           onchange = {(value) => this.updateState("code", value)}
                                           required={true}
                                           disabled={false}/>
                            </GridCell>

                            <GridCell width="1-2">
                                <TextInput label="Name"
                                           value={this.props.selectedItem.name}
                                           onchange = {(value) => this.updateState("name", value)}
                                           required={true}
                                           disabled={false}/>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
            </Grid>
        </div>

        );
    }
}

