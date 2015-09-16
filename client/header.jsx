/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');
var classNames = require('classnames');

var baseUrl = require('../baseurl');

/**
 * Page header
 */
var Header = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired,
        navigateTo: React.PropTypes.func.isRequired,
        user: React.PropTypes.object,
        currentRoute: React.PropTypes.string.isRequired,
        logout: React.PropTypes.func.isRequired
    },

    handleLogout: function(e) {
        e.preventDefault();
        $('#navbar').collapse('hide');
        $.ajax({
            type: 'DELETE',
            url: baseUrl + '/api/session'
        }).done(function() {
            this.props.logout();
        }.bind(this));
    },

    /**
     * Wrapper for handleNav with the added functionality of collapsing the
     * navbar if on mobile.
     */
    handleNavAndCollapse: function() {
        $('#navbar').collapse('hide');
        this.props.handleNav.apply(this, arguments);
    },

    render: function() {
        var userNavItem;
        if (this.props.user) {
            userNavItem = <NavItem
                currentRoute={this.props.currentRoute}
                href={baseUrl + '/logout'}
                handleNav={this.handleLogout}>
                Logout {this.props.user.netid}
            </NavItem>;
        } else {
            userNavItem = <NavItem
                routeName="login"
                currentRoute={this.props.currentRoute}
                href={baseUrl + '/login'}
                handleNav={this.handleNavAndCollapse}>
                Login
            </NavItem>;
        }

        return <nav
            className="navbar navbar-default navbar-static-top"
            role="navigation">
            <div className="container">
                <div className="navbar-header">
                    <button
                        type="button"
                        className="navbar-toggle collapsed"
                        data-toggle="collapse"
                        data-target="#navbar"
                        aria-expanded="false"
                        aria-controls="navbar">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <div className="navbar-header">
                        <a
                            className="navbar-brand"
                            href={baseUrl + '/'}
                            onClick={this.handleNavAndCollapse}>
                            Attendance
                        </a>
                    </div>
                </div>
                <div id="navbar" className="collapse navbar-collapse">
                    <ul className="nav navbar-nav">
                        <NavItem
                            routeName="home"
                            currentRoute={this.props.currentRoute}
                            href={baseUrl + '/'}
                            handleNav={this.handleNavAndCollapse}>
                            Home
                        </NavItem>
                        <NavItem
                            routeName="about"
                            currentRoute={this.props.currentRoute}
                            href={baseUrl + '/about'}
                            handleNav={this.handleNavAndCollapse}>
                            About
                        </NavItem>
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        {userNavItem}
                    </ul>
                </div>
            </div>
        </nav>;
    }
});

var NavItem = React.createClass({
    propTypes: {
        routeName: React.PropTypes.string,
        currentRoute: React.PropTypes.string.isRequired,
        href: React.PropTypes.string.isRequired,
        handleNav: React.PropTypes.func.isRequired
    },

    render: function() {
        var routeName = this.props.routeName;
        var currentRoute = this.props.currentRoute;
        var classes = classNames({
            'active': this.props.routeName === this.props.currentRoute
        });
        return <li className={classes}>
            <a href={this.props.href} onClick={this.props.handleNav}>
                {this.props.children}
            </a>
        </li>;
    }
});

module.exports = Header;
