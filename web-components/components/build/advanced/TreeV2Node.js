"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TreeV2Node = undefined;

var _uuid = require("uuid");

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TreeV2Node = exports.TreeV2Node = function TreeV2Node(data, content, hasChildNodes, showChildNodes, childNodes) {
    _classCallCheck(this, TreeV2Node);

    this._key = _uuid2.default.v4();
    this.data = data;
    this.content = content;
    this.hasChildNodes = hasChildNodes; // childNodes sonradan yüklenecekse böyle bir alan tutmak mantıklı oluyor.
    this.showChildNodes = showChildNodes; // childNodes var olsa da bazı durumlarda gösterilmeyeceği için böyle bir alan tutmak mantıklı oluyor.
    this.childNodes = childNodes;
};