import React from "react";
import _ from "lodash";
import uuid from 'uuid';

import {TranslatingComponent} from "../abstract";
import {Card, Grid, GridCell} from "../layout";
import {Notify, Button} from '../basic';
import  {CompanyLocationSearchAutoComplete} from './CompanyLocationSearchAutoComplete';

export class MultipleCompanyLocationSelector extends TranslatingComponent {

    constructor(props){
        super(props);
        this.state = {data: []}
    }

    componentDidMount(){
        this.initialize(this.props);
    }

    componentWillReceiveProps(nextProps){
        this.initialize(nextProps);
    }

    initialize(props) {
        let data = [];
        let company = this.state.value ? this.state.value.company : null;
        let location = this.state.value ? this.state.value.location : null;

        let _company = this.state._company;
        let _location = this.state._location;

        if (props.data) {
           data = _.cloneDeep(props.data);
        }

        if (props.company) {
            if(!_company || _company.id != props.company.id) {
                company = props.company;
                _company = props.company;
            }
        } else if(_company) {
            company = null;
            _company = null;
        }

        if (props.location) {
            if(!_location || _location.id != props.location.id) {
                location = props.location;
                _location = props.location;
            }
        } else if(_location) {
            location = null;
            _location = null;
        }

        data.forEach(d => {
            if(!d._guiKey) {
                d._guiKey = uuid.v4();
            }
        });

        this.setState({
            data: data,
            company: company,
            location: location,
            _company: _company,
            _location: _location,
        });
    }

    handleCompanyLocationAdd() {
        let data = this.state.data;

        let company = this.state.value ? this.state.value.company : null;
        let location = this.state.value ? this.state.value.location : null;

        if(!company) {
           Notify.showError("Company is not selected");
           return;
        }

        if(!location) {
            Notify.showError("Location is not selected");
            return;
        }

        let alreadyExist = false;
        data.forEach( d=> {
            if(d.company.id == company.id && d.location.id == location.id) {
                alreadyExist = true;
            }
        })

        if(alreadyExist) {
            Notify.showError("Company and Location is already selected");
            return;
        }

        let newElem = {};
        newElem._guiKey = uuid.v4();
        newElem.company = company
        newElem.location = location;

        data.push(newElem);

        this.setState({data: data, value: {company: null, location: null}}, () =>  {this.props.onUpdate(data)});
    }

    handleCompanyLocationDelete(item) {
        let data = this.state.data;

        let elemIndex = data.findIndex(e => e._guiKey == item._guiKey);
        if (elemIndex < 0) return false;
        data.splice(elemIndex, 1);

        this.setState({data: data}, () =>  {this.props.onUpdate(data)});
    }

    handleSelectItem(e, item, index){
        e.preventDefault();
        this.setState({value:{company: item.company, location: item.location}});
    }

    renderItemList(item, index){
        return (
            <li key = {item.company.id + item.location.id}>
                <div className="md-list-content">
                    <div className="uk-align-left">
                        <div className="md-list-heading">
                            <a href="#" className="uk-text-break" style={{width: "90%"}}
                               onClick={(e) => this.handleSelectItem(e, item, index)}>{item.company.name}</a>
                        </div>
                        <div className="uk-text-small uk-text-muted uk-text-break" style={{width: "90%"}}>
                            {item.location.name}
                        </div>
                    </div>
                    <div className="uk-align-right">
                        <Button label="delete" flat = {true} style="danger" size="small" waves = {true}
                                onclick = {(e) => this.handleCompanyLocationDelete(item)} />
                    </div>

                </div>
            </li>
        );
    }

    renderList() {
        let list = <div>{super.translate("There are no locations")}</div>;
        if(this.state.data && this.state.data.length > 0){
            list = <ul className="md-list md-list-centered">
                {this.state.data.map((item, index) => this.renderItemList(item, index))}
            </ul>;
        }

        return list;
    }
    render() {

        let companyCellWidth = "1-1";
        let buttonCellWidth = "1-1";

        if(this.props.inline) {
            companyCellWidth = "9-10";
            buttonCellWidth = "1-10";
        }

       return (
           <Grid>
            <GridCell width={companyCellWidth} noMargin={true}>
                <CompanyLocationSearchAutoComplete inline={this.props.inline}
                                                   companyLabel={this.props.companyLabel} locationLabel={this.props.locationLabel}
                                                   value={this.state.value}
                                                   onChange = {value => this.setState({value: value})} />
            </GridCell>
            <GridCell width={buttonCellWidth}>
                <Button label="Add" onclick={() => {this.handleCompanyLocationAdd()}}/>
            </GridCell>
           <GridCell width="1-1" >
               <ul className="md-list">
                   {this.renderList()}
               </ul>
           </GridCell>
        </Grid>
       )
    }
}