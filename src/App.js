import logo from './logo.svg';
import './App.css';
import AccountInfo from './components/AccountInfo';
import SubmitTx from './components/SubmitTx';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <AccountInfo/>
        <SubmitTx/>
      </header>
    </div>
  );
}

export default App;
