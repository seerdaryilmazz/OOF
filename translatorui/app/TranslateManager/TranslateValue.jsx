import React from 'react';
import { Notify, TextInput } from 'susam-components/basic';
import { Grid, GridCell, Modal } from 'susam-components/layout';
import { LoaderWrapper } from 'susam-components/layout/Loader';
import { StringUtils } from 'susam-components/utils/StringUtils';
import { GoogleTranslateService } from '../services/GoogleTranslateService';
import { StringCaseUtils } from '../util/StringCaseUtils';
import { TranslateModalContent } from './TranslateModalContent';

export class TranslateValue extends React.Component {

    getNextCasingIndex(caseIndex = this.state.currentCaseIndex) {
        return (StringCaseUtils.casing.length + caseIndex + 1) % StringCaseUtils.casing.length;
    }

    getNextCasing(caseIndex) {
        return StringCaseUtils.casing[this.getNextCasingIndex(caseIndex)];
    }

    state = {
        currentCaseIndex: 0,
        translating: false
    };

    handleTanslate() {
        this.setState({ translating: true });
        GoogleTranslateService.translate(this.props.rowData.key, 'en', this.props.toLng).then(response => {
            this.props.onchange(StringUtils.capitalize(response.data.text, this.props.toLng));
        }).catch(error => Notify.showError(error)).then(() => {
            this.setState({ translating: false });
        });
    }

    handeChangeCase() {
        this.setState(prevState => ({
            currentCaseIndex: this.getNextCasingIndex(prevState.currentCaseIndex)
        }), () => this.props.onchange(StringCaseUtils.casing[this.state.currentCaseIndex].execute(this.props.value, this.props.toLng)));
    }

    render() {
        return (
            <div>
                <LoaderWrapper size="XS" busy={this.state.translating}>
                    <Grid noMargin={true} >
                        <GridCell width="5-6" noMargin={true}>
                            <TextInput {...this.props} />
                        </GridCell>
                        <GridCell width="1-6" >
                            <Grid noMargin={true} smallGutter={true}>
                                <GridCell width="1-3" noMargin={true}>
                                    <a href="javascript:;" onClick={() => this.handleTanslate()} data-uk-tooltip="{pos:'bottom'}" title="Translate by Google">
                                        <i className="material-icons">translate</i>
                                    </a>
                                </GridCell>
                                <GridCell width="1-3" noMargin={true}>
                                    <a href="javascript:;" onClick={() => this.handeChangeCase()} data-uk-tooltip="{pos:'bottom'}" title={this.getNextCasing().label}>
                                        <i className="material-icons">text_fields</i>
                                    </a>
                                </GridCell>
                                <GridCell width="1-3" noMargin={true}>
                                    <a href="javascript:;" onClick={() => this.editModal.open()} data-uk-tooltip="{pos:'bottom'}" title="Expand">
                                        <i className="material-icons">launch</i>
                                    </a>
                                </GridCell>
                            </Grid>
                        </GridCell>
                    </Grid>
                </LoaderWrapper>
                <Modal ref={d => this.editModal = d}
                    medium={true}
                    >
                    <TranslateModalContent
                        locale={this.props.toLng}
                        translateKey={this.props.rowData.key}
                        translateValue={this.props.value}
                        onValueChange={value=>this.props.onchange(value)}
                    />
                </Modal>
            </div>
        )
    }
}