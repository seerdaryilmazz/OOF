'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TableFooter = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _TableFooterRow = require('./TableFooterRow');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * headers
 * data
 * insertion
 * actionButtons
 * rowEdit
 */
var TableFooter = exports.TableFooter = function (_React$Component) {
    _inherits(TableFooter, _React$Component);

    function TableFooter(props) {
        _classCallCheck(this, TableFooter);

        var _this = _possibleConstructorReturn(this, (TableFooter.__proto__ || Object.getPrototypeOf(TableFooter)).call(this, props));

        _this.state = { rowEditIndex: -1 };

        return _this;
    }

    _createClass(TableFooter, [{
        key: 'render',
        value: function render() {

            var headers = this.props.headers;
            var footers = this.props.footers;
            var icons = this.props.icons;

            if (!footers) {
                return null;
            }

            return _react2.default.createElement(
                'tfoot',
                null,
                footers.map(function (footer) {

                    return _react2.default.createElement(_TableFooterRow.TableFooterRow, { key: _uuid2.default.v4(), headers: headers, footer: footer, icons: icons });
                })
            );
        }
    }]);

    return TableFooter;
}(_react2.default.Component);