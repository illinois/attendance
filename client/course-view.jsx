/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

var CourseView = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired,
        id: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            course: null
        };
    },

    componentDidMount: function() {
        $.get('/api/courses/' + this.props.id, function(data) {
            this.setState({course: data});
        }.bind(this));
    },

    render: function() {
        var course = this.state.course;

        var body;
        if (!course) {
            body = <div>Loading...</div>;
        } else {
            var sections = course.sections.map(function(section) {
                return <div key={section.id}>
                    <a
                        href={'/sections/' + section.id}
                        onClick={this.props.handleNav}>
                        {section.name}
                    </a>
                </div>;
            }.bind(this));
            var staff = course.users.map(function(user) {
                return <div key={user.id}>
                    {user.name} ({user.netid})
                </div>;
            });

            body = <div>
                <h1>{this.state.course.name}</h1>
                <h2>Sections</h2>
                {sections}
                <h2>Staff</h2>
                {staff}
            </div>;
        }

        return <div>
            {body}
        </div>;
    }
});

module.exports = CourseView;
