'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Tab = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _abstract = require('../abstract');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var onTabChange = null;

var Tab = exports.Tab = function (_TranslatingComponent) {
    _inherits(Tab, _TranslatingComponent);

    function Tab(props) {
        _classCallCheck(this, Tab);

        var _this = _possibleConstructorReturn(this, (Tab.__proto__ || Object.getPrototypeOf(Tab)).call(this, props));

        _this.state = { id: props.id || _uuid2.default.v4() };
        onTabChange = function onTabChange(e, active, previous) {
            return props.onTabChange && props.onTabChange(e, active, previous);
        };
        return _this;
    }

    _createClass(Tab, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.refresh();
            $('[data-uk-tab]', '#' + this.state.id).on('change.uk.tab', onTabChange);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.refresh();
        }
    }, {
        key: 'refresh',
        value: function refresh() {
            UIkit.domObserve('#' + this.state.id, function (element) {});
        }
    }, {
        key: 'translate',
        value: function translate(str) {
            return this.props.translate ? _get(Tab.prototype.__proto__ || Object.getPrototypeOf(Tab.prototype), 'translate', this).call(this, str) : str;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props = this.props,
                children = _props.children,
                labels = _props.labels,
                active = _props.active,
                align = _props.align,
                animation = _props.animation;


            var labelUlClassNames = ["uk-tab"];
            if (align == "horizontal") {
                labelUlClassNames.push("uk-tab-left");
            }

            var connectParam = this.state.id + "-connect";
            var paramDataUkTab = { connect: '#' + connectParam, animation: animation };

            var tabs = _react2.default.createElement(
                'ul',
                { className: labelUlClassNames.join(" "), 'data-uk-tab': JSON.stringify(paramDataUkTab) },
                labels.map(function (label, index) {
                    var classNames = [];
                    if (active && _this2.translate(active) == _this2.translate(label) || 0 == index) {
                        classNames.push("uk-active");
                    }
                    return _react2.default.createElement(
                        'li',
                        { key: index, className: classNames.join(" ") },
                        _react2.default.createElement(
                            'a',
                            { href: 'javascript:;' },
                            _this2.translate(label)
                        )
                    );
                })
            );

            var contents = _react2.default.createElement(
                'ul',
                { id: connectParam, className: 'uk-switcher uk-margin' },
                _react2.default.Children.map(children, function (child, index) {
                    return _react2.default.createElement(
                        'li',
                        { key: index },
                        child
                    );
                })
            );

            var tabComponent = align == "horizontal" ? _react2.default.createElement(
                'div',
                { className: 'uk-width-1-1' },
                _react2.default.createElement(
                    'div',
                    { className: 'uk-grid' },
                    tabs,
                    contents
                )
            ) : _react2.default.createElement(
                'div',
                null,
                tabs,
                contents
            );

            return _react2.default.createElement(
                'div',
                { id: this.state.id, 'data-uk-observe': true },
                tabComponent
            );
        }
    }]);

    return Tab;
}(_abstract.TranslatingComponent);

Tab.defaultProps = {
    animation: 'fade',
    align: 'vertical',
    translate: false
};


Tab.contextTypes = {
    translator: _propTypes2.default.object
};