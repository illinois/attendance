/** @jsx React.DOM */

var React = require('react');
var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');

// Enable React Developer Tools
window.React = React;
window.$ = $;

var baseUrl = require('../baseurl');
var Header = require('./header.jsx');
var HomeView = require('./home-view.jsx');
var LoginView = require('./login-view.jsx');
var AboutView = require('./about-view.jsx');
var CourseView = require('./course-view.jsx');
var SectionView = require('./section-view.jsx');

/**
 * Top-level application component
 *
 * Handles routing.
 */
var App = React.createClass({
    propTypes: {
        initialUser: React.PropTypes.object
    },

    getInitialState: function() {
        return {
            route: null,
            view: null,
            user: this.props.initialUser
        };
    },

    shouldComponentUpdate: function(nextProps, nextState) {
        return nextState.view !== this.state.view;
    },

    initializeRouter: function() {
        var self = this;
        var Router = Backbone.Router.extend({
            routes: {
                '': 'home',
                'login': 'login',
                'about': 'about',
                'courses/:id': 'course',
                'sections/:id': 'section'
            },
            home: function() {
                self.setState({
                    route: 'home',
                    view: <HomeView handleNav={self.handleNav} />
                });
            },
            login: function() {
                self.setState({
                    route: 'login',
                    view: <LoginView login={self.login} />
                });
            },
            about: function() {
                self.setState({
                    route: 'about',
                    view: <AboutView />
                });
            },
            course: function(id) {
                self.setState({
                    route: 'course',
                    view: <CourseView
                        handleNav={self.handleNav}
                        id={parseInt(id)} />
                });
            },
            section: function(id) {
                self.setState({
                    route: 'section',
                    view: <SectionView
                        handleNav={self.handleNav}
                        id={parseInt(id)} />
                });
            }
        });
        this.router = new Router();
        Backbone.history.start({pushState: true, root: baseUrl});
    },

    componentWillMount: function() {
        this.initializeRouter();

        if (!this.props.initialUser) {
            this.navigateTo('/login');
        }
    },

    login: function(user) {
        this.setState({user: user});
        this.navigateTo('/');
    },

    logout: function() {
        this.setState({user: null});
        this.navigateTo('/login');
    },

    // onClick handler for <a> tags
    handleNav: function(e) {
        if (!this.state.user) {
            this.navigateTo('/login');
        } else {
            // Strip baseUrl from href for Backbone Router
            var baseUrlRe = new RegExp('^' + baseUrl);
            var path = e.currentTarget.pathname;
            this.navigateTo(path.replace(baseUrlRe, ''));
        }
        return false;
    },

    navigateTo: function(path) {
        this.router.navigate(path, {trigger: true});
    },

    render: function() {
        return <div>
            <Header
                handleNav={this.handleNav}
                navigateTo={this.navigateTo}
                user={this.state.user}
                currentRoute={this.state.route}
                logout={this.logout} />
            <div className="container">
                {this.state.view}
            </div>
        </div>;
    }
});

module.exports = App;
