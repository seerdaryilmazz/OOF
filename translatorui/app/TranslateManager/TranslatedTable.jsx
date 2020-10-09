import React from 'react';
import { Notify } from 'susam-components/basic';
import * as DataTable from 'susam-components/datatable';
import { Pagination } from 'susam-components/layout';
import { TranslatedService } from '../services/TranslatedService';
import { StringUtils } from 'susam-components/utils/StringUtils';
import { TranslateValue } from './TranslateValue';
import { TruncatedFieldPrinter } from './TruncatedFieldPrinter';

export class TranslatedTable extends React.Component {

    state = {
        data: [],
    };

    handleRowUpdate(data) {
        if (!data.value) {
            return;
        }
        TranslatedService.save(data).then(response => {
            let index = _.findIndex(this.state.data.content, i => i.id === response.data.id);
            let cData = _.cloneDeep(this.state.data);
            cData.content[index] = response.data;
            this.setState({ data: cData });
            $(`tbody:eq(0) > tr:eq(${index})`).css('background', '#d9f2d9');
        }).catch(error => Notify.showError(error));
    }

    handleRowCreate(data) {
        _.set(data, 'locale', this.props.locale);
        _.set(data, 'appName', this.props.application.code);
        TranslatedService.save(data).then(response => {
            this.search();
        }).catch(error => Notify.showError(error));
    }

    componentDidMount() {
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

        TranslatedService.search(filter).then(response => {
            this.setState({ data: response.data });
        }).catch(error => Notify.showError(error));
    }

    handleRowDelete(data) {
        TranslatedService.delete(data.id).then(response => {
            this.search();
        }).catch(error => Notify.showError(error));
    }

    render() {
        return (
            <div>
                <DataTable.Table
                    editable={true}
                    deletable={true}
                    ondelete={data => this.handleRowDelete(data)}
                    onupdate={data => this.handleRowUpdate(data)}
                    data={this.state.data && this.state.data.content}
                >
                    <DataTable.Text field="key" width="47%" header="Key" editable={false} printer={new TruncatedFieldPrinter(10)} />
                    <DataTable.Text field="value" width="47%" header="Translation" editable={true} printer={new TruncatedFieldPrinter(10)}>
                        <DataTable.EditWrapper>
                            <TranslateValue toLng={StringUtils.substring(_.get(this.props.locale, 'isoCode'), 0, 2)} />
                        </DataTable.EditWrapper>
                    </DataTable.Text>
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
