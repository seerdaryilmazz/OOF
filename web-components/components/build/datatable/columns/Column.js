'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Column = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _abstract = require('../../abstract/');

var _EditWrapper = require('../wrappers/EditWrapper');

var _FilterWrapper = require('../wrappers/FilterWrapper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Column = exports.Column = function (_TranslatingComponent) {
    _inherits(Column, _TranslatingComponent);

    function Column(props) {
        _classCallCheck(this, Column);

        var _this = _possibleConstructorReturn(this, (Column.__proto__ || Object.getPrototypeOf(Column)).call(this, props));

        _this.id = _uuid2.default.v4();
        return _this;
    }

    _createClass(Column, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            $.tablesorter.addParser(this.formatter.tableParser());
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            if (nextProps.reRender) {
                if (!_lodash2.default.isEqual(nextProps.printer, this.props.printer)) {
                    this.printer = nextProps.printer;
                }
                if (!_lodash2.default.isEqual(nextProps.reader, this.props.reader)) {
                    this.reader = nextProps.reader;
                }
            }
        }
    }, {
        key: 'updateData',
        value: function updateData(value) {
            this.props.ondataupdate && this.props.ondataupdate(value);
        }
    }, {
        key: 'updateFilterData',
        value: function updateFilterData(value) {
            this.props.onfilterupdate && this.props.onfilterupdate(value);
        }
    }, {
        key: 'getEditComponents',
        value: function getEditComponents() {
            var wrapper = null;
            _react2.default.Children.forEach(this.props.children, function (child) {
                if (child.type == _EditWrapper.EditWrapper) {
                    wrapper = child;
                }
            });
            if (wrapper) {
                return _react2.default.Children.toArray(wrapper.props.children);
            } else {
                return [this.defaultEditComponent];
            }
        }
    }, {
        key: 'getFilterComponents',
        value: function getFilterComponents() {
            var wrapper = null;
            _react2.default.Children.forEach(this.props.children, function (child) {
                if (child.type == _FilterWrapper.FilterWrapper) {
                    wrapper = child;
                }
            });
            if (wrapper) {
                return [wrapper];
            } else {
                return [this.defaultFilterComponent];
            }
        }
    }, {
        key: 'getAlignmentClassName',
        value: function getAlignmentClassName() {

            var className = "";

            if (this.props.left === true) {
                className = "uk-text-left";
            } else if (this.props.right === true) {
                className = "uk-text-right";
            } else if (this.props.center === true) {
                className = "uk-text-center";
            }

            return className;
        }
    }, {
        key: 'appendAlignmentClassName',
        value: function appendAlignmentClassName(existingClassNames) {

            var newClassName = this.getAlignmentClassName();

            if (!_lodash2.default.isNil(existingClassNames) && existingClassNames.length > 0) {
                return existingClassNames + " " + newClassName;
            } else {
                return newClassName;
            }
        }
    }, {
        key: 'renderHeaderCell',
        value: function renderHeaderCell() {
            var className = "";
            var filterable = this.props.filterable && this.props.tableFilterable;
            if (!filterable) {
                className += " filter-false";
            }
            var sortable = this.props.sortable && this.props.tableSortable;
            if (!sortable) {
                className += " sorter-false";
            } else {
                if (this.formatter) {
                    className += " sorter-" + this.formatter.id;
                }
            }

            className = this.appendAlignmentClassName(className);

            var width = this.props.width ? this.props.width + "%" : "";

            var headerContent = void 0;

            if (this.props.translateHeader === false) {
                headerContent = this.props.header;
            } else {
                headerContent = _get(Column.prototype.__proto__ || Object.getPrototypeOf(Column.prototype), 'translate', this).call(this, this.props.header);
            }

            // Başlıklar çok satırlı olduğunda "verticalAlign: top" tüm başıkların hizalı görünmesini sağlıyor, bundan dolayı ekledik.
            return _react2.default.createElement(
                'th',
                { style: { verticalAlign: "top" }, className: className, width: width },
                headerContent
            );
        }
    }, {
        key: 'renderDataCell',
        value: function renderDataCell(row, formattedData) {
            if (this.printer.printUsingRow) {
                return this.printer.printUsingRow(row, formattedData);
            } else {
                return this.printer.print(formattedData);
            }
        }
    }, {
        key: 'renderEditCell',
        value: function renderEditCell(unformattedData) {
            var _this2 = this;

            var components = this.getEditComponents().map(function (component) {
                return _react2.default.cloneElement(component, {
                    rowData: _this2.props.data,
                    key: _this2.id,
                    value: unformattedData,
                    validationGroup: _this2.props.validationGroup,
                    required: _this2.props.required,
                    appendToBody: true,
                    onchange: function onchange(value) {
                        return _this2.updateData(value);
                    }
                });
            });
            return components;
        }
    }, {
        key: 'renderFilterCell',
        value: function renderFilterCell() {
            var _this3 = this;

            var components = this.getFilterComponents().map(function (component) {
                return _react2.default.cloneElement(component, {
                    key: _this3.id,
                    value: _this3.props.filterData,
                    onchange: function onchange(value) {
                        return _this3.updateFilterData(value);
                    }
                });
            });
            return _react2.default.createElement(
                'td',
                { className: '' },
                components
            );
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.isHeader) {
                return this.renderHeaderCell();
            } else if (this.props.isFilter) {
                return this.renderFilterCell();
            } else {
                if (!this.props.data) {
                    return null;
                }
                var unformattedData = this.reader.readCellValue(this.props.data);
                if (!unformattedData && this.props.defaultValue) {
                    unformattedData = this.props.defaultValue;
                }
                if (this.props.isInsert) {
                    return _react2.default.createElement(
                        'td',
                        { className: this.getAlignmentClassName() },
                        this.renderEditCell(unformattedData)
                    );
                }
                var sortValue = this.reader.readSortValue(this.props.data);
                if (this.props.isEdit) {
                    if (this.props.editable !== false) {
                        return _react2.default.createElement(
                            'td',
                            { 'data-sort-value': sortValue, className: this.getAlignmentClassName() },
                            this.renderEditCell(unformattedData)
                        );
                    }
                }
                if (this.props.translator) {
                    if (_lodash2.default.isObject(unformattedData)) {
                        if (_lodash2.default.has(unformattedData, "text")) {
                            var text = _lodash2.default.get(unformattedData, "text");
                            _lodash2.default.set(unformattedData, "text", this.props.translator.translate(text));
                        }
                    } else {
                        unformattedData = this.props.translator.translate(unformattedData);
                    }
                }
                var formattedData = this.formatter.format(unformattedData);
                var classNames = ["uk-vertical-align"];
                if (this.props.classNameProvider) {
                    classNames.push(this.props.classNameProvider.classNames(unformattedData));
                }
                if (this.props.textBreak) {
                    classNames.push("uk-text-break");
                }
                if (this.props.uppercase) {
                    classNames.push("uk-text-upper");
                }
                if (this.props.center) {
                    classNames.push("uk-text-center");
                }
                if (this.props.disabled) {
                    classNames.push("opacity-disabled");
                }
                return _react2.default.createElement(
                    'td',
                    { className: classNames.join(" "), style: this.props.style, 'data-sort-value': sortValue },
                    this.renderDataCell(this.props.data, formattedData)
                );
            }
        }
    }]);

    return Column;
}(_abstract.TranslatingComponent);

Column.contextTypes = {
    translator: _propTypes2.default.object
};