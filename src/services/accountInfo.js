import { generateEndpointAccount, AccountResponse } from '@althea-net/provider';
import { ETH, bech32Chain } from '@althea-net/address-converter';
import { nodeurl } from '../constants/nodeConstants';

const restOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json'},
    // mode: 'no-cors', // This option will break the request in a confusing way when cors support is available
}

// Note that the node will return a 400 status code if the account does not exist.
export default async function getAccountInfo(account) {
    const queryEndpoint = `${nodeurl}${generateEndpointAccount(account)}`;
    console.log("Querying ", queryEndpoint);
    return fetch(
        queryEndpoint,
        restOptions,
    ).then((res) => res.json())
}

export const ALTHEA = bech32Chain('ALTHEA', 'althea');
export const ethToAlthea = (ethAddress) => {
    const data = ETH.decoder(ethAddress);
    return ALTHEA.encoder(data);
};
export const altheaToEth = (altheaAddress) => {
    const data = ALTHEA.decoder(altheaAddress);
    return ETH.encoder(data);
}