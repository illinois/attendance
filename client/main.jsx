/** @jsx React.DOM */

// Enable React Developer Tools
var React = window.React = require('react');

var App = require('./app.jsx');

React.renderComponent(<App />, document.getElementById('main'));
