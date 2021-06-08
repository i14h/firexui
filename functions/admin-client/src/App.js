import logo from "./logo.svg";
import "./App.css";
import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState('Loading...')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get('admin/work');

        setData(result.status + ' ' + result.data);
      } catch(e) {
        if(e.isAxiosError) {
          const result = e.response;

        setData(result.status + ' ' + result.data);
        } else {
          setData(e.message);
        }
      }
    }

    fetchData();
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>This is the Admin WebApp.</p>

        <p>POST admin/work response -- {data}</p>

        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
