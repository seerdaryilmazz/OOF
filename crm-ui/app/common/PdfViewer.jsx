import React from "react";
import _ from "lodash";
import uuid from 'uuid';
import * as axios from "axios";

import {TranslatingComponent} from 'susam-components/abstract';
import {Card, Grid, GridCell, PageHeader, CardHeader, Loader, Pagination, Modal} from "susam-components/layout";
import {Notify, TextInput, Button, DropDown, Span, Checkbox} from 'susam-components/basic';
import {NumericInput, Chip} from 'susam-components/advanced';

export class PdfViewer extends TranslatingComponent {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
    }

    open(pdfUrl) {
        // Her zaman sunucudaki güncel pdf dosyasının indirilmesi için iframe için farklı bir key veriyoruz.
        this.setState({pdfUrl: pdfUrl, keyForIframe: uuid.v4()}, () => this.modalReference.open());
    }

    close() {
        this.modalReference.close();
    }

    renderContent() {
        if (_.isNil(this.state.pdfUrl)) {
            return null;
        } else {
            // Aşağıda, iframe'den önce sayfada bir düğme gösteriyoruz. Düğmeden sonra sayfada geriye kalan tüm alanı iframe'in kaplamasını istiyoruz.
            // Bunun için aşağıda pek çok stil veriyoruz, bu stilleri neye göre verdik? Aşağıdaki adresteki "Option 2" bölümündeki çözümü kullandık.
            // https://stackoverflow.com/a/325334
            return (
                <div style={{display: "table", emptyCells: "show", borderCollapse: "collapse", width: "100%", height: "100%"}}>
                    <div style={{display: "table-row", overflow: "auto", textAlign: "center"}}>
                        <Button label="Return to Main Page" style="success" size="small" flat={true} onclick={() => this.close()}/>
                    </div>
                    <div style={{display: "table-row", height: "100%", overflow: "hidden"}}>
                        <iframe key={this.state.keyForIframe} src={"/static/assets/pdf.js-gh-pages/web/viewer.html?file=" + this.state.pdfUrl}
                                style={{width: "100%", height: "100%", border: "none", margin: 0, padding: 0, display: "block"}}>
                            Your browser does not support inline frames.
                        </iframe>
                    </div>
                </div>
            );
        }
    }

    render() {
        return (
            <Modal fullscreen={true}
                   removePadding={true}
                   ref={(c) => this.modalReference = c}>
                {this.renderContent()}
            </Modal>
        );
    }
}

