import {
  Chain,
  Sender,
  Fee,
  TxContext,
  MsgSendParams,
  createTxMsgSend,
  TxPayload,
} from '@althea-net/transactions'
import { bech32Chain } from '@althea-net/address-converter'
import { Option } from '@bufbuild/protobuf';
import React, { useState, useEffect } from 'react';
import { connectMetamask, metamaskInstalled, verifyPubKey, GetCurrPubkey, GetCurrAccount, SignEIP712CosmosTx } from '../services/metamask';
import { BroadcastEIP712Tx } from '../services/broadcast';
import getAccountInfo, { ethToAlthea } from '../services/accountInfo';
import { pubkeyToAddress } from '@cosmjs/amino';

export default function SubmitTx() {
    const [initialized, setInitialized] = useState(false)
    const [mmConnected, setMmConnected] = useState(false)
    const [chainId, setChainId] = useState(defaultChain.chainId)
    const [cosmosChainId, setCosmosChainId] = useState(defaultChain.cosmosChainId)
    const [fee, setFee] = useState(defaultFee.amount)
    const [gas, setGas] = useState(defaultFee.gas)
    const [memo, setMemo] = useState("")
    const [to, setTo] = useState("")
    const [amount, setAmount] = useState("")
    const [account, setAccount] = useState({})
    const [accountInfo, setAccountInfo] = useState({})
    const [currPubkey, setCurrPubkey] = useState("")

    useEffect(() => {
        if (!initialized) {
            setInitialized(true);
        }
    }, [initialized])

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
            console.log("Eth account", ethAccount);
            const account = ethToAlthea(ethAccount);
            console.log("Althea account", account);
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
                console.log("Got data", JSON.stringify(data))
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
                </>
            ) : (null)}
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
    console.log("Creating EIP712 Params:", account, sequence, accountNumber, pubKey, feeAmount, gasAmount, chain, memo, to, amount);
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

    const tx = createTxMsgSend(txcontext, params);

    return {context: txcontext, tx: tx}
}