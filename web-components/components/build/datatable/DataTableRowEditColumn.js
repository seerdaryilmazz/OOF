'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DataTableRowEditColumn = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _EditWrapper = require('./wrappers/EditWrapper');

var _basic = require('../basic');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataTableRowEditColumn = exports.DataTableRowEditColumn = function (_React$Component) {
    _inherits(DataTableRowEditColumn, _React$Component);

    function DataTableRowEditColumn(props) {
        _classCallCheck(this, DataTableRowEditColumn);

        return _possibleConstructorReturn(this, (DataTableRowEditColumn.__proto__ || Object.getPrototypeOf(DataTableRowEditColumn)).call(this, props));
    }

    _createClass(DataTableRowEditColumn, [{
        key: 'componentDidMount',
        value: function componentDidMount() {}
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {}
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps() {}
    }, {
        key: 'handleRowCancelClick',
        value: function handleRowCancelClick(e) {
            e.preventDefault();
            this.props.oncancel && this.props.oncancel();
        }
    }, {
        key: 'handleRowSaveClick',
        value: function handleRowSaveClick(e) {
            e.preventDefault();
            this.props.onsave && this.props.onsave();
        }
    }, {
        key: 'handleEditBegin',
        value: function handleEditBegin(e) {
            e.preventDefault();
            this.props.oneditbegin && this.props.oneditbegin();
        }
    }, {
        key: 'handleDeleteClick',
        value: function handleDeleteClick(e) {
            var _this2 = this;

            e.preventDefault();
            UIkit.modal.confirm("Are you sure?", function () {
                return _this2.handleDelete();
            });
        }
    }, {
        key: 'handleDelete',
        value: function handleDelete() {
            this.props.ondelete && this.props.ondelete();
        }
    }, {
        key: 'renderHeader',
        value: function renderHeader() {
            var width = this.props.width ? this.props.width + "%" : "";
            var className = "filter-false sorter-false";
            return _react2.default.createElement('th', { className: className, width: width });
        }
    }, {
        key: 'renderData',
        value: function renderData(data) {
            var _this3 = this;

            var editIcon = "";
            if (this.props.editable) {
                var isRowEditable = !data.isRowEditable || data.isRowEditable();
                if (this.props.formSettings && this.props.formSettings.showButton) {
                    editIcon = _react2.default.createElement(_basic.Button, { label: 'Edit', style: 'primary', size: 'mini', icon: 'pencil', waves: true, disabled: !isRowEditable,
                        onclick: function onclick(e) {
                            return _this3.handleEditBegin(e);
                        } });
                } else {
                    if (isRowEditable) {
                        editIcon = _react2.default.createElement(
                            'a',
                            { href: '#', onClick: function onClick(e) {
                                    return _this3.handleEditBegin(e);
                                } },
                            _react2.default.createElement('i', { className: 'md-icon uk-icon-pencil' })
                        );
                    } else {
                        editIcon = _react2.default.createElement('i', { className: 'md-icon uk-icon-pencil uk-text-muted' });
                    }
                }
            }
            var deleteIcon = "";
            if (this.props.deletable) {
                var isRowDeletable = !data.isRowDeletable || data.isRowDeletable();
                if (this.props.formSettings && this.props.formSettings.showButton) {
                    deleteIcon = _react2.default.createElement(_basic.Button, { label: 'Delete', style: 'danger', size: 'mini', icon: 'times', waves: true, disabled: !isRowDeletable,
                        onclick: function onclick(e) {
                            return _this3.handleDeleteClick(e);
                        } });
                } else {
                    if (isRowDeletable) {
                        deleteIcon = _react2.default.createElement(
                            'a',
                            { href: '#', onClick: function onClick(e) {
                                    return _this3.handleDeleteClick(e);
                                } },
                            _react2.default.createElement('i', { className: 'md-icon uk-icon-times' })
                        );
                    } else {
                        deleteIcon = _react2.default.createElement('i', { className: 'md-icon uk-icon-times uk-text-muted' });
                    }
                }
            }
            if (this.props.isEdit || this.props.isInsert) {
                var saveButton = "";
                if (this.props.formSettings && this.props.formSettings.showButton) {
                    saveButton = _react2.default.createElement(_basic.Button, { label: 'Save', style: 'primary', size: 'mini', icon: 'save', waves: true,
                        onclick: function onclick(e) {
                            return _this3.handleRowSaveClick(e);
                        } });
                } else {
                    saveButton = _react2.default.createElement(
                        'a',
                        { href: '#', onClick: function onClick(e) {
                                return _this3.handleRowSaveClick(e);
                            } },
                        _react2.default.createElement('i', { className: 'md-icon uk-icon-save' })
                    );
                }

                var cancelButton = "";
                if (this.props.formSettings && this.props.formSettings.showButton) {
                    cancelButton = _react2.default.createElement(_basic.Button, { label: 'Cancel', style: 'danger', size: 'mini', icon: 'ban', waves: true,
                        onclick: function onclick(e) {
                            return _this3.handleRowCancelClick(e);
                        } });
                } else {
                    cancelButton = _react2.default.createElement(
                        'a',
                        { href: '#', onClick: function onClick(e) {
                                return _this3.handleRowCancelClick(e);
                            } },
                        _react2.default.createElement('i', { className: 'md-icon uk-icon-ban' })
                    );
                }

                return _react2.default.createElement(
                    'td',
                    { className: 'uk-vertical-align uk-text-right' },
                    saveButton,
                    cancelButton
                );
            } else {
                return _react2.default.createElement(
                    'td',
                    { className: 'uk-vertical-align uk-text-right' },
                    editIcon,
                    deleteIcon
                );
            }
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.props.data) {
                return this.renderData(this.props.data);
            } else {
                return this.renderHeader();
            }
        }
    }]);

    return DataTableRowEditColumn;
}(_react2.default.Component);