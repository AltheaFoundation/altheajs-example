# Example transaction submission to Althea-L1 using Metamask and altheajs

This site is a simple React page with the ability to query an account on Althea-L1 / submit a bank MsgSend or microtx MsgLiquify transaction signed by MetaMask to Althea-L1.

# Message submission flow

The UI for message submission is nested under a simple [tab-based interface](./src/components/Tabs.js) and consists of one of two components: [SubmitMsgSend](./src/components/SubmitMsgSend.js) or [SubmitMsgLiquify](./src/components/SubmitMsgLiquify.js).
Any message to be submitted must have a [@bufbuild-based protobuf definition](https://github.com/bufbuild/protobuf-es/tree/main/packages/protoc-gen-es) (note that hosting using buf.build is optional, Althea-L1 currently uses both hosted and github-based proto definitions), see the [microtx module's defintions here](https://github.com/althea-net/altheajs/blob/main/packages/proto/src/proto/microtx/v1/msgs_pb.ts).
Additionally, the message must implement the [LegacyAmino LegacyMsg interface](https://github.com/cosmos/cosmos-sdk/blob/v0.45.16/x/auth/legacy/legacytx/stdsign.go#L22-L35), so check that the Msgs have `Type()` and `GetSignBytes()` implemented.

The message generation starts after the user has verified their pubkey by signing a simple string "Verify Public Key" defined in [the metamask service](./src/services/metamask.js). One of the SubmitMsg* components will then present several simple text input fields which will be used to populate the associated Msg.
Once the user clicks SubmitTx the parameters are collected, formatted, and packed for use by the [`SignEIP712CosmosTx()` function](./src/services/metamask.js) and the result is then passed to [`BroadcastEIP712Tx()` in the broadcast service](./src/services/broadcast.js).

## Resources

See [altheajs](https://github.com/althea-net/altheajs) for more info about the javascript/typescript libraries used.

See [Althea-L1](https://github.com/althea-net/althea-L1) for proto source definitions, chain logic, solidity contracts, and more!