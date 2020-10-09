import { StringUtils } from "./StringUtils";

export class EnumUtils {
    static enumHelper(id, code, name) {
        if (id) {
            const _CODE = code ? code : id;
            const _NAME = name ? name : StringUtils.titleCase(_.replace(_CODE, '_', ' '), 'en');
            return {
                id: id,
                code: _CODE,
                name: _NAME
            };
        }
        return null;
    }
}