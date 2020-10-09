import React from "react";
import * as axios from 'axios';
import {TranslatingComponent} from 'susam-components/abstract';
import { Button, Form, Notify, ReadOnlyDropDown, Span, DropDown } from 'susam-components/basic';
import {GridCell, Grid, CardHeader, Card, Pagination} from "susam-components/layout";
import * as DataTable from 'susam-components/datatable';
import {CrmAccountService, LookupService} from "../services";
import _ from "lodash";
import {SearchUtils} from "susam-components/utils/SearchUtils";
import {SpotQuotePdfSettings} from "../spotQuotePdfSetting/SpotQuotePdfSettings";

export class CRInformation extends TranslatingComponent {
    constructor(props) {
        super(props);
        this.state = {
            pageNumber:1,
            pageSize: 6,
            searchParams:{},
            CRList:[]
        };
    }

    componentDidMount(){
        axios.all([
            CrmAccountService.getCompanyCrInfo(this.props.companyId),
            LookupService.getServiceAreas()
        ]).then(axios.spread((crInfos, serviceAreas)=>{
            crInfos.data.forEach(crInfo=>{
                for (let key in crInfo){
                    if(key=="workArea"){
                        let arr = [];
                        crInfo.workArea.forEach(workArea => {
                            arr.push({name:workArea, code:workArea})
                        });
                        crInfo.workArea=arr;
                    }else {
                        crInfo[key]={
                            name:crInfo[key],
                            code:crInfo[key]
                        }
                    }
                }
            });
            this.setState({CRList: crInfos.data, serviceAreas:serviceAreas.data})

        })).catch(e=>{
            console.log(e);
            Notify.showError(e);
        });
    }

    initializeLookups(){
        axios.all([
            LookupService.getServiceAreas()
        ]).then(axios.spread((serviceAreas)=>{
            this.setState({serviceAreas:serviceAreas.data})
        })).catch(e=>{
            console.log(e);
            Notify.showError(e);
        })
    }

    calculatePageNumber(list=this.state.CRList) {
        let arr = list || [];
        for(let key in this.state.searchParams) {
            if(key=="workArea"){
                arr = _.filter(arr, i=>{
                    return _.find(i.workArea, {'code': _.get(this.state.searchParams[key], 'code')});
                })
            }else {
                arr = new SearchUtils([`${key}.name`]).translator(this.context.translator).search(_.get(this.state.searchParams[key], 'name'), arr);
            }
        }
        let {pageNumber, pageSize} = this.state;
        let paging = {
            totalElements: arr.length
        };
        paging.content = _.slice(arr,(pageNumber-1)*pageSize, pageNumber*pageSize );
        paging.pageCount = Math.floor(paging.totalElements / pageSize) + ((paging.totalElements % pageSize) > 0 ? 1 : 0);
        return paging;
    }

    renderDataTable(){
        let paging = this.calculatePageNumber(this.state.CRList);
        return (
            <Grid>
                <GridCell width="1-1">
                    <DataTable.Table data={paging.content}>
                        <DataTable.Text field="displayName.name" header="Name" width="20" />
                        <DataTable.Text field="email.name" header="E-mail" width="10" />
                        <DataTable.Text field="phone.name" header="Phone" width="10" />
                        <DataTable.Text field="workArea" header="Service Area" width="30" printer={new ServiceAreaNamePrinter(this.state.serviceAreas, this)} />
                        <DataTable.Text field="location.name" header="Location" width="30" printer={new LocationPrinter()} />
                    </DataTable.Table>
                </GridCell>
                <GridCell width="1-1" noMargin={true}>
                    <Pagination totalElements={paging.totalElements}
                                totalPages={paging.pageCount}
                                page={this.state.pageNumber}
                                range={this.state.pageSize}
                                onPageChange={(pageNumber) => this.setState({pageNumber: pageNumber})}/>
                </GridCell>
            </Grid>
        )
    }

    render() {
        return (
            <div>
                <Grid>
                    <GridCell width="1-1">
                        <CardHeader title="Customer Service Representative Information"/>
                    </GridCell>
                    <GridCell>
                        <SearchPanel list={this.state.CRList} searchParams={this.state.searchParams}
                                     serviceAreas={this.state.serviceAreas}
                                     onChange={searchParams => this.setState({searchParams:searchParams, pageNumber:1})} />
                    </GridCell>
                    <GridCell>
                        {this.renderDataTable()}
                    </GridCell>
                </Grid>
            </div>
        )
    }
}

CRInformation.contextTypes = {
    translator: React.PropTypes.object
};

class ServiceAreaNamePrinter{
    constructor(serviceAreaList, translator){
        this.serviceAreaList=serviceAreaList || [];
        this.translator = translator;
    }

    translate(text){
        return this.translator ? this.translator.translate(text) : text;
    }

    print(data){
        if(data.length>1){
            let display = [];
            data.forEach(serviceArea=>{
                display.push(this.translate(_.get(_.find(this.serviceAreaList, u=>u.code == serviceArea.code),'name')));
            });
            return display.join(", ");
        }else {
            return this.translate(_.get(_.find(this.serviceAreaList, u=>u.code == data[0].code),'name'));
        }
    }
}

class LocationPrinter{

    print(data){
        let parts = data.split("(");
        let string = "("+ parts[1];
        return <span>{parts[0]} <i>{string}</i></span>
    }
}

class SearchPanel extends React.Component {
    constructor(props){
        super(props);
    }

    handleChange(value){
        if(this.props.onChange){
            let searchParams = _.defaultTo(this.props.searchParams, {});
            for(let key in value){
                if (_.isNil(value[key])){
                    _.unset(searchParams, key)
                }else {
                    _.set(searchParams, key, value[key]);
                }
            }
            this.props.onChange(searchParams);
        }
    }

    extractOptions(field, list = _.defaultTo(this.props.list, [])){
        let extractedList = _.reject(list.map(i=>_.get(i, field)), _.isNil);
        return _.sortBy(_.uniqWith(extractedList, (a,b)=>a.name === b.name), 'name');
    }

    extractWorkAreaOptions(list = _.defaultTo(this.props.list, [])){
        let workAreaList = [];
        list.map(i=>_.get(i, "workArea")).forEach(i=> i.forEach(j=> workAreaList.push(j)));
        let extractedList = _.reject(workAreaList, _.isNil);
        let newList = [];
        extractedList.forEach(item=>{
            return newList.push(_.find(this.props.serviceAreas, {'code': item.code}))
        });
        return _.sortBy(_.uniqWith(newList, (a,b)=>a.name === b.name), 'name');
    }

    render(){
        return (
            <Grid collapse={false}>
                <GridCell width="2-10">
                    <DropDown valueField="code" labelField="name"
                              value={_.get(this.props.searchParams, 'displayName')}
                              options={this.extractOptions('displayName')}
                              onchange={value => this.handleChange({displayName: value})} />
                </GridCell>
                <GridCell width="2-10">

                </GridCell>
                <GridCell width="3-10">
                    <DropDown valueField="code" labelField="name"
                              value={_.get(this.props.searchParams, 'workArea')}
                              options={this.extractWorkAreaOptions()}
                              translate={true}
                              onchange={value => this.handleChange({workArea: value})} />
                </GridCell>
                <GridCell width="3-10">
                    <DropDown valueField="code" labelField="name"
                              value={_.get(this.props.searchParams, 'location')}
                              options={this.extractOptions('location')}
                              onchange={value => this.handleChange({location: value})} />
                </GridCell>
            </Grid>
        );
    }
}