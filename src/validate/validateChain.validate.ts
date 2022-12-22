import { VALIDATION_ERROR } from "../common";
import constants from "../constants";

const _validateChainId = (chainId: number): void => {
    if(!chainId) {
        throw new Error(VALIDATION_ERROR.MISSING_CHAIN_ID)
    };
    const chainIds = constants.networks.map(network => network.chainId);
    if(!chainIds.includes(chainId)) {
        throw new Error(VALIDATION_ERROR.UNSUPPORTED_CHAIN_ID)
    }
}
export default _validateChainId