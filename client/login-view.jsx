/** @jsx React.DOM */

var React = require('react');

/**
 * Login view
 */
var LoginView = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired
    },

    render: function() {
        return <div>Login view</div>;
    }
});

module.exports = LoginView;
