'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Circle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _d = require('d3');

var _d2 = _interopRequireDefault(_d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Circle = exports.Circle = function (_React$Component) {
    _inherits(Circle, _React$Component);

    function Circle(props) {
        _classCallCheck(this, Circle);

        var _this = _possibleConstructorReturn(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).call(this, props));

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

    _createClass(Circle, [{
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
            return _react2.default.createElement('div', { className: 'Circle' });
        }
    }]);

    return Circle;
}(_react2.default.Component);

Circle.propTypes = { data: _propTypes2.default.array, domain: _propTypes2.default.object };