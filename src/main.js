import React from 'react';
import ReactDOM from 'react-dom';
import Chat from './Chat';

document.addEventListener('DOMContentLoaded', function() {
  ReactDOM.render(
    React.createElement(Chat),
    document.getElementById('mount')
  );
});
