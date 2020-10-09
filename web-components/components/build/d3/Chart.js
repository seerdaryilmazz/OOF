'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Chart = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

var _Circle = require('./Circle');

var _Circle2 = _interopRequireDefault(_Circle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
//import d3Chart from './d3Chart';

var Chart = exports.Chart = function (_React$Component) {
    _inherits(Chart, _React$Component);

    function Chart(props) {
        _classCallCheck(this, Chart);

        var _this = _possibleConstructorReturn(this, (Chart.__proto__ || Object.getPrototypeOf(Chart)).call(this, props));

        _this._scales = function (el, domain) {
            if (!domain) {
                return null;
            }

            var width = el.offsetWidth;
            var height = el.offsetHeight;

            var x = _d2.default.scale.linear().range([0, width]).domain(domain.x);

            var y = _d2.default.scale.linear().range([height, 0]).domain(domain.y);

            var z = _d2.default.scale.linear().range([5, 20]).domain([1, 10]);

            return { x: x, y: y, z: z };
        };

        return _this;
    }

    _createClass(Chart, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var el = _reactDom2.default.findDOMNode(this);
            console.log("test-->", el);
            var svg = _d2.default.select(el).append('svg').attr('class', 'd3').attr('width', '100%').attr('height', '300px');

            svg.append('g').attr('class', 'node');
            console.log(svg);
            var scales = this._scales(el, this.props.domain);
            this._drawPoints(el, scales, this.props.data);
        }
    }, {
        key: 'destroy',
        value: function destroy(el) {
            // Any clean-up would go here
            // in this example there is nothing to do
        }
    }, {
        key: '_drawPoints',
        value: function _drawPoints(el, scales, data) {
            var g = _d2.default.select(el).selectAll('.node');

            var point = g.selectAll('.ring').data(data, function (d) {
                return d.id;
            });

            // ENTER
            var elemEnter = point.enter();
            var circle = elemEnter.append('circle').attr('class', 'ring').attr("transform", function (d) {
                return "translate(" + d.x + ",80)";
            });

            // ENTER & UPDATE
            circle.attr('cx', function (d) {
                return scales.x(d.x);
            }).attr('cy', function (d) {
                return scales.y(d.y);
            }).attr('r', function (d) {
                return scales.z(d.z);
            }).attr('fill', '#68BDF6');

            //ADD Text
            elemEnter.append('text').attr('text-anchor', 'middle').attr('pointer-events', 'none').attr('y', '0').attr('font-size', '10px').attr('fill', 'black').text(function (data) {
                return data.label;
            });
            // EXIT
            point.exit().remove();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            var el = _reactDom2.default.findDOMNode(this);
            var scales = this._scales(el, this.props.domain);
            this._drawPoints(el, scales, this.props.data);
        }
    }, {
        key: 'getChartState',
        value: function getChartState() {
            return {
                data: this.props.data,
                domain: this.props.domain
            };
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var el = _reactDom2.default.findDOMNode(this);
            this.destroy(el);
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(_Circle2.default, { data: this.props.data, domain: this.props.domain });
        }
    }]);

    return Chart;
}(_react2.default.Component);

Chart.propTypes = { data: _react2.default.PropTypes.array, domain: _react2.default.PropTypes.object };