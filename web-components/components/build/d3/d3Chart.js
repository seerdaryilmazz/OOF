'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var d3Chart = exports.d3Chart = function () {
    function d3Chart() {
        _classCallCheck(this, d3Chart);
    }

    _createClass(d3Chart, [{
        key: 'create',
        value: function create(el, props, state) {
            console.log("create ");
            var svg = d3.select(el).append('svg').attr('class', 'd3').attr('width', props.width).attr('height', props.height);

            svg.append('g').attr('class', 'd3-points');
            console.log(svg);
            this.update(el, state);
        }
    }, {
        key: 'update',
        value: function update(el, state) {
            // Re-compute the scales, and render the data points
            var scales = d3._scales(el, state.domain);
            this._drawPoints(el, scales, state.data);
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
            var g = d3.select(el).selectAll('.d3-points');

            var point = g.selectAll('.d3-point').data(data, function (d) {
                return d.id;
            });

            // ENTER
            point.enter().append('circle').attr('class', 'd3-point');

            // ENTER & UPDATE
            point.attr('cx', function (d) {
                return scales.x(d.x);
            }).attr('cy', function (d) {
                return scales.y(d.y);
            }).attr('r', function (d) {
                return scales.z(d.z);
            });

            // EXIT
            point.exit().remove();
        }
    }]);

    return d3Chart;
}();