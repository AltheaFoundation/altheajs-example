import { generateEndpointAccount, AccountResponse } from '@althea-net/provider';

const grpcweb = "http://localhost:1317";

const restOptions = {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    // mode: 'no-cors',
}

// Note that the node will return a 400 status code if the account does not exist.
export default async function getAccountInfo(account) {
    const queryEndpoint = `${grpcweb}${generateEndpointAccount(account)}`;
    console.log("Querying ", queryEndpoint);
    return fetch(
        queryEndpoint,
        restOptions,
    ).then((res) => res.json())
}