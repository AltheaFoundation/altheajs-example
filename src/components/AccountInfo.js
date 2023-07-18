import getAccountInfo from '../services/accountInfo';
import { useEffect, useState } from 'react';

const acc = "althea14jjatu7u3h07sgyfqv2r2z79qlmy5lrw27asjm"

// Presents info about an account, which receives input from a text box and queries when an Update button is clicked
export default function AccountInfo() {
  const [initialized, setInitialized] = useState(false);
  const [account, setAccount] = useState({})
  const [input, setInput] = useState(acc)

  function onSubmit() {
    fetchAccountInfo(input)
  }

  useEffect(() => {
    if (!initialized) {
      fetchAccountInfo(input);
      setInitialized(true);
    }
  })

  const fetchAccountInfo = (address) => {
    const data = getAccountInfo(address).then((data) => {
      if (data.account) {
        const base_account = data.account?.base_account
        const accInf = {
          address: base_account.address,
          pub_key: base_account.pub_key,
          account_number: base_account.account_number,
          sequence: base_account.sequence,
        }
        setAccount(accInf)
      } else {
        setAccount(undefined)
      }
    })
  }

 return (
  <>
    <>
      <label>Address: <input value={input} onChange={e => setInput(e.target.value)}></input></label>
      <button onClick={onSubmit}>Update</button>
    </>
    {account ? (
    <div className="AccountInfo">
        <p>Account: {account.address}</p>
        {account.pub_key ? <p>pub_key: {account.address}</p> : null}
        <p>Account Number: {account.account_number}</p>
        <p>Sequence: {account.sequence}</p>
    </div>
    ):(
      <p>Invalid address provided</p>
    )}
      
  </>
  )
}