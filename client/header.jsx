/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

/**
 * Page header
 */
var Header = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired,
        navigateTo: React.PropTypes.func.isRequired,
        user: React.PropTypes.object.isRequired
    },

    handleLogout: function() {
        $.ajax({
            type: 'DELETE',
            url: '/api/session'
        }).done(function() {
            this.props.navigateTo('/login');
        }.bind(this));
        return false;
    },

    render: function() {
        return <div>
            <ul>
                <li>
                    <a href="/" onClick={this.props.handleNav}>Home</a>
                </li>
                <li>
                    <a href="/logout" onClick={this.handleLogout}>
                        Logout {this.props.user.netid}
                    </a>
                </li>
            </ul>
        </div>;
    }
});

module.exports = Header;
