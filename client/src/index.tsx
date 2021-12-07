import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import './styles/css/master.css'
import * as serviceWorker from './serviceWorker';
import './styles'

ReactDOM.render(<App />, document.getElementById('rootYes') as HTMLElement)


serviceWorker.unregister();
