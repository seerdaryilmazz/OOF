'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.NodeChart = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _d3Funcs = require('./d3Funcs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NodeChart = exports.NodeChart = function (_React$Component) {
    _inherits(NodeChart, _React$Component);

    function NodeChart(props) {
        _classCallCheck(this, NodeChart);

        var _this = _possibleConstructorReturn(this, (NodeChart.__proto__ || Object.getPrototypeOf(NodeChart)).call(this, props));

        _this.state = { width: "478", height: "251" };
        _this.d3Funcs = new _d3Funcs.d3Funcs(_this.props);
        _this.force = _this.d3Funcs.createForce();

        return _this;
    }

    _createClass(NodeChart, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.d3Graph = _d2.default.select(_reactDom2.default.findDOMNode(this.nodeChart));

            this.force.on('tick', function () {
                // after force calculation starts, call updateGraph
                // which uses d3 to manipulate the attributes,
                // and React doesn't have to go through lifecycle on each tick
                _this2.d3Graph.call(_this2.d3Funcs.updateGraph);
            });
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps) {
            this.d3Graph = _d2.default.select(_reactDom2.default.findDOMNode(this.nodeChart));

            var d3Nodes = this.d3Graph.selectAll('.node').data(nextProps.nodes, function (node) {
                return node.key;
            });
            d3Nodes.enter().append('g').call(this.d3Funcs.enterNode);

            d3Nodes.exit().remove();
            d3Nodes.call(this.d3Funcs.updateNode);
            if (this.props.onclick) {

                d3Nodes.call(this.d3Funcs.addEvent);
            }

            var d3Links = this.d3Graph.selectAll('.link').data(nextProps.links, function (link) {
                return link.key;
            });
            d3Links.enter().insert('line', '.node').call(this.d3Funcs.enterLink);
            d3Links.exit().remove();
            d3Links.call(this.d3Funcs.updateLink);

            this.force.nodes(nextProps.nodes).links(nextProps.links);
            this.force.start();
            //  d3Nodes.call(this.d3Funcs.responsivefy);

            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                'svg',
                { width: this.state.width, height: this.state.height },
                _react2.default.createElement('g', { width: this.state.width, height: this.state.height, ref: function ref(c) {
                        return _this3.nodeChart = c;
                    } })
            );
        }
    }]);

    return NodeChart;
}(_react2.default.Component);