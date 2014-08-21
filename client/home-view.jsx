/** @jsx React.DOM */

var React = require('react');

/**
 * Home view
 */
var HomeView = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired
    },

    render: function() {
        return <div>Home view</div>;
    }
});

module.exports = HomeView;
