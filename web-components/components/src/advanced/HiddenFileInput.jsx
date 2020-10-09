import React from "react";

import {TranslatingComponent} from "../abstract/";

/**
 * Ekranda hiçbir şey görünmesini istemiyorsak ve istediğimiz bir aksiyon ile fileDialog'u açıp dosya seçtirmek istiyorsak
 * bu component'i kullanabiliriz. FileDialog'u açmak için dışarıdan openFileDialog() metodunu çağırmamız gerekiyor.
 */
export class HiddenFileInput extends TranslatingComponent {

    /**
     * Aynı component ile daha önceden dosya seçildiyse, fileDialog'ta cancel tıklandığında files null veya undefined olmuyor,
     * ama files[0] undefined oluyor. Bu durum this.props.onchange metodunda göz önünde bulundurulmalı.
     */
    handleOnChange() {
        if (this.props.onchange) {
            this.props.onchange(this.fileInput.files);
        }
    }

    openFileDialog() {
        this.fileInput.click();
    }

    render() {

        let multiple;

        if (this.props.multiple === true) {
            multiple = true;
        } else if (this.props.multiple === false) {
            multiple = false;
        } else {
            multiple = false;
        }

        return (
            <input ref={(c) => this.fileInput = c} type="file" style={{display: "none"}} onChange={() => this.handleOnChange()} multiple={multiple}/>
        );
    }
}