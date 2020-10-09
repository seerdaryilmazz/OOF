'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TreeV2NodeUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _TreeV2NodeSearchResult = require('./TreeV2NodeSearchResult');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TreeV2NodeUtils = exports.TreeV2NodeUtils = function () {
    function TreeV2NodeUtils() {
        _classCallCheck(this, TreeV2NodeUtils);
    }

    _createClass(TreeV2NodeUtils, null, [{
        key: 'findNodeFromNodeList',
        value: function findNodeFromNodeList(nodes, predicate) {

            var result = null;

            if (nodes) {
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    result = TreeV2NodeUtils.findNode(null, node, predicate);
                    if (result) {
                        break;
                    }
                }
            }

            return result;
        }
    }, {
        key: 'findNode',
        value: function findNode(parentNode, node, predicate) {

            var result = null;

            if (predicate(node)) {
                result = new _TreeV2NodeSearchResult.TreeV2NodeSearchResult(parentNode, node);
            } else if (node.childNodes && node.childNodes.length > 0) {
                for (var i = 0; i < node.childNodes.length; i++) {
                    var childNode = node.childNodes[i];
                    result = TreeV2NodeUtils.findNode(node, childNode, predicate);
                    if (result) {
                        break;
                    }
                }
            }

            return result;
        }
    }]);

    return TreeV2NodeUtils;
}();