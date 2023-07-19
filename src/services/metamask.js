import { createTxRaw } from '@althea-net/proto'
import { hashMessage } from '@ethersproject/hash'
import {
  computePublicKey,
  recoverPublicKey,
} from '@ethersproject/signing-key'
import { altheaToEth } from './accountInfo';
import { signatureToWeb3Extension, createTxRawEIP712 } from '@althea-net/transactions';

let mmAccounts;
let currPubkey;

const verifyPubKeyMsg = 'Verify Public Key';

export function metamaskInstalled() {
    return typeof window.ethereum !== 'undefined';
}

export async function connectMetamask() {
    mmAccounts = await window?.ethereum?.request({
        method: 'eth_requestAccounts',
    });
    console.log("Discovered accounts: ", mmAccounts);
}

export async function verifyPubKey() {
    const signature = await window?.ethereum?.request({
        method: 'personal_sign',
        params: [verifyPubKeyMsg, mmAccounts[0], ''],
    })

    // Compress the key, since the client expects
    // public keys to be compressed.
    const uncompressedPk = recoverPublicKey(
        hashMessage(verifyPubKeyMsg),
        signature,
    )

    const hexPk = computePublicKey(uncompressedPk, true)
    const pk = Buffer.from(
        hexPk.replace('0x', ''), 'hex',
    ).toString('base64')
    currPubkey = pk
}

export function GetCurrPubkey() {
    return currPubkey;
}

export function GetCurrAccount() {
    if (mmAccounts && mmAccounts.length > 0) {
        return mmAccounts[0];
    } else {
        return undefined;
    }
}

export async function SignEIP712CosmosTx(context, tx) {
    const { sender, chain } = context

    // Initialize MetaMask and sign the EIP-712 payload.
    await window.ethereum.enable()

    const senderHexAddress = altheaToEth(sender.accountAddress)
    const eip712Payload = JSON.stringify(tx.eipToSign)

    const signature = await window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [senderHexAddress, eip712Payload],
    })

    // Create a signed Tx payload that can be broadcast to a node.
    const signatureBytes = Buffer.from(signature.replace('0x', ''), 'hex')

    const { signDirect } = tx

    const extension = signatureToWeb3Extension(chain, sender, signature);
    const signedTx = createTxRawEIP712(
        tx.legacyAmino.body,
        tx.legacyAmino.authInfo,
        extension
    );

    console.log("Got signed txRaw", signedTx)

    return signedTx
}