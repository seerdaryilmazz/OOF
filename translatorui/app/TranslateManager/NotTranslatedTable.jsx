import React from 'react';
import { Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Pagination } from 'susam-components/layout';
import uuid from 'uuid';
import { NotTranslatedService } from '../services/NotTranslatedService';
import { TranslatedService } from '../services/TranslatedService';
import { StringUtils } from 'susam-components/utils/StringUtils';
import { TranslateColumn } from './TranslateColumn';
import { TruncatedFieldPrinter } from './TruncatedFieldPrinter';

export class NotTranslatedTable extends React.Component {

    state = {
        data: [],
    };

    componentDidMount() {
        this.datatableId = uuid.v4();
        this.search();
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps.application, this.props.application) || !_.isEqual(nextProps.locale, this.props.locale) || !_.isEqual(nextProps.filter, this.props.filter)) {
            this.setState({ page: 0 }, () => this.search(nextProps));
        }
    }

    search(props = this.props) {
        if (_.isEmpty(props.application) || _.isEmpty(props.locale)) {
            return;
        }

        let filter = {
            application: props.application.code,
            locale: props.locale.isoCode,
            keyLike: props.filter,
            page: this.state.page,
            pageSize: props.pageSize
        }

        NotTranslatedService.search(filter).then(response => {
            this.setState({ data: response.data });
        }).catch(error => Notify.showError(error));
    }

    handleRowCreate(data) {
        _.set(data, 'locale', this.props.locale);
        _.set(data, 'appName', this.props.application.code);
        TranslatedService.save(data).then(response => {
            this.search();
        }).catch(error => Notify.showError(error));
    }

    handleRowSaveClick(data) {
        if (_.isEmpty(data.value)) {
            return;
        }
        let translate = _.cloneDeep(data);
        _.set(translate, 'id', data.translateId);
        _.set(translate, 'appName', this.props.application.code);
        TranslatedService.save(translate).then(response => {

            let index = _.findIndex(this.state.data.content, i => i.id === data.id);
            let cData = _.cloneDeep(this.state.data);
            _.set(translate, 'translateId', response.data.id);
            cData.content[index] = translate;
            this.setState({ data: cData });
            console.log("index", index);
            $(`tbody:eq(0) > tr:eq(${index})`).css('background', '#d9f2d9');
        });
    }

    handleRowDelete(data) {
        NotTranslatedService.delete(data.id).then(response => {
            this.search();
        }).catch(error => Notify.showError(error));
    }

    render() {
        return (
            <div>
                <DataTable.Table
                    id={this.datatableId}
                    deletable={true}
                    ondelete={data => this.handleRowDelete(data)}
                    data={this.state.data && this.state.data.content}
                >
                    <DataTable.Text field="sourceAppNames" width="5" header="Source" center={true} printer={new SourceFieldPrinter()} editable={false} />
                    <DataTable.Text field="key" width="45%" header="Key" printer={new TruncatedFieldPrinter(10)} />
                    <TranslateColumn field="value" width="45" header="Translation" tLng={StringUtils.substring(_.get(this.props.locale, 'isoCode')).substring(0, 2)} />
                    <DataTable.ActionColumn width="5">
                        <DataTable.ActionWrapper track="onClick" onaction={row => this.handleRowSaveClick(row)}>
                            <a href="javascript:;"><i className="md-icon uk-icon-save" /></a>
                        </DataTable.ActionWrapper>
                    </DataTable.ActionColumn>
                </DataTable.Table>
                <Pagination
                    range={10}
                    page={this.state.data.number + 1}
                    totalElements={this.state.data.totalElements}
                    totalPages={this.state.data.totalPages}
                    onPageChange={page => this.setState({ page: page - 1 }, () => this.search())}
                />
            </div>
        );
    }
}

class SourceFieldPrinter {
    constructor() {
    }

    print(value) {
        let sources = "";
        value && value.forEach(source => {
            sources = sources + source + "<br />";
        })
        return <i className="material-icons" style={{cursor: "default"}} data-uk-tooltip="{pos:'bottom'}" title={sources}>input</i>
    }
}