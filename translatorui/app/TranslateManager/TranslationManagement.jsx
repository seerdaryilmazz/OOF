import * as axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Button, DropDown, Notify, TextInput } from 'susam-components/basic';
import { RadioGroup } from 'susam-components/basic/RadioGroup';
import { Grid, GridCell, Modal, Page } from 'susam-components/layout';
import { StringUtils } from 'susam-components/utils/StringUtils';
import { TranslatedService } from '../services/TranslatedService';
import { ApplicationService, LocaleService, TranslatorService } from '../services/TranslatorService';
import { Application } from './Application';
import { Locale } from './Locale';
import { NotTranslatedTable } from './NotTranslatedTable';
import { TranslatedTable } from './TranslatedTable';
import { TranslateModalContent } from './TranslateModalContent';
export class TranslationManagement extends TranslatingComponent {

    state = {
        pageSize: 20,
        translationView: { id: 'NOT_TRANSLATED', code: 'NOT_TRANSLATED' },
        application: { code: 'common' },
        options: {
            translationViews: []
        },
        newTranslation: {}
    };

    componentDidMount() {
        this.initilize();
    }

    initilize() {
        axios.all([
            LocaleService.listByStatus('ACTIVE'),
            ApplicationService.listAll(),
            TranslatorService.getTranslationViews()
        ]).then(axios.spread((locale, application, translationView) => {
            this.setState({
                showModalContent: false,
                options: {
                    locale: locale.data,
                    applications: application.data,
                    translationViews: translationView.data
                }
            });
        }));
    }

    renderTranslateTable(translationView) {
        if (_.isEmpty(this.state.application) || _.isEmpty(this.state.locale)) {
            return null;
        }
        if ('TRANSLATED' === _.get(translationView, 'id')) {
            return <TranslatedTable application={this.state.application} locale={this.state.locale} filter={this.state.filter} pageSize={this.state.pageSize} />
        } else if ('NOT_TRANSLATED' === _.get(translationView, 'id')) {
            return <NotTranslatedTable application={this.state.application} locale={this.state.locale} filter={this.state.filter} pageSize={this.state.pageSize} />
        } else {
            return null;
        }
    }

    modalOpen(modal) {
        this.setState({
            showModalContent: true
        }, () => modal.open());
    }

    modalClose(modal) {
        this.setState({
            showModalContent: false
        }, () => modal.close());
    }

    saveTranslation() {
        if(!this.translateModalContent.validate()){
            return;
        }
        let filter = {
            application: this.state.application.code,
            locale: this.state.locale.isoCode,
            keyEqual: this.state.newTranslation.key
        }
        TranslatedService.search(filter).then(response => {
            if (0 < response.data.totalElements) {
                Notify.confirm("Translation already exist. If you confirm, it will be updated.", () => {
                    let existed = _.first(response.data.content);
                    _.set(existed, 'value', this.state.newTranslation.value);
                    TranslatedService.save(existed).then(response => {
                        Notify.showSuccess("Translation updated");
                        this.setState({ newTranslation: {} }, () => this.modalClose(this.newTranslationModal));
                    }).catch(error => Notify.showError(error));
                })
            } else {
                let newTranslation = _.cloneDeepWith(this.state.newTranslation);
                _.set(newTranslation, 'appName', this.state.application.code);
                _.set(newTranslation, 'locale', this.state.locale);
                TranslatedService.save(newTranslation).then(response => {
                    Notify.showSuccess("Translation saved");
                    this.setState({ newTranslation: {} }, () => this.modalClose(this.newTranslationModal));
                }).catch(error => Notify.showError(error));
            }
        })
    }

    updateNewTranslation(key, value) {
        let newTranslation = _.cloneDeep(this.state.newTranslation);
        _.set(newTranslation, key, value);
        this.setState({ newTranslation: newTranslation });
    }

    render() {
        return (
            <Page title="Translation">
                <Grid>
                    <GridCell width="1-5">
                        <DropDown
                            options={this.state.options.locale}
                            label='Language'
                            valueField="isoCode"
                            value={this.state.locale}
                            onchange={locale => this.setState({ locale: locale })}
                        />
                    </GridCell>
                    <GridCell width="3-5" />
                    <GridCell width="1-5" style={{ textAlign: "right" }}>
                        <Button label="supported locales" fullWidth={true} onclick={() => this.modalOpen(this.localeModal)} />
                    </GridCell>
                    <GridCell width="1-5">
                        <DropDown
                            options={this.state.options.applications}
                            label='UI'
                            valueField="code"
                            value={this.state.application}
                            onchange={application => this.setState({ application: application })}
                        />
                    </GridCell>
                    <GridCell width="4-5" style={{ marginTop: "24px" }}>
                        <RadioGroup
                            inline={true}
                            options={this.state.options.translationViews}
                            value={this.state.translationView}
                            onchange={translationView => this.setState({ translationView: translationView })}
                        />
                    </GridCell>
                    <GridCell width="4-5">
                        <TextInput value={this.state.filter} onchange={value => this.setState({ filter: _.toLower(value) })} label="Key Filter" />
                    </GridCell>
                    <GridCell width="1-5" style={{ textAlign: "right" }}>
                        {(this.state.application && this.state.locale) && <Button label="new translation" fullWidth={true} style="primary" onclick={() => this.modalOpen(this.newTranslationModal)} />}
                    </GridCell>
                    <GridCell>
                        {this.renderTranslateTable(this.state.translationView)}
                    </GridCell>
                </Grid>
                <Modal
                    ref={c => this.applicationModal = c}
                    onclose={() => this.setState({ showModalContent: false })}
                    medium={true}
                    onclose={() => this.initilize()}
                    actions={[
                        { label: "close", action: () => this.modalClose(this.applicationModal) }
                    ]}
                >
                    {this.state.showModalContent && <Application />}
                </Modal>
                <Modal
                    ref={c => this.localeModal = c}
                    onclose={() => this.setState({ showModalContent: false })}
                    medium={true}
                    onclose={() => this.initilize()}
                    actions={[
                        { label: "close", action: () => this.modalClose(this.localeModal) }
                    ]}
                >
                    {this.state.showModalContent && <Locale />}
                </Modal>
                <Modal
                    ref={c => this.newTranslationModal = c}
                    onclose={() => this.setState({ showModalContent: false, newTranslation: {} })}
                    medium={true}
                    actions={[
                        { label: "cancel", action: () => this.modalClose(this.newTranslationModal) },
                        { label: "save", action: () => this.saveTranslation(), buttonStyle:"primary" }
                    ]}>
                    {this.state.showModalContent && <TranslateModalContent
                                                        ref={c=>this.translateModalContent=c}
                                                        translateKey={this.state.newTranslation.key}
                                                        translateValue={this.state.newTranslation.value}
                                                        onKeyChange={value => this.updateNewTranslation('key', value)}
                                                        onValueChange={value => this.updateNewTranslation('value', value)}
                                                        locale={StringUtils.substring(_.get(this.state.locale, 'isoCode'), 0, 2)}
                                                    />}
                </Modal>
            </Page>
        );
    }
}

TranslationManagement.contextTypes = {
    translator: PropTypes.object
};