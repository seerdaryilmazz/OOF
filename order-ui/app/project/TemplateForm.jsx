import React from 'react';
import _ from 'lodash';

import {Grid, GridCell, CardHeader} from 'susam-components/layout'
import {TextInput, Button, Form, DropDown} from 'susam-components/basic'
import {TranslatingComponent} from 'susam-components/abstract'
import {CompanySearchAutoComplete} from 'susam-components/oneorder'

export class TemplateForm extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {};
    }
    updateProject(key, value){
        let template = _.cloneDeep(this.props.template);
        template[key] = value;
        this.props.onChange && this.props.onChange(template);
    }
    handleClickSave(){
        if(!this.form.validate()){
            return;
        }
        this.props.onSave && this.props.onSave();
    }

    render(){
        if(!this.props.project){
            return null;
        }
        return(
            <Form ref = {c => this.form = c}>
                <Grid>
                    <GridCell width = "1-3">
                        <TextInput label="Name" value = {this.props.project.name} required = {true}
                                   onchange = {(value) => this.updateProject("name", value)} />
                    </GridCell>
                    <GridCell width = "1-3">
                        <CompanySearchAutoComplete label = "Customer" value = {this.props.project.customer} required = {true}
                                                   onchange = {(value) => this.updateProject("customer", value)} />
                    </GridCell>
                    <GridCell width = "1-3">
                        <div className="uk-grid-margin">
                            <Button label="save project" style="primary" size = "small" onclick = {() => this.handleClickSave()} />
                        </div>
                    </GridCell>
                </Grid>
            </Form>
        );
    }

}