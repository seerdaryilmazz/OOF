import React from "react";
import PropTypes from "prop-types";
import {TranslatingComponent} from 'susam-components/abstract';
import { Grid, GridCell, LoaderWrapper} from 'susam-components/layout';
import { TextInput, TextArea, Form, Button, Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Date as DatePicker } from "susam-components/advanced";
import {DateTimeUtils} from "../utils/DateTimeUtils";
import {HistoryService} from "../services";


export class ExtendModal extends TranslatingComponent{
    constructor(props) {
        super(props);
        this.state = {
            newValidityEndDate: ""
        };
    }

    componentDidMount(){
        this.retrieveEndDateHistory();
    }

    retrieveEndDateHistory(){
        let params = {id: this.props.agreement.id, type: 'agreement-extension'};
        HistoryService.retrieveChanges(params).then(response=>{
            this.setState({validityEndDates: response.data});
        }).catch(response=>{});

    }

    updateState(value){
        this.setState({newValidityEndDate : value});
    }

    validate(){
        if(this.form.validate()){
            if(DateTimeUtils.translateToDateObject(this.setDayOfDate(this.props.endDate, 1), "/") > DateTimeUtils.translateToDateObject(this.state.newValidityEndDate, ("/"))){
                Notify.showError("New end date must be later than current end date!");
                return false;
            }
            return true;
        }
        return false;
    }

    setDayOfDate(date,valueToBeAdded){
        // Gelen tarihin ay kısmını, new Date() fonksiyonuyla oluşturulan tarihte bir fazla gösterdiği için
        //o fazlalık çıkarıldı ==> parts[1]-1
        let parts = date.split("/");
        return moment(new Date(parts[2], parts[1] - 1, parts[0])).add(+valueToBeAdded, 'days').format('DD/MM/YYYY');
    }

    onSave(){
        if(this.validate()){
            this.props.onSave && this.props.onSave(this.state.newValidityEndDate);
            this.setState({newValidityEndDate : "", busy: true});
        }
    }

    renderDataTable(){
        return (
            <Grid divider = {true}>
                <GridCell width="1-1" margin="small">
                    <DataTable.Table data={this.state.validityEndDates}>
                        <DataTable.Text header="Changed By" field="changedBy"/>
                        <DataTable.DateTime header="Change Time" field="changeTime"/>
                        <DataTable.Text header="Old Validity End Date" field="changeObject.oldEndDate"/>
                        <DataTable.Text header="New Validity End Date" field="changeObject.newEndDate"/>
                    </DataTable.Table>
                </GridCell>
            </Grid>
        )
    }
    
    render(){
        return (
            <div>
                <Form ref = {c => this.form = c}>
                    <Grid>
                        <GridCell width="2-6" noMargin={true}>
                            <DatePicker label="New Validity End Date" hideIcon={false}
                                  value={this.state.newValidityEndDate}
                                  required={true}
                                  onchange={(value) => this.updateState(value)} />
                        </GridCell>
                        <GridCell width="2-6" noMargin={true}>
                            <div className="uk-text-left">
                                <Button label= "SAVE" waves = {true} style = "success" onclick = {() => this.onSave()}/>
                            </div>
                        </GridCell>
                    </Grid>
                </Form>
                <LoaderWrapper busy = {this.state.busy} title="" size = "S">
                    {this.renderDataTable()}
                </LoaderWrapper>
            </div>
        );
    }
}