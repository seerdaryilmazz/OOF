import React from 'react';
import { TranslatingComponent } from 'susam-components/abstract';
import { Notify } from 'susam-components/basic';
import { Modal } from 'susam-components/layout';
import { HSCodeService } from '../services/HSCodeService';
import { HSCodeDetail } from './HSCodeDetail';

export class HSCodeDetailModal extends TranslatingComponent {

    language = navigator.language || navigator.userLanguage;

    constructor(props) {
        super(props);
        this.state = { data: this.init() }
    }

    init() {
        return { name: null, code: null };
    }

    onClose() {
        this.props.onClose && this.props.onClose();
    }

    onOpen() {
        this.props.onOpen && this.props.onOpen();
    }

    validate() {
        if (_.isEmpty(this.state.data.name)) {
            Notify.showError("Definition can not empty");
            return false;
        }
        return true;
    }

    open(item) {
        this.setState({ data: item ? item : this.init() }, () => this.modal.open());
    }

    close() {
        this.setState({ data: this.init() }, () => this.modal.close());
    }

    handleSaveItem() {
        this.validate() && HSCodeService.save(this.state.data).then(response => {
            Notify.showSuccess("HS Code is saved");
            this.props.onSave && this.props.onSave(response.data);
            this.close();
        }).catch(error => {
            Notify.showError(error);
        });
    }

    handleValueChange(key, value) {
        let hsCode = _.cloneDeep(this.state.data);
        hsCode[key] = _.isString(value) ? value.upperCaseLocale(this.language) : value;
        this.setState({ data: hsCode });
    }

    render() {
        return (
            <Modal ref={c => this.modal = c}
                closeOtherOpenModals={false}
                center={false}
                actions={[{ label: "Close", action: () => this.close() }, { label: "Save", action: () => this.handleSaveItem() }]}
                onclose={() => this.onClose()}
                onopen={() => this.onOpen()}>
                <div lang={this.language}>
                    <HSCodeDetail data={this.state.data} onValueChange={(key, value) => this.handleValueChange(key, value)} />
                </div>
            </Modal>
        )
    }
}

String.prototype.upperCaseLocale = function (lang) {
    if ('tr' === lang.toLowerCase()) {
        return this.replace(/ğ/g, 'Ğ')
            .replace(/ü/g, 'Ü')
            .replace(/ş/g, 'Ş')
            .replace(/ı/g, 'I')
            .replace(/i/g, 'İ')
            .replace(/ö/g, 'Ö')
            .replace(/ç/g, 'Ç')
            .toUpperCase();
    } else {
        return this.toLocaleUpperCase(lang);
    }
}