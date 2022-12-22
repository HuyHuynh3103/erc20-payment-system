import { CONTRACT_ERROR } from './common/error-code.common';
import { BigNumber } from 'ethers/lib/ethers';
import { ethers } from 'ethers';
import constants from './constants';
import axios from 'axios';
import { PAIR_TOKEN } from './enums';
import { VALIDATION_ERROR } from './common';
import { IFeed } from './interfaces';
import { _validateAddress, _validateAmount, _validateChainId, _validateRequiredField } from './validate';
const handlePayment = async (
    {
        _contractAddress,
        _tokenAddress,
        _value,
        _signer,
        _functionName,
        _args,
        _configs
    }: {
        _contractAddress: string
        _tokenAddress: string
        _value: string
        _signer: ethers.providers.JsonRpcSigner,
        _functionName: string,
        _args: Object,
        _configs: { BSC_API_KEY: string }
    }
) => {
    // Validate input
    _validateAddress(_contractAddress)
    _validateAddress(_tokenAddress)
    _validateAddress(_value)
    _validateRequiredField(_functionName)
    _validateRequiredField(_args)
    _validateRequiredField(_configs)
    _validateRequiredField(_signer)
    _validateRequiredField(_configs.BSC_API_KEY)
    
    const { BSC_API_KEY } = _configs;
    const resultGetSourceCode = await axios.get(`https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${_contractAddress}&apikey=${BSC_API_KEY}`)
    const data = resultGetSourceCode.data[0];
    let abi;
    if(data.Proxy === '1'){
        const contractImp = data.Implementation;
        const resultGetSourceCodeImp = await axios.get(`https://api.bscscan.com/api?module=contract&action=getsourcecode&address=${contractImp}&apikey=${BSC_API_KEY}`)
        const dataImp = resultGetSourceCodeImp.data[0];
        abi = JSON.parse(dataImp.ABI)
    }else {
        abi = JSON.parse(data.ABI)
    }
    const _functions = abi.filter((item: any) => item.name === _functionName && item.type === 'function')
    const _function = _functions.find((item: any) => item.inputs.length === Object.keys(_args).length && item.inputs.every((input: any) => Object.keys(_args).includes(input.name)))
    if (!_function) {
        throw new Error(CONTRACT_ERROR.FUNCTION_NAME_NOT_FOUND)
    }
    const tokenContract  = new ethers.Contract(_tokenAddress,constants.abi.erc20,_signer)
    const txApprove = await tokenContract.approve(_contractAddress, _value)
    await txApprove.wait()
    const contract = new ethers.Contract(_contractAddress, abi, _signer)
    const tx = await contract[_functionName](...Object.values(_args))
    await tx.wait()
    return {
        txHash: tx.hash,
        txApproveHash: txApprove.hash
    }
}
const changePrice = async ({chainId, tokenBase, tokenQuote, initialValue} : {chainId: number, tokenBase: string, tokenQuote: string, initialValue: string}) => {
    _validateChainId(chainId);
    _validateAddress(tokenBase);
    _validateAddress(tokenQuote);
    _validateAmount(initialValue);
    if(tokenBase === tokenQuote) {
        throw new Error(VALIDATION_ERROR.TOKEN_BASE_SAME_AS_TOKEN_QUOTE)
    }


    const network = constants.networks.find(network => network.chainId === chainId);
    const provider = new ethers.providers.JsonRpcProvider(network?.rpc);
    async function getSymbol(address: string, provider: ethers.providers.JsonRpcProvider) {
        const tokenContract = new ethers.Contract(address, constants.abi.erc20, provider);
        const symbol = await tokenContract.symbol();
        return symbol;
    }
    const tokenBaseSymbol = await getSymbol(tokenBase, provider);
    const tokenQuoteSymbol = await getSymbol(tokenQuote, provider);
    async function getDirectPrice (pairToken: PAIR_TOKEN, chainId: number, provider: ethers.providers.JsonRpcProvider, initialValue: string) {
        const feed: IFeed | undefined = constants.feeds.find(feed => feed.pairName === pairToken && feed.network?.chainId === chainId);
        if(!feed) {
            throw new Error(VALIDATION_ERROR.UNSUPPORTED_FEED_LIQUIDITY)
        }
        const feedContract = new ethers.Contract(feed.address, constants.abi.feed, provider);
        const latestAnswer: BigNumber =  await feedContract.latestAnswer();
        console.log("price", latestAnswer?.toString());
        const baseValue = BigNumber.from(initialValue).mul(latestAnswer);
        console.log("baseValue", baseValue?.toString());
        return baseValue;
    }
    async function getInDirectPrice (basePair: PAIR_TOKEN, quotePair: PAIR_TOKEN, provider: ethers.providers.JsonRpcProvider, initialValue: string){
        const baseFeed = constants.feeds.find(feed => feed.pairName === basePair && feed.network?.chainId === chainId);
        const quoteFeed = constants.feeds.find(feed => feed.pairName === quotePair && feed.network?.chainId === chainId);
        if(!baseFeed || !quoteFeed) {
            throw new Error(VALIDATION_ERROR.UNSUPPORTED_FEED_LIQUIDITY)
        }
        const baseFeedContract = new ethers.Contract(baseFeed.address, constants.abi.feed, provider);
        const quoteFeedContract = new ethers.Contract(quoteFeed.address, constants.abi.feed, provider);
        const baseLatestAnswer: BigNumber =  await baseFeedContract.latestAnswer();
        const quoteLatestAnswer: BigNumber =  await quoteFeedContract.latestAnswer();
        const baseValue = BigNumber.from(initialValue).mul(baseLatestAnswer).div(quoteLatestAnswer);
        return baseValue;
    }
    let baseValue: BigNumber;
    if(!PAIR_TOKEN[`${tokenBaseSymbol}_${tokenQuoteSymbol}` as keyof typeof PAIR_TOKEN]) {
        if(!PAIR_TOKEN[`${tokenQuoteSymbol}_USD` as keyof typeof PAIR_TOKEN] && !PAIR_TOKEN[`${tokenBaseSymbol}_USD` as keyof typeof PAIR_TOKEN]) {
            throw new Error(VALIDATION_ERROR.UNSUPPORTED_PAIR_TOKEN)
        }else {
            baseValue = await getInDirectPrice(PAIR_TOKEN[`${tokenQuoteSymbol}_USD` as keyof typeof PAIR_TOKEN], PAIR_TOKEN[`${tokenBaseSymbol}_USD` as keyof typeof PAIR_TOKEN], provider, initialValue);
        }
    }else{
        baseValue = await getDirectPrice(PAIR_TOKEN[`${tokenBaseSymbol}_${tokenQuoteSymbol}` as keyof typeof PAIR_TOKEN], chainId, provider, initialValue);
    }

    return {
        tokenBaseSymbol,
        tokenQuoteSymbol,
        baseValue
    }

}
export {
    handlePayment,
    changePrice
};