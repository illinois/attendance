/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

/**
 * Login view
 */
var LoginView = React.createClass({
    propTypes: {
        login: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            username: '',
            password: '',
            disabled: false,
            message: ''
        };
    },

    componentDidMount: function() {
        this.refs.username.getDOMNode().focus();
    },

    handleUsernameChange: function(e) {
        this.setState({username: e.target.value});
    },

    handlePasswordChange: function(e) {
        this.setState({password: e.target.value});
    },

    handleLogin: function() {
        this.setState({disabled: true});
        var request = $.ajax({
            type: 'POST',
            url: '/api/session',
            data: {
                username: this.state.username,
                password: this.state.password
            }
        });
        request.done(function(user) {
            this.props.login(user);
        }.bind(this));
        request.fail(function() {
            this.setState({
                disabled: false,
                message: 'Invalid NetID or password.'
            });
        }.bind(this));
        return false;
    },

    render: function() {
        return <div>
            {this.state.message}
            <form onSubmit={this.handleLogin}>
                <label htmlFor="username">NetID</label>
                <input
                    type="text"
                    id="username"
                    ref="username"
                    value={this.state.username}
                    onChange={this.handleUsernameChange}
                    required />
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}
                    required />
                <input
                    type="submit"
                    value="Login"
                    disabled={this.state.disabled} />
            </form>
        </div>;
    }
});

module.exports = LoginView;
