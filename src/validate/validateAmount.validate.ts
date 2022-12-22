import { VALIDATION_ERROR } from "../common"

function _validateAmount(amount: string) {
    if (!amount) {
        throw new Error(VALIDATION_ERROR.MISSING_AMOUNT)
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error(VALIDATION_ERROR.INVALID_AMOUNT)
    }
}
export default _validateAmount