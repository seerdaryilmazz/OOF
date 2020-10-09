import React from "react";

import {TranslatingComponent} from 'susam-components/abstract';
import {GridCell, Grid} from 'susam-components/layout';
import {AgreementList} from "./homeComponents/AgreementList";

/**
 * TODO: Bu sayfaya menüden bir link ile erişmek istendiğinde link adresi olarak '/ui/crm/#/' verildiğinde,
 * bazen Tasks component'indeki sekmelerin içeriği boş geliyor. Link adresi olarak '/ui/crm/' verildiğinde
 * sorun yaşanmıyor. Ama henüz kökten bir çözüm bulamadık.
 */
export class Home extends TranslatingComponent {
    render() {
        return (
            <Grid>
                <GridCell width="1-1">
                    <AgreementList/>
                </GridCell>
            </Grid>
        );
    }
}