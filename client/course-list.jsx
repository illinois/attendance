/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');
var _ = require('underscore');

/**
 * List of courses the current user has access to
 */
var CourseList = React.createClass({
    getInitialState: function() {
        return {
            loading: true,
            courses: []
        };
    },

    componentDidMount: function() {
        $.get('/api/courses', function(data) {
            this.setState({
                loading: false,
                courses: data.courses
            });
        }.bind(this));
    },

    render: function() {
        var body;
        if (this.state.loading) {
            body = <div>Loading...</div>;
        } else {
            body = this.state.courses.map(function(course) {
                return <div key={course.id}>
                    {course.name}
                </div>;
            });
        }

        return <div>
            <h1>Courses</h1>
            {body}
        </div>;
    }
});

module.exports = CourseList;
