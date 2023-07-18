import {
  Chain,
  Sender,
  Fee,
  TxContext,
  MsgSendParams,
  createTxMsgSend,
  TxPayload,
} from '@althea-net/transactions'

const chain = {
  chainId: 417834,
  cosmosChainId: 'althea_417834-3',
}

export default function SubmitTx() {
// Populate the transaction sender parameters using the
// query API.
const sender = {
  accountAddress: '' ,
  sequence: '',
  accountNumber: '',
  // Use the public key from the account query, or retrieve
  // the public key from the code snippet above.
  pubkey: '',
};

const fee = {
  amount: '4000000000000000',
  denom: 'aalthea',
  gas: '200000',
}

const memo = ''

const txcontext = {
  chain,
  sender,
  fee,
  memo,
}

const params = {
  destinationAddress: '',
  amount: '',
  denom: 'aalthea',
}

const tx = createTxMsgSend(txcontext, params)

    return(
        <>
            <div className='SubmitTx'>
                <p>Submit a Transaction</p>
            </div>
        </>
    )
}