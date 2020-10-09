import uuid from "uuid";

export class TreeV2Node {

    constructor(data, content, hasChildNodes, showChildNodes, childNodes) {
        this._key = uuid.v4();
        this.data = data;
        this.content = content;
        this.hasChildNodes = hasChildNodes; // childNodes sonradan yüklenecekse böyle bir alan tutmak mantıklı oluyor.
        this.showChildNodes = showChildNodes; // childNodes var olsa da bazı durumlarda gösterilmeyeceği için böyle bir alan tutmak mantıklı oluyor.
        this.childNodes = childNodes;
    }
}