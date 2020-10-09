"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FileInput = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _abstract = require("../abstract/");

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FileInput = exports.FileInput = function (_TranslatingComponent) {
    _inherits(FileInput, _TranslatingComponent);

    function FileInput(props) {
        _classCallCheck(this, FileInput);

        return _possibleConstructorReturn(this, (FileInput.__proto__ || Object.getPrototypeOf(FileInput)).call(this, props));
    }

    _createClass(FileInput, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            var _this2 = this;

            $('.dropify').dropify({
                messages: {
                    'default': _get(FileInput.prototype.__proto__ || Object.getPrototypeOf(FileInput.prototype), "translate", this).call(this, 'Drag and drop a file here or click'),
                    'replace': _get(FileInput.prototype.__proto__ || Object.getPrototypeOf(FileInput.prototype), "translate", this).call(this, 'Drag and drop or click to replace'),
                    'remove': _get(FileInput.prototype.__proto__ || Object.getPrototypeOf(FileInput.prototype), "translate", this).call(this, 'Remove'),
                    'error': _get(FileInput.prototype.__proto__ || Object.getPrototypeOf(FileInput.prototype), "translate", this).call(this, 'Ooops, something wrong happened.')
                }
            });

            $(this._input).change(function () {
                if (_this2.props.onchange) {
                    _this2.props.onchange(_this2._input.files);
                }
            });
        }
    }, {
        key: "clearSelectedFile",
        value: function clearSelectedFile() {
            $('.dropify-clear').click();
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                "div",
                { style: { width: "96%" } },
                _react2.default.createElement("input", { id: this.props.id, ref: function ref(c) {
                        return _this3._input = c;
                    },
                    value: this.props.value,
                    required: this.props.required,
                    accept: this.props.accept,
                    "data-parsley-group": this.props.validationGroup,
                    "data-parsley-required-message": _get(FileInput.prototype.__proto__ || Object.getPrototypeOf(FileInput.prototype), "translate", this).call(this, "This value is required."),
                    "data-default-file": this.props.value ? this.props.value.name : "",
                    type: "file", className: "dropify" })
            );
        }
    }]);

    return FileInput;
}(_abstract.TranslatingComponent);

FileInput.contextTypes = {
    translator: _propTypes2.default.object
};