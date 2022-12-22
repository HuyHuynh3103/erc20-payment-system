import { VALIDATION_ERROR } from "../common";

function _validateRequiredField(field: any) {
    if (field === undefined || field === null || field === '' ) {
        throw new Error(VALIDATION_ERROR.MISSING_REQUIRED_FIELD);
    }
    return true;
}
export default _validateRequiredField