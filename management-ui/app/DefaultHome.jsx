import React from "react";
import * as axios from 'axios';
import uuid from "uuid";

import {TranslatingComponent} from 'susam-components/abstract';
import {PageHeader} from "susam-components/layout";

export class DefaultHome extends TranslatingComponent {
    render(){
        return (
            <div>
                <PageHeader title="home page for homeless people" />
            </div>
        );
    }
}