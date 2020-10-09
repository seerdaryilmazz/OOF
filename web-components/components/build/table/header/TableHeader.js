'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TableHeader = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _HeaderElem = require('./HeaderElem');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * actions
 * insertion
 * headers
 */
var TableHeader = exports.TableHeader = function (_React$Component) {
    _inherits(TableHeader, _React$Component);

    function TableHeader(props) {
        _classCallCheck(this, TableHeader);

        var _this = _possibleConstructorReturn(this, (TableHeader.__proto__ || Object.getPrototypeOf(TableHeader)).call(this, props));

        _this.getActionTitle = function (actions) {
            return "Actions";
        };

        _this.isActionColumnShown = function (actions, insertion) {
            if (actions || insertion) {
                return true;
            } else {
                return false;
            }
        };

        return _this;
    }

    _createClass(TableHeader, [{
        key: 'render',
        value: function render() {

            if (!this.props.headers) {
                return null;
            }

            var self = this;

            var actions = this.props.actions;
            var insertion = this.props.insertion;

            var headers = this.props.headers;

            var showActionColumn = this.isActionColumnShown(actions, insertion);

            var actionColumn = null;

            if (showActionColumn) {
                actionColumn = _react2.default.createElement(_HeaderElem.HeaderElem, { header: { name: this.getActionTitle(actions) } });
            }

            return _react2.default.createElement(
                'thead',
                null,
                _react2.default.createElement(
                    'tr',
                    null,
                    headers.map(function (header) {
                        return _react2.default.createElement(_HeaderElem.HeaderElem, { key: header.data, header: header,
                            sortData: function sortData(sortBy, sortOrder, headerSortObj) {
                                return self.props.sortData(sortBy, sortOrder, headerSortObj);
                            } });
                    }),
                    actionColumn
                )
            );
        }
    }]);

    return TableHeader;
}(_react2.default.Component);