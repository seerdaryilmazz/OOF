import React from "react";
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Notify, DropDown, Form, Checkbox, Span} from 'susam-components/basic';
import {Card, CardHeader, Grid, GridCell} from 'susam-components/layout';
import {NumericInput} from "susam-components/advanced";
import {LookupService} from '../services';

export class LoadList extends TranslatingComponent {

    static defaultProps = {
        loads: []
    }
    constructor(props) {
        super(props);
        this.state={}
    }

    componentDidMount() {
        this.initializeLookups();
    }

    componentWillReceiveProps(nextProps){
        if(!_.isEqual(this.props.loads, nextProps.loads)){
            this.adjustLoadList(nextProps.loads);

        }
    }

    initializeLookups(){
        axios.all([
            LookupService.getLoadTypes(this.props.serviceArea.code),
            LookupService.getRiskFactors()
        ]).then(axios.spread((loadTypes, riskFactors) => {
            this.setState({riskFactors: riskFactors.data, loadTypes: loadTypes.data}, ()=> this.adjustLoadList(this.props.loads));
        })).catch(error => {
            Notify.showError(error);
        })
    }

    adjustLoadList(currentLoads){
        let loadList = [];
        let state = _.cloneDeep(this.state);
        this.state.loadTypes.forEach(loadType => {
            let load = {type: loadType};
            if(currentLoads){
                currentLoads.every(currentLoad => {
                    if(currentLoad.type.id === loadType.id){
                        load = currentLoad;
                        load.checked = true;
                        return false;
                    }
                    return true;
                });
            }
            loadList.push(load);
        });
        state.loadList = loadList;
        this.setState(state);
    }

    handleEdit(loads) {
        this.props.onEdit(loads);
    }

    handleAddOrRemove(loads) {
        this.props.onAddOrRemove(loads);
    }

    addLoad(load){
        let currentLoads = _.cloneDeep(this.props.loads);
        currentLoads.push(load);
        this.handleAddOrRemove(currentLoads);
    }

    editLoad(load, key, value){

        let loadList = _.cloneDeep(this.state.loadList);
        let selectedLoad =_.find(loadList, (item) => item.type.id == load.type.id);
        selectedLoad[key] = value;
        this.setState({loadList: loadList});

        let currentLoads = _.cloneDeep(this.props.loads);
        if(currentLoads){
            const index = currentLoads.findIndex(currentLoad => currentLoad.type.id === load.type.id);
            if (index !== -1) {
                currentLoads[index][key] = value;
                this.handleEdit(currentLoads)
            }
        }
    }
    removeLoad(load){
        let currentLoads = _.cloneDeep(this.props.loads);
        if(currentLoads){
            const index = currentLoads.findIndex(item => item.type.id === load.type.id);
            if (index !== -1) {
                currentLoads.splice(index, 1);
                this.handleAddOrRemove(currentLoads)
            }
        }
    }

    handleCheckBoxChange(e, load){
        let loadList = _.cloneDeep(this.state.loadList);
        let selectedLoad =_.find(loadList, (item) => item.type.id == load.type.id);
        selectedLoad.checked = e;
        if(selectedLoad.checked){
            this.addLoad(selectedLoad);
        }else{
            this.removeLoad(selectedLoad);
        }
        this.setState({loadList: loadList});
    }

    renderRiskFactorType(load){
        if(this.props.readOnly){
            return (
                <GridCell>
                    <Grid>
                        <GridCell width="1-2">
                            <Span label="Type" value={load.riskFactor}/>
                        </GridCell>
                    </Grid>
                </GridCell>
            );

        }else{
            let riskFactors = this.state.riskFactors.map(riskFactor => {return {id: riskFactor, name: riskFactor}});
            return(
                <GridCell>
                    <Grid>
                        <GridCell width="1-2">
                            <DropDown options={riskFactors} label="Type"
                                      translate={true}
                                      value={load.riskFactor}
                                      onchange = {(riskFactor) => {riskFactor ? this.editLoad(load, "riskFactor", riskFactor.name) : null}}/>
                        </GridCell>
                    </Grid>
                </GridCell>
            );
        }
    }

    renderTemperature(load){
        return(
            <GridCell>
                <Grid>
                    <GridCell width="1-2">
                        <NumericInput label="Min. Degree" required={true} maxLength={"5"}  style={{textAlign: "right"}}
                                              value = {load.minTemperature ? load.minTemperature  : " "}
                                              readOnly={this.props.readOnly} unit = "°C" allowMinus={true}
                                              onchange = {(value) => this.editLoad(load, "minTemperature", value)}/>
                    </GridCell>
                    <GridCell width="1-2">
                        <NumericInput label="Max. Degree" required={true} maxLength={"5"}  style={{textAlign: "right"}}
                                              value = {load.maxTemperature ? load.maxTemperature  : " "}
                                              readOnly={this.props.readOnly} unit = "°C" allowMinus={true}
                                              onchange = {(value) => this.editLoad(load, "maxTemperature", value)}/>
                    </GridCell>
                </Grid>
            </GridCell>
        );
    }



    renderFeature(load){
        if(!load.checked || !load.type.feature){
            return null;
        }

        if(load.type.feature === 'riskFactor'){
            return this.renderRiskFactorType(load);
        }else if(load.type.feature === 'temperature'){
            return this.renderTemperature(load);
        }
    }

    render() {

        let results = [];
        if(this.state.loadList){
            results = this.state.loadList.map(load => {

                return (
                    <GridCell width="1-3" key={load.type.id} noMargin={true}>
                        <Checkbox label={load.type.name} value={load.checked} disabled={this.props.readOnly}
                                  onchange={(e) => {this.handleCheckBoxChange(e, load)}}/>
                        {this.renderFeature(load)}
                    </GridCell>
                );
            })
        }
        return (
            <Form ref = {c => this.form = c}>
                <Card>
                    <CardHeader title="Load Details"/>
                    <Grid>
                        {results}
                    </Grid>
                </Card>
            </Form>
        );
    }
}
