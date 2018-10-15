import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'mobx-react';
import './fonts.css';
import './sweet-alert-custom.css';
import './index.css';
import App from './App';
import Store from './models/Store';

global.PRODUCTION = process.env.NODE_ENV === 'production';
const store = new Store();
global.store = store;

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>
, document.getElementById('root'));
