import logo from './logo.svg';
import './App.css';
import Tabs from './components/Tabs';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Tabs/>
      </header>
    </div>
  );
}

export default App;
