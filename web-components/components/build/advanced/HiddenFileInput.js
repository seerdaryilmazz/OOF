"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.HiddenFileInput = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _abstract = require("../abstract/");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Ekranda hiçbir şey görünmesini istemiyorsak ve istediğimiz bir aksiyon ile fileDialog'u açıp dosya seçtirmek istiyorsak
 * bu component'i kullanabiliriz. FileDialog'u açmak için dışarıdan openFileDialog() metodunu çağırmamız gerekiyor.
 */
var HiddenFileInput = exports.HiddenFileInput = function (_TranslatingComponent) {
    _inherits(HiddenFileInput, _TranslatingComponent);

    function HiddenFileInput() {
        _classCallCheck(this, HiddenFileInput);

        return _possibleConstructorReturn(this, (HiddenFileInput.__proto__ || Object.getPrototypeOf(HiddenFileInput)).apply(this, arguments));
    }

    _createClass(HiddenFileInput, [{
        key: "handleOnChange",


        /**
         * Aynı component ile daha önceden dosya seçildiyse, fileDialog'ta cancel tıklandığında files null veya undefined olmuyor,
         * ama files[0] undefined oluyor. Bu durum this.props.onchange metodunda göz önünde bulundurulmalı.
         */
        value: function handleOnChange() {
            if (this.props.onchange) {
                this.props.onchange(this.fileInput.files);
            }
        }
    }, {
        key: "openFileDialog",
        value: function openFileDialog() {
            this.fileInput.click();
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var multiple = void 0;

            if (this.props.multiple === true) {
                multiple = true;
            } else if (this.props.multiple === false) {
                multiple = false;
            } else {
                multiple = false;
            }

            return _react2.default.createElement("input", { ref: function ref(c) {
                    return _this2.fileInput = c;
                }, type: "file", style: { display: "none" }, onChange: function onChange() {
                    return _this2.handleOnChange();
                }, multiple: multiple });
        }
    }]);

    return HiddenFileInput;
}(_abstract.TranslatingComponent);