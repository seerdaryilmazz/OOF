
export class TruncatedFieldPrinter {

    constructor(wordCount = 3) {
        this.wordCount = wordCount;
    }

    print(value) {
        return this.truncate(value);
    }

    truncate(str) {
        let split = _.split(str, " ");
        let length = split.length;
        return split.splice(0, this.wordCount).join(" ") + (length > this.wordCount ? " ..." : "");
    }
}