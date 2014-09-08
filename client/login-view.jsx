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
        var alert = null;
        if (this.state.message) {
            alert = <div className="alert alert-danger" role="alert">
                {this.state.message}
            </div>;
        }
        return <div className="col-md-offset-4 col-md-4">
            <h1>Login</h1>
            {alert}
            <form onSubmit={this.handleLogin}>
                <div className="form-group">
                    <label htmlFor="username">NetID</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        ref="username"
                        value={this.state.username}
                        onChange={this.handleUsernameChange}
                        required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        value={this.state.password}
                        onChange={this.handlePasswordChange}
                        required />
                </div>
                <div className="form-group">
                    <input
                        type="submit"
                        className="btn btn-default"
                        value="Login"
                        disabled={this.state.disabled} />
                </div>
            </form>
        </div>;
    }
});

module.exports = LoginView;
