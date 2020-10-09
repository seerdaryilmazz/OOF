import React from 'react';

import {TextInput, TextArea, Checkbox, CheckboxGroup, RadioButton, RadioGroup, Button, DropDown} from '../../components/src/basic';
import {Password, AutoComplete, DateTime, DateTimeRange, Date, DateRange, Chip, Switch, Slider, CurrencyInput, NumericInput, NumericInputWithUnit, Time, TimeRange, DateWithTimeRange} from '../../components/src/advanced';
import {Card, Grid, GridCell} from '../../components/src/layout';


export default class BasicComponentsTest extends React.Component{
    constructor(props){
        super(props);
        this.state = {options:[]};
    };
    
    componentDidMount(){
        this.setState({options:
            [{id:1, name:"Name 1"},{id:2, name:"Name 2"}]
        });
    }

    render() {
        return (
            <div>
                <Card heading="TextInput Component">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-3">
                                    <TextInput label="required" parsley={this.state.parsley} required={true}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <TextInput label="with initial value" parsley={this.state.parsley} value="Value"/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <TextInput label="test3" hideLabel={true} parsley={this.state.parsley} placeholder="no label"/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-2">
                                    <TextInput label="with placeholder" parsley={this.state.parsley}
                                               placeholder="i am a placeholder"/>
                                </GridCell>
                                <GridCell width="1-2">
                                    <TextInput label="not required" parsley={this.state.parsley} required={false}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
                <Card heading="Masked TextInput Components">
                    <Grid>
                        <GridCell width="1-6">
                            <CurrencyInput required = {true} label = "Amount" onchange = {(value) => console.log(value)}/>
                        </GridCell>
                        <GridCell width="1-6">
                            <NumericInput required = {true} label = "Weight" onchange = {(value) => console.log(value)} digits="2" digitsOptional = {false} unit = "kg."/>
                        </GridCell>
                        <GridCell width="1-6">
                            <NumericInput required = {true} label = "Length" onchange = {(value) => console.log(value)} digits="2" digitsOptional = {true} unit = "m."/>
                        </GridCell>
                        <GridCell width="1-6">
                            <NumericInput required = {true} label = "Volume" onchange = {(value) => console.log(value)} digits="4" digitsOptional = {true} unit = "m3."/>
                        </GridCell>
                        <GridCell width="1-6">
                            <NumericInputWithUnit required = {true} label = "Package" onchange = {(value) => console.log(value)} digits="2" digitsOptional = {false}
                                                  units = {[{id:"pcs", name:"pcs"},{id:"packages", name:"packages"}]}/>
                        </GridCell>
                        <GridCell width="1-6">
                            <NumericInputWithUnit required = {true} label = "With value" digits="2" digitsOptional = {false} value = {{unit:"pcs", amount:"1000"}}
                                                  units = {[{id:"pcs", name:"pcs"},{id:"packages", name:"packages"}]}/>
                        </GridCell>
                    </Grid>
                </Card>
                <Card heading="Password Component">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-3">
                                    <Password label="required" required={true}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <Password label="test3" hideLabel={true} placeholder="no label"/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
                <Card heading="TextArea Component">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-3">
                                    <TextArea label="Autosizing" autosize={true}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <TextArea label="No Autosizing" autosize={false}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <TextArea label="custom rows & cols" autosize={false} rows="2" cols="10"/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-3">
                                    <TextArea label="required" required={true} />
                                </GridCell>
                                <GridCell width="1-3">
                                    <TextArea label="with initial value" value="initial value" />
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
                <Card heading="Checkbox Component">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-3">
                                    <Checkbox label="vertical 1" inline={false} checked={true}/>
                                    <Checkbox label="vertical 2" inline={false}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <Checkbox label="horizontal 1" inline={true} checked={true}/>
                                    <Checkbox label="horizontal 2" inline={true}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-2">
                                    <CheckboxGroup valueField="a" labelField="b" options={[{a:true,b:"Name 1"},{a:false,b:"Name 2"}]} name="checkgroup1" inline={true}/>
                                </GridCell>
                                <GridCell width="1-2">
                                    <CheckboxGroup options={[{value:true,name:"Name 1"},{value:false,name:"Name 2"}]} name="checkgroup2" inline={false}/>
                                </GridCell>
                            </Grid>
                        </GridCell>

                    </Grid>
                </Card>
                <Card heading="Radio Component">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-2">
                                    <RadioButton label="vertical 1" inline={false} name="vert" checked={true}/>
                                    <RadioButton label="vertical 2" inline={false} name="vert"/>
                                </GridCell>
                                <GridCell width="1-2">
                                    <RadioButton label="horizontal 1" inline={true} name="hor"/>
                                    <RadioButton label="horizontal 2" inline={true} name="hor" checked={true}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-2">
                                    <RadioGroup valueField="a" labelField="b" options={[{a:"1",b:"Name 1"},{a:"2",b:"Name 2"}]} name="radiogroup1" inline={true} selectedValue="1"/>
                                </GridCell>
                                <GridCell width="1-2">
                                    <RadioGroup options={[{value:"1",name:"Name 1"},{value:"2",name:"Name 2"}]} name="radiogroup2" inline={false} selectedValue="2"/>
                                </GridCell>
                            </Grid>
                        </GridCell>

                    </Grid>
                </Card>
                <Card heading="Button Component">
                    <Grid>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-4">
                                    <Button label="raised button"/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="raised waves button" waves={true}/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="flat button" flat={true}/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="flat waves button" flat={true} waves={true}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-4">
                                    <Button label="primary button" style="primary"/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="primary waves button" waves={true} style="primary"/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="flat primary button" flat={true} style="primary"/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="flat primary waves button" flat={true} waves={true} style="primary"/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-4">
                                    <Button label="danger waves button" waves={true} style="danger"/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="success waves button" waves={true} style="success"/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="warning waves button" waves={true} style="warning"/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="with icon" waves={true} icon="remove"/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-1">
                            <Grid>
                                <GridCell width="1-4">
                                    <Button label="size mini" waves={true} size="mini"/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="size small" waves={true} size="small"/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="size regular" waves={true}/>
                                </GridCell>
                                <GridCell width="1-4">
                                    <Button label="size large" waves={true} size="large"/>
                                </GridCell>
                            </Grid>
                        </GridCell>

                    </Grid>
                </Card>
                <Card heading="Dropdown Component">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-3">
                                    <DropDown label="with key & value fields" valueField="a" labelField="b" options={[{a:"1",b:"Name 1"},{a:"2",b:"Name 2"}]}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <DropDown label="default key & value fields" options={[{id:"1",name:"Name 1"},{id:"2",name:"Name 2"}]} />
                                </GridCell>
                                <GridCell width="1-3">
                                    <DropDown label="custom unselected text" unselectedText="Quick, pick one..." options={[{id:"1",name:"Pick Me"},{id:"2",name:"Pick the other one"}]}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-3">
                                    <DropDown label="with initial value as object" value={{id:"2",name:"Name 2"}} options={[{id:"1",name:"Name 1"},{id:"2",name:"Name 2"}]} multiple/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <DropDown label="with initial value as string" value="2" options={[{id:"1",name:"Name 1"},{id:"2",name:"Name 2"}]}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <DropDown label="required" required={true} options={[{id:"1",name:"Name 1"},{id:"2",name:"Name 2"}]}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-3">
                                    <DropDown label="returns selected value as object" value={{id:"2",name:"Name 2"}} 
                                              options={[{id:"1",name:"Name 1"},{id:"2",name:"Name 2"}]} 
                                                onchange = {(value) => alert(JSON.stringify(value))}/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <DropDown label="dynamic options"
                                              options = {this.state.options}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
                <Card heading="AutoComplete Component">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-3">
                                    <AutoComplete label="array source, with key & value" valueField="a" labelField="b" source={[{a:"1",b:"Name 1"},{a:"2",b:"Name 2"}]}
                                        minLength="1"/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <AutoComplete label="minlength 4" source={[{id:"1",name:"Name 1"},{id:"2",name:"Name 2"}]}
                                                  minLength="4"/>
                                </GridCell>
                                <GridCell width="1-3">
                                    <AutoComplete label="default minlength" source={[{id:"1",name:"Name 1"},{id:"2",name:"Name 2"}]} />
                                </GridCell>

                            </Grid>
                        </GridCell>


                    </Grid>
                </Card>

                <Card heading="Date Picker Component">
                    <Grid>
                        <GridCell width="1-4">
                            <Date label="Select Date" />
                        </GridCell>
                        <GridCell width="1-4">
                            <Date label="with value" value="10/12/2016" onchange = {(value) => console.log(value)}/>
                        </GridCell>
                    </Grid>
                </Card>
                <Card heading="Date Picker Range Component">
                    <Grid>
                        <GridCell width="1-4">
                            <DateRange startDateLabel = "date start" endDateLabel = "date end" onchange = {(value) => console.log(JSON.stringify(value))}/>
                        </GridCell>
                        <GridCell width="1-4">
                            <DateRange startDateLabel = "with value start" endDateLabel = "with value end" value = {{startDate: "10/12/2016", endDate:"24/12/2016"}} />
                        </GridCell>
                    </Grid>
                </Card>
                <Card heading="Time Picker Component">
                    <Grid>
                        <GridCell width="1-4">
                            <Time label="step 10 min." required = {true} step="10"/>
                        </GridCell>
                        <GridCell width="1-4">
                            <Time label="overnight" required = {true} from="19:00" to="09:00"/>
                        </GridCell>
                        <GridCell width="1-4">
                            <Time label="hourly" required = {true} step="60" from="10:00" to="22:00"/>
                        </GridCell>
                        <GridCell width="1-4">
                            <Time label="default value" required = {true} value="15:30" />
                        </GridCell>
                    </Grid>
                </Card>
                <Card heading="Time Picker Range Component">
                    <Grid>
                        <GridCell width="1-4">
                            <TimeRange label="without from & to props" required = {true} step="30"/>
                        </GridCell>

                    </Grid>
                </Card>
                <Card heading="DateTime Picker Component">
                    <Grid>
                        <GridCell width="1-6">
                            <DateTime label="Select Date" />
                        </GridCell>
                        <GridCell width="1-6">
                            <DateTime label="YYYY-MM-DD HH:MM" value="2016-09-17 14:30" format = "YYYY-MM-DD"/>
                        </GridCell>
                        <GridCell width="1-6">
                            <DateTime label="Alert Value" onchange = {(value) => alert(value)}/>
                        </GridCell>
                    </Grid>
                </Card>
                <Card heading="DateTime Picker Range Component">
                    <Grid>
                        <GridCell width="1-3">
                            <DateTimeRange />
                        </GridCell>
                        <GridCell width="1-3">
                            <DateTimeRange value = {{startDateTime: "12/07/2016 12:00", endDateTime: "15/07/2016 17:00"}}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <DateWithTimeRange value = {{date: "12/07/2016", time: {startTime: "12:00", endTime: "16:00"}}}/>
                        </GridCell>

                    </Grid>
                </Card>

                <Card heading="Chips Component">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-1">
                                    <Chip valueField="id" labelField="name" options={[
            {id: 1, name: 'Mercury'},
            {id: 2, name: 'Venus'},
            {id: 3, name: 'Earth'},
            {id: 4, name: 'Mars'}

        ] }/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>

                <Card heading="Switch Component">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>
                                <GridCell width="1-1">
                                    <Switch label="test"/>
                                </GridCell>



                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>
                <Card heading="Slider Component">
                    <Grid>
                        <GridCell width="1-2">
                            <Grid>


                                <GridCell width="1-1">
                                    <Slider label="slider" id ="test" min="0" max="20" data-to="2" from="0" data-type="decimal" from_min="0" from_max="0"
                                    />
                                </GridCell>

                            </Grid>
                        </GridCell>
                    </Grid>
                </Card>

            </div>

        );
    }

}
