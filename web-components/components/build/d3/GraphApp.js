'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GraphApp = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Graph = require('./Graph');

var _NodeChart = require('./NodeChart');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GraphApp = exports.GraphApp = function (_React$Component) {
    _inherits(GraphApp, _React$Component);

    function GraphApp(props) {
        _classCallCheck(this, GraphApp);

        var _this = _possibleConstructorReturn(this, (GraphApp.__proto__ || Object.getPrototypeOf(GraphApp)).call(this, props));

        _this.state = { nodes: [],
            links: [] };
        return _this;
    }

    _createClass(GraphApp, [{
        key: 'componentDidMount',
        value: function componentDidMount() {

            this.updateData();
        }
    }, {
        key: 'updateData',
        value: function updateData() {
            // randomData is loaded in from external file generate_data.js
            // and returns an object with nodes and links
            var newState = { nodes: [{ key: 8, size: 20, x: 349, y: 252, klass: "country", label: "country" }, { key: 25, size: 20, x: 349, y: 251, klass: "company", label: "company" }, { key: 18, size: 20, x: 349, y: 152, klass: "customer", label: "Customer" }],
                links: [{ source: 0, target: 1, key: "0,1", size: 2 }, { source: 1, target: 2, key: "asdasdasd", size: 2 }] }; //randomData(this.state.nodes, 950, 500);

            this.setState(newState);
        }
    }, {
        key: 'handleClick',
        value: function handleClick(event) {
            console.log("click event-->" + JSON.stringify(event));
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            return _react2.default.createElement(
                'div',
                { className: 'GraphApp' },
                _react2.default.createElement(
                    'div',
                    { className: 'update', onClick: function onClick() {
                            return _this2.updateData();
                        } },
                    'update'
                ),
                _react2.default.createElement(_NodeChart.NodeChart, { nodes: this.props.nodes, links: this.props.links,

                    onclick: function onclick(event) {
                        return _this2.handleClick(event);
                    } })
            );
        }
    }]);

    return GraphApp;
}(_react2.default.Component);