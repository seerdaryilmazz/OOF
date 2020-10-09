'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.CardListRowBody = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _CardListRowBodyElem = require('./CardListRowBodyElem');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CardListRowBody = exports.CardListRowBody = function (_React$Component) {
    _inherits(CardListRowBody, _React$Component);

    function CardListRowBody(props) {
        _classCallCheck(this, CardListRowBody);

        var _this = _possibleConstructorReturn(this, (CardListRowBody.__proto__ || Object.getPrototypeOf(CardListRowBody)).call(this, props));

        _this.getRowData = function (header, rowData) {
            return rowData[header.field];
        };

        return _this;
    }

    _createClass(CardListRowBody, [{
        key: 'render',
        value: function render() {
            var rowData = this.props.rowData;
            var headers = this.props.headers;

            var self = this;

            return _react2.default.createElement(
                'div',
                { className: 'md-card-list-item-sender' },
                _react2.default.createElement(
                    'table',
                    null,
                    _react2.default.createElement(
                        'tbody',
                        null,
                        _react2.default.createElement(
                            'tr',
                            null,
                            headers.headerList.map(function (header) {

                                var cellData = self.getRowData(header, rowData);

                                return _react2.default.createElement(_CardListRowBodyElem.CardListRowBodyElem, { key: _uuid2.default.v4(), header: header, cellData: cellData });
                            })
                        )
                    )
                )
            );
        }
    }]);

    return CardListRowBody;
}(_react2.default.Component);