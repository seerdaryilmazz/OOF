
export class MessageUtils {

    static createParameterizedErrorMessage(errorMessage, args) {
        return {
            response: {
                data: {
                    message: errorMessage,
                    args: args
                }
            }
        };
    }
}