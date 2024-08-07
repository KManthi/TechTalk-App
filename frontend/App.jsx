import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Signup from './components/Signup';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/signup" component={Signup} />
          <Route path="/home" component={Home} /> {}
        </Switch>
      </div>
    </Router>
  );
}

export default App;
