import React from 'react';


import {Card, Wizard, WizardTab, Grid, GridCell} from '../../components/src/layout';
import {Button, DropDown, CheckboxGroup, RadioGroup} from '../../components/src/basic';
import {DateTime} from '../../components/src/advanced';
import {TextInput, Form} from '../../components/src/basic';


export default class WizardTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    };

    beforeLoad = (stepNo) =>  {
        alert("Before Loading Step: " + stepNo);
    }

    validateChange = (stepNo) => {
        console.log(JSON.stringify(this.state));
        return this.form1.validate();
    };

    validateForm(result) {


    };

    finished = () => {
       alert("This wizard is Finished");
    }

    render() {
        return (
            <Card>
                <Wizard currentStep={this.props.params.currentStep} currPageUrl="#/wizard"
                        enableTabSwitch={false} onComplete={this.finished} onCompleteHref="#/urltoberedirected">
                    <WizardTab header = "Order 1" onComplete={this.validateChange}>
                        <Form ref={(c) => this.form1 = c}>

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

                            </Grid>

                        </Form>
                    </WizardTab>
                    <WizardTab header = "Order 2" >
                        <span>order 2 span</span>
                    </WizardTab>
                    <WizardTab header = "Order 3" beforeLoad={this.beforeLoad} >
                        <span>order 3 span</span>
                    </WizardTab>
                </Wizard>
            </Card>
        );
    }

    updateState = (base, key, value) => {
        base[key] = value;
        this.setState(this.state);
    };


}
