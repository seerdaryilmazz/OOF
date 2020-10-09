import _ from "lodash";
import React from "react";
import { TranslatingComponent } from 'susam-components/abstract';
import { NumberInput } from 'susam-components/advanced';
import { Checkbox, DropDown, Form, Notify, TextInput } from 'susam-components/basic';
import { CardHeader, Grid, GridCell, Loader } from "susam-components/layout";
import { LocationService, CustomsOfficeService } from '../../../services/LocationService';



export class CustomsGeneralInfo extends TranslatingComponent {

    state = {
        info: {
            active: true
        }
    };

    componentDidMount(){
        this.initializeState(this.props);
        this.initialize();
    }
    componentWillReceiveProps(nextProps){
        this.initializeState(nextProps);
    }
    initialize() {
        LocationService.retrieveCountries().then(response => {
            this.setState({countries: response.data});
        }).catch((error) => {
            Notify.showError(error);
        });
    }
    initializeState(props) {
        if (!props.data) {
            return;
        }
        let state = _.cloneDeep(this.state);
        state.info = _.cloneDeep(props.data);
        this.setState(state);
    }
    updateState(key, value) {
        let info = _.cloneDeep(this.state.info);
        _.set(info, key, value);
        this.setState({info: info});
    }

    next() {
        return new Promise(
            (resolve, reject) => {
                if(!this.form.validate()) {
                    Notify.showError("There are eori problems");
                    reject();
                }
                let info = _.cloneDeep(this.state.info);
                if(!info.customsCode.startsWith(info.country.iso)){
                    Notify.showError(`Customs code should start with '${info.country.iso}'`);
                    reject();
                }
                CustomsOfficeService.validateName(this.state.info).then(response=>{
                    this.props.handleSave && this.props.handleSave(info);
                    resolve(true);
                }).catch(error=>{
                    Notify.showError(error);
                    reject();
                });
            });
    }

    render() {
        if (!this.state.info || !this.state.countries) {
            return <Loader title="Fetching customs office data"/>;
        }

        return (
            <Grid>
                <GridCell width="1-1">
                    <CardHeader title="General Info"/>
                </GridCell>
                <GridCell width="1-1">
                    <Form ref={(c) => this.form = c}>
                        <Grid>
                            <GridCell width="1-2" noMargin={true}>
                                <Grid>
                                    <GridCell width="1-3" noMargin={true}>
                                        <Checkbox label="Set as active"
                                                value={this.state.info.active}
                                                onchange={(value) => this.updateState("active", value)}/>
                                    </GridCell>
                                </Grid>
                            </GridCell>
                            <GridCell width="1-2" noMargin={true} />

                            <GridCell width="1-2">
                                <TextInput label="Name" required={true} uppercase = {true}
                                        value={this.state.info.name}
                                        onchange={(value) => this.updateState("name", value)}/>
                            </GridCell>
                            <GridCell width="1-2" noMargin={true} />

                            <GridCell width="1-2">
                                <TextInput label="Local Name" uppercase = {true}
                                        value={this.state.info.localName}
                                        onchange={(value) => this.updateState("localName", value)}/>
                            </GridCell>
                            <GridCell width="1-2" noMargin={true} />

                            <GridCell width="1-4">
                                <TextInput label="Short Name" required={true} uppercase = {true}
                                        value={this.state.info.shortName}
                                        onchange={(value) => this.updateState("shortName", value)}/>
                            </GridCell>
                            <GridCell width="1-4">
                                <DropDown label="Country" required={true}
                                        options={this.state.countries}
                                        valueField="iso"
                                        value={_.get(this.state, "info.country.iso")}
                                        onchange={(value) => this.updateState("country", value)}/>
                            </GridCell>
                            <GridCell width="1-2" noMargin={true} />

                            <GridCell width="1-4">
                                <TextInput label="Customs Code" required={true} uppercase = {true}
                                        value={this.state.info.customsCode}
                                        onchange={(value) => this.updateState("customsCode", value)}/>
                            </GridCell>
                            <GridCell width="1-8">
                                <div className = "uk-margin-top">
                                <Checkbox label="Free Zone"
                                        value={this.state.info.freeZone}
                                        onchange={(value) => this.updateState("freeZone", value)}/>
                                </div>
                            </GridCell>
                            <GridCell width="1-8">
                                <div className = "uk-margin-top">
                                <Checkbox label="Border Customs"
                                        value={this.state.info.borderCustoms}
                                        onchange={(value) => this.updateState("borderCustoms", value)}/>
                                </div>
                            </GridCell>
                            <GridCell width="1-4" noMargin={true} />
                            <GridCell width="1-4"  >
                                <NumberInput label="External System Code" uppercase = {true}
                                        value={_.get(_.find(this.state.info.externalIds,{externalSystem:'QUADRO'}), 'externalId')}
                                        onchange={(value) => this.updateState("externalIds", value ?[{externalSystem:'QUADRO', externalId: value}]:[])}
                                        maxLength = "3"/>
                            </GridCell>
                        </Grid>
                    </Form>
                </GridCell>
            </Grid>
        );
    }

}