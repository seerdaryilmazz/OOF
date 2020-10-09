import React from 'react';

import {Form, TextInput, TextArea, Checkbox, CheckboxGroup, RadioButton, RadioGroup, Button, DropDown} from '../../components/src/basic';
import {Password, AutoComplete, DateTime, DateTimeRange, Chip, Switch} from '../../components/src/advanced';
import {Card, Grid, GridCell} from '../../components/src/layout';
import {Wizard, WizardTab} from '../../components/src/layout';

export default class FormsTest extends React.Component{
    constructor(props){
        super(props);
        this.state = {};
    };

    render() {

        return (
            <div>
                <Form>
                    <Card heading="Forms and Validation">
                        <Grid>
                            <GridCell width="1-5">
                                <TextInput required={true} label="required"/>
                            </GridCell>
                            <GridCell width="1-5">
                                <DropDown label="required" required={true} options={[{id:"1",name:"Name 1"},{id:"2",name:"Name 2"}]}/>
                            </GridCell>
                            <GridCell width="1-5">
                                <CheckboxGroup options={[{value:false,name:"Name 1"},{value:false,name:"Name 2"}]}
                                               name="requiredcheck" inline={false} required={true} minRequired="1"/>
                            </GridCell>

                            <GridCell width="1-5">
                                <RadioGroup options={[{value:false,name:"Name 1"},{value:false,name:"Name 2"}]}
                                               name="requiredradio" inline={false} required={true}/>
                            </GridCell>
                            <GridCell width="1-5">
                                <DateTime id="uk_dp_1" label="Select Date" required={true}/>
                            </GridCell>

                            <GridCell width="1-2">
                                <Button label="submit" type="submit"/>
                            </GridCell>
                        </Grid>
                    </Card>
                </Form>
            </div>
        );
    }
}
