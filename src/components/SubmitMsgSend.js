import {
    createCosmosMsgSend,
  createCosmosPayload,
  createTxMsgSend,
  wrapTypeToArray,
} from '@althea-net/transactions'
import React, { useState } from 'react';
import { connectMetamask, metamaskInstalled, verifyPubKey, GetCurrPubkey, GetCurrAccount, SignEIP712CosmosTx } from '../services/metamask';
import { BroadcastEIP712Tx } from '../services/broadcast';
import getAccountInfo, { altheaToEth, ethToAlthea } from '../services/accountInfo';
import { JSONOptions, convertProtoMessagesToAmino, createMicrotxAminoConverters } from '@althea-net/proto';
import { MsgSend } from '@althea-net/proto/dist/proto/cosmos/bank/tx';
import { AminoJSONOptions, convertProtoValueToMessage } from '@althea-net/proto/dist/amino';

// Presents info about the user's metamask account and allows Bank MsgSend EIP-712 submission. Currently the transaction confirmation is only output to console!
export default function SubmitMsgSend() {
    const [mmConnected, setMmConnected] = useState(false) // Is metamask enabled and have the accounts been fetched?
    const [chainId, setChainId] = useState(defaultChain.chainId) // 417834 OR user input to Chain ID field
    const [cosmosChainId, setCosmosChainId] = useState(defaultChain.cosmosChainId) // althea_417834-3 OR user input to Cosmos Chain ID field
    const [fee, setFee] = useState(defaultFee.amount) // defaultFee.amount OR user input to Fee field
    const [gas, setGas] = useState(defaultFee.gas) // defaultFee.gas OR user input to Gas field
    const [memo, setMemo] = useState("") // a string from the Memo field
    const [to, setTo] = useState("") // a string like 'althea1...' from the To field
    const [amount, setAmount] = useState("") // an integer amount from the Amount field
    const [account, setAccount] = useState("") // The user's fetched MM account address converted from 0x... to althea1...
    const [accountInfo, setAccountInfo] = useState({}) // More info about the user's account like sequence pubkey and account number
    const [currPubkey, setCurrPubkey] = useState("") // The pubkey is not reliable so we fetch it from MM

    function onSubmit() {
        const { context, tx } = createEIP712Params(account, accountInfo.sequence, accountInfo.account_number, currPubkey, fee, gas, chainId, cosmosChainId, memo, to, amount);
        SignEIP712CosmosTx(context, tx).then((signed) => {
            BroadcastEIP712Tx(signed).then((res) => {
                console.log("Tx submitted:", JSON.stringify(res))
            })
        })
    }

    function onConnectMetamask() {
        connectMetamask().then(() => {
            setMmConnected(true);
            const ethAccount = GetCurrAccount();
            const account = ethToAlthea(ethAccount);
            setAccount(account)
            fetchAccountInfo(account)
        });
    }
    function onVerifyPubkey() {
        verifyPubKey().then((v) => {
            setCurrPubkey(GetCurrPubkey());
        });
    }

    const fetchAccountInfo = (address) => {
        console.log("Fetching account info for", address)
        const data = getAccountInfo(address).then((data) => {
            if (data.account) {
                const type = data.account['@type'];
                let base_account;
                if (type.includes("EthAccount")) { // An EthAccount was returned
                    base_account = data.account?.base_account
                } else if (type.includes("BaseAccount")) { // A regular Cosmos account was returned
                    base_account = data.account
                }

                const accInf = {
                    address: base_account.address,
                    pub_key: base_account.pub_key,
                    account_number: base_account.account_number,
                    sequence: base_account.sequence,
                }
                console.log("Fetched account info", JSON.stringify(accInf));
                setAccountInfo(accInf)
            } else {
                setAccountInfo(undefined)
            }

        })
    }

    return (
        <>
            {metamaskInstalled() ? (
                <>
                    {!mmConnected ? (<button onClick={onConnectMetamask}>Connect Metamask</button>) : null}
                    <br />
                    {mmConnected && !currPubkey ? (<button onClick={onVerifyPubkey}>Verify Pubkey</button>) : null}
                    <br />
                    {currPubkey ? (<label>Verified Pubkey:{currPubkey}</label>) : null}
                    {account ? (
                        <label>Account: {account} | {altheaToEth(account)}</label>
                    ):null}

                    {mmConnected && currPubkey ? (
                        <div className='SubmitTx'>
                            <p>Submit a Transaction</p>
                            <label>Chain ID:<input value={chainId} onChange={e => setChainId(e.target.value)} /></label>
                            <br />
                            <label>Cosmos Chain ID:<input value={cosmosChainId} onChange={e => setCosmosChainId(e.target.value)} /></label>
                            <br />
                            <label>Gas:<input value={gas} onChange={e => setGas(e.target.value)} /></label>
                            <br />
                            <label>Memo:<input value={memo} onChange={e => setMemo(e.target.value)} /></label>
                            <br />
                            <label>To:<input value={to} onChange={e => setTo(e.target.value)} /></label>
                            <br />
                            <label>Amount:<input value={amount} onChange={e => setAmount(e.target.value)} /></label>
                            <br />
                            <label>Fee:<input value={fee} onChange={e => setFee(e.target.value)} /></label>
                            <br />
                            <button onClick={onSubmit}>Submit Tx</button>
                        </div>
                    ) : (null)}
                </>
            ) : (
                <p>MetaMask is not installed, please install and then refresh this page</p>
            )}
        </>
    )
}

const defaultFee = {
    amount: '4000000000000000',
    denom: 'aalthea',
    gas: '200000',
}

const defaultChain = {
  chainId: 417834,
  cosmosChainId: 'althea_417834-3',
}

function createEIP712Params(account, sequence, accountNumber, pubKey, feeAmount, gasAmount, chain, cosmosChainId, memo, to, amount) {
    const sender = {
        accountAddress: account,
        sequence: sequence,
        accountNumber: accountNumber,
        pubkey: pubKey,
    };
    const fAmount = (feeAmount || defaultFee.amount);
    const gAmount = (gasAmount || defaultFee.gas);

    const chainParam = {chainId: (chain || defaultChain.chainId), cosmosChainId: (cosmosChainId || defaultChain.cosmosChainId) }

    const txcontext = {
        chain: chainParam,
        sender,
        fee: {amount: fAmount, denom: defaultFee.denom, gas: gAmount},
        memo: (memo || ""),
    }

    const params = {
        destinationAddress: to,
        amount: amount,
        denom: 'aalthea',
    }
    const tx = createTxMsgSend(txcontext, params)
    return {context: txcontext, tx: tx}
}
