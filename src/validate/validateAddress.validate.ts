import { ethers } from 'ethers';
import { VALIDATION_ERROR } from "../common"

function _validateAddress(address: string) {
    if( !address ) {
        throw new Error(VALIDATION_ERROR.MISSING_CONTRACT_ADDRESS)
    }
    if(!ethers.utils.isAddress(address) || address === ethers.constants.AddressZero) {
        throw new Error(VALIDATION_ERROR.INVALID_CONTRACT_ADDRESS)
    } 
}
export default _validateAddress