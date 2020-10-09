import React from 'react';

import {TextInput, TextArea, Checkbox, CheckboxGroup, RadioButton, RadioGroup, Button, DropDown, Span} from '../../components/src/basic';
import {Section, Card, Grid, GridCell} from '../../components/src/layout';


export default class I18nTest extends React.Component{
    constructor(props){
        super(props);
        this.state = {locale:"en", gender:"male", count:0}
    };

    changeLocale(locale){
        this.section.setLocale(locale);
        this.setState({locale: this.section.getLocale()});
    };
    setGender(value){
        this.setState({locale: this.section.getLocale(), gender:value, count:this.state.count});
    };
    setCount(value){
        this.setState({locale: this.section.getLocale(), count:value, gender: this.state.gender});
    };

    render() {

        return (
            <Section ref={(section) => this.section = section}>
                <Card heading="Change Language">
                    <Grid>
                        <GridCell width="1-1">
                            <RadioGroup valueField="value" labelField="label" onchange={(value) => this.changeLocale(value)}
                                        options={
                                [
                                {value:"en",label:"English"},
                                {value:"tr",label:"Turkish"},
                                {value:"de",label:"German"},
                                {value:"es",label:"Spanish"},
                                {value:"el",label:"Greek"}
                                ]
                                } name="radiogroup1" inline={true} selectedValue={this.state.locale}/>
                        </GridCell>
                    </Grid>
                </Card>

                <Card heading="Translator Component">
                    <Grid>
                        <GridCell width="1-3">
                            <Span label="this is a test"/>
                        </GridCell>
                        <GridCell width="1-3">
                            <Span label="{0} items in {1} orders" labelParams={[3, "transport"]}/>
                        </GridCell>
                        <GridCell width="1-3">
                            <Grid>
                                <GridCell width="1-1">
                                    <RadioGroup
                                        options={[{value:"male",name:"He"},{value:"female",name:"She"}, {value:"they",name:"They"}]}
                                        name="gender" inline={true}
                                        selectedValue={this.state.gender}
                                        onchange={(value) => this.setGender(value)}/>
                                </GridCell>
                                <GridCell width="1-1">
                                    <TextInput
                                        label="count"
                                        value={this.state.count}
                                        onchange={(value) => this.setCount(value)} />
                                </GridCell>
                                <GridCell width="1-1">
                                    <Span label="{0, select, male{He} female{She} other{They}} found {1, plural, =0{no results} one{1 result} other{# results}} in the category"
                                          labelParams={[this.state.gender, this.state.count === "" ? 0 : this.state.count]}/>
                                </GridCell>
                            </Grid>
                        </GridCell>

                    </Grid>
                    <Grid>
                        <GridCell width="1-1">
                            <Button label="raised button"/>
                        </GridCell>
                    </Grid>
                </Card>

            </Section>
        );
    }
}