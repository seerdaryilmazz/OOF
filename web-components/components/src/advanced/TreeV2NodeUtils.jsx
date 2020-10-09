import {TreeV2NodeSearchResult} from './TreeV2NodeSearchResult';

export class TreeV2NodeUtils {

    static findNodeFromNodeList(nodes, predicate) {

        let result = null;

        if (nodes) {
            for (let i = 0; i < nodes.length; i++) {
                let node = nodes[i];
                result = TreeV2NodeUtils.findNode(null, node, predicate);
                if (result) {
                    break;
                }
            }
        }

        return result;
    }

    static findNode(parentNode, node, predicate) {

        let result = null;

        if (predicate(node)) {
            result = new TreeV2NodeSearchResult(parentNode, node);
        } else if (node.childNodes && node.childNodes.length > 0) {
            for (let i = 0; i < node.childNodes.length; i++) {
                let childNode = node.childNodes[i];
                result = TreeV2NodeUtils.findNode(node, childNode, predicate);
                if (result) {
                    break;
                }
            }
        }

        return result;
    }
}