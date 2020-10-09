'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Graph = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _d3Funcs = require('./d3Funcs');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Graph = exports.Graph = function (_React$Component) {
    _inherits(Graph, _React$Component);

    function Graph(props) {
        _classCallCheck(this, Graph);

        var _this = _possibleConstructorReturn(this, (Graph.__proto__ || Object.getPrototypeOf(Graph)).call(this, props));

        _this.state = { width: 478, height: 251 };
        _this.state.id = _this.props.id ? _this.props.id : _uuid2.default.v4();
        _this.d3Funcs = new _d3Funcs.d3Funcs(_this.props);
        _this.force = _this.d3Funcs.createForce();

        return _this;
    }

    _createClass(Graph, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.d3Graph = _d2.default.select(_reactDom2.default.findDOMNode(this._input));

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
            this.d3Graph = _d2.default.select(_reactDom2.default.findDOMNode(this._input));

            var d3Nodes = this.d3Graph.selectAll('.node').data(nextProps.nodes, function (node) {
                return node.key;
            });
            d3Nodes.enter().append('g').call(this.d3Funcs.enterNode);
            d3Nodes.exit().remove();
            d3Nodes.call(this.d3Funcs.updateNode);

            var d3Links = this.d3Graph.selectAll('.link').data(nextProps.links, function (link) {
                return link.key;
            });
            d3Links.enter().insert('line', '.node').call(this.d3Funcs.enterLink);
            d3Links.exit().remove();
            d3Links.call(this.d3Funcs.updateLink);

            // we should actually clone the nodes and links
            // since we're not supposed to directly mutate
            // props passed in from parent, and d3's force function
            // mutates the nodes and links array directly
            // we're bypassing that here for sake of brevity in example

            this.force.nodes(nextProps.nodes).links(nextProps.links);
            this.force.start();

            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            return _react2.default.createElement(
                'svg',
                { width: 960, height: 500 },
                _react2.default.createElement('g', { id: this.state.id, ref: function ref(c) {
                        return _this3._input = c;
                    } })
            );
        }
    }]);

    return Graph;
}(_react2.default.Component);