import _ from "lodash";
import * as axios from 'axios';
import React from "react";
import uuid from 'uuid';

import {TranslatingComponent} from 'susam-components/abstract';
import {Grid, GridCell, Card, Loader, CardHeader, PageHeader} from "susam-components/layout";
import {TextInput, Button, Notify, DropDown, Form, Checkbox} from "susam-components/basic";

import {SalesPriceService} from '../../services';
import {LineList} from './LineList';
import {LineForm} from './LineForm';

export class LineManagement extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {
        SalesPriceService.getCountries().then(response => {
            this.setState({countries: _.sortBy(response.data, ["name"])});
        }).catch(error => {
            Notify.showError(error);
        });

        this.listLines();
    }

    listLines(){
        SalesPriceService.getLines().then(response => {
            let lines = response.data;
            lines = _.sortBy(lines, ["line.fromCountry.name", "line.toCountry.name"]);
            this.setState({lines: lines});
        }).catch(error => {
            Notify.showError(error);
        });
    }
    updateLineScale(value){
        this.setState({lineScale: value});
    }

    handleAddLtlScale(){

        let lineScale = _.cloneDeep(this.state.lineScale);
        let ltlScales = lineScale.ltlScales;
        let lastLtlScale = _.last(ltlScales);
        let newLtlScale;

        if (lastLtlScale) {
            newLtlScale = this.createEmptyLtlScale(lastLtlScale.maximum);
        } else {
            newLtlScale = this.createEmptyLtlScale(0);
        }

        ltlScales.push(newLtlScale);

        this.setState({lineScale: lineScale});
    }

    findPrevLtlScale(lineScale, scale){
        let index = _.findIndex(lineScale.ltlScales, {_key: scale._key});
        if(index > 0){
            return lineScale.ltlScales[index-1];
        }
        return null;
    }

    findNextLtlScale(lineScale, scale){
        let index = _.findIndex(lineScale.ltlScales, {_key: scale._key});
        if(index < lineScale.ltlScales.length-1){
            return lineScale.ltlScales[index+1];
        }
        return null;
    }

    handleRemoveLtlScale(scale){
        if(this.state.priceTablesForLine > 0){
            UIkit.modal.confirm("There are price tables using this scale, these price tables will be affected, Are you sure?",
                () => this.removeLtlScale(scale)
            );
        }else{
            this.removeLtlScale(scale);
        }
    }

    removeLtlScale(scale){

        let lineScale = _.cloneDeep(this.state.lineScale);
        let prevLtlScale = this.findPrevLtlScale(lineScale, scale);
        let nextLtlScale = this.findNextLtlScale(lineScale, scale);

        if (prevLtlScale && nextLtlScale) {
            nextLtlScale.minimum = prevLtlScale.maximum;
        } else if (!prevLtlScale && nextLtlScale) {
            nextLtlScale.minimum = 0;
        }
        _.remove(lineScale.ltlScales, {_key: scale._key});

        if (lineScale.ltlScales.length == 0) {
            lineScale.ltlScales.push(this.createEmptyLtlScale(0));
        }

        this.setState({lineScale: lineScale});
    }

    updateState(key, value){
        let state = _.cloneDeep(this.state);
        state[key] = value;
        this.setState(state);
    }

    handleLineAddClick(){
        if(!(this.state.fromCountry && this.state.toCountry)){
            Notify.showError("Please select a from/to countries from list");
            return;
        }
        let line = {
            fromCountry: this.state.fromCountry,
            toCountry: this.state.toCountry
        };
        SalesPriceService.saveLine(line).then(response => {
            Notify.showSuccess("Line saved");
            this.listLines();
        }).catch(error => {
            Notify.showError(error);
        })
    }

    createEmptyLtlScale(minimum){
        return {
            _key: uuid.v4(),
            type: {
                id: "LTL",
                code: "LTL",
                name: "LTL"
            },
            minimum: minimum,
            maximum: null
        };
    }

    getPriceTablesForLine(line){
        SalesPriceService.findPriceTablesForLine(line.id).then(response => {
            this.setState({priceTablesForLine: response.data.length});
        }).catch(error => {
            Notify.showError(error);
        });
    }

    scrollToTop() {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }

    handleEditScales(item) {

        SalesPriceService.getLineScales(item.id).then(response => {

            let lineScale = response.data;

            let scalesGroupedByType;

            if (_.isEmpty(lineScale.scales)) {
                scalesGroupedByType = {};
            } else {
                lineScale.scales.forEach(item => item._key = uuid.v4());
                scalesGroupedByType = _.groupBy(lineScale.scales, "type.code");
            }

            let ltlScales = _.get(scalesGroupedByType, "LTL");
            if (_.isEmpty(ltlScales)) {
                ltlScales = [this.createEmptyLtlScale(0)];
            } else {
                ltlScales = _.sortBy(ltlScales, ["minimum"]);
            }

            let ftlScales = _.get(scalesGroupedByType, "FTL");

            // Scale'leri tipe göre dağıttık, kaydederken tekrar topluyoruz.
            lineScale.ltlScales = ltlScales;
            lineScale.ftlScales = ftlScales;
            lineScale.scales = null;

            this.setState({lineScale: lineScale}, () => this.getPriceTablesForLine(item));

            this.scrollToTop();

        }).catch(error => {
            Notify.showError(error);
        });
    }

    deleteLine(item){
        SalesPriceService.deleteLine(item.id).then(response => {
            Notify.showSuccess("Line deleted");
            this.listLines();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleSaveScaleClick(){

        let lineScale = _.cloneDeep(this.state.lineScale);

        lineScale.scales = [];

        // Başta scale'leri tipe göre dağıtmıştık, kaydederken tekrar topluyoruz.

        if (!_.isEmpty(lineScale.ltlScales)) {
            lineScale.ltlScales.forEach((scale) => {
                lineScale.scales.push(scale);
            });
        }

        if (!_.isEmpty(lineScale.ftlScales)) {
            lineScale.ftlScales.forEach((scale) => {
                lineScale.scales.push(scale);
            });
        }

        SalesPriceService.saveLineScales(lineScale.line.id, lineScale).then(response => {
            Notify.showSuccess("Line scales saved");
            this.listLines();
        }).catch(error => {
            Notify.showError(error);
        });
    }
    render(){
        return(
            <div>
                <PageHeader title="Line Management" />
                <Card>
                    <Grid divider = {true}>
                        <GridCell width="1-2" noMargin = {true}>
                            <Grid>
                                <GridCell width="2-5">
                                    <DropDown label="From Country" options = {this.state.countries}
                                              value = {this.state.fromCountry}
                                              onchange = {(item) => this.updateState("fromCountry", item)} />
                                </GridCell>
                                <GridCell width="2-5">
                                    <DropDown label="To Country" options = {this.state.countries}
                                              value = {this.state.toCountry}
                                              onchange = {(item) => this.updateState("toCountry", item)} />
                                </GridCell>
                                <GridCell width="1-5">
                                    <div className="uk-margin-top">
                                        <Button label="add" size="small" style="success" onclick = {() => {this.handleLineAddClick()}} />
                                    </div>
                                </GridCell>
                                <GridCell width="1-1">
                                    <LineList lines = {this.state.lines}
                                              onEdit = {(region) => this.handleEditScales(region)}/>
                                </GridCell>
                            </Grid>
                        </GridCell>
                        <GridCell width="1-2" noMargin = {true}>
                            <LineForm lineScale = {this.state.lineScale}
                                      priceTablesForLine = {this.state.priceTablesForLine}
                                      onChange = {(value) => this.updateLineScale(value)}
                                      onAddLtlScale = {() => this.handleAddLtlScale()}
                                      onRemoveLtlScale = {(scale) => this.handleRemoveLtlScale(scale)}
                                      onSave = {() => this.handleSaveScaleClick()}/>
                        </GridCell>
                    </Grid>
                </Card>
            </div>
        );
    }

}