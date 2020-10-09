
import { StringUtils } from 'susam-components/utils/StringUtils'
export class StringCaseUtils {

    static casing = [
        {
            label: "Capitilize",
            execute: (value, locale) => StringUtils.capitalize(value, locale)
        },
        {
            label: "Upper Case",
            execute: (value, locale) => StringUtils.uppercase(value, locale)
        },
        {
            label: "Title Case",
            execute: (value, locale) => StringUtils.titleCase(value, locale)
        },
        {
            label: "Sentence Case",
            execute: (value, locale) => StringUtils.sentenceCase(value, locale)
        }
    ];
}
