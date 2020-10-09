'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Form = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _Validation = require('./Validation');

var _Validation2 = _interopRequireDefault(_Validation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Form = exports.Form = function (_React$Component) {
    _inherits(Form, _React$Component);

    function Form(props) {
        _classCallCheck(this, Form);

        var _this = _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).call(this, props));

        if (props.id) {
            _this.state = { id: props.id };
        } else {
            _this.state = { id: _uuid2.default.v4() };
        }
        _this.validation = new _Validation2.default(_this.state.id);
        return _this;
    }

    _createClass(Form, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.mountValidation();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.validation && this.validation.destroy();
        }
    }, {
        key: 'mountValidation',
        value: function mountValidation() {
            this.validation.mount();
        }
    }, {
        key: 'validate',
        value: function validate() {
            return this.validation && this.validation.validate();
        }
    }, {
        key: 'validateGroup',
        value: function validateGroup(groupName) {
            return this.validation && this.validation.validateGroup(groupName);
        }
    }, {
        key: 'isValid',
        value: function isValid() {
            return this.validation && this.validation.isValid();
        }
    }, {
        key: 'reset',
        value: function reset() {
            return this.validation && this.validation.reset();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {}
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'form',
                { id: this.state.id },
                this.props.children
            );
        }
    }, {
        key: 'getChildContext',
        value: function getChildContext() {
            return { validation: this.validation };
        }
    }]);

    return Form;
}(_react2.default.Component);

Form.childContextTypes = {
    validation: _propTypes2.default.object
};