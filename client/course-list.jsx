/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

var baseUrl = require('../baseurl');

/**
 * List of courses the current user has access to
 */
var CourseList = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            loading: true,
            courses: []
        };
    },

    componentDidMount: function() {
        $.get(baseUrl + '/api/courses', function(data) {
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
            body = this.state.courses.filter(function(course) {
                return !course.isArchived;
            }).map(function(course) {
                return <a
                    href={baseUrl + '/courses/' + course.id}
                    className="list-group-item"
                    onClick={this.props.handleNav}
                    key={course.id}>
                    {course.name}
                </a>;
            }.bind(this));
        }

        return <div>
            <h1>Courses</h1>
            <ul className="list-group">
                {body}
            </ul>
        </div>;
    }
});

module.exports = CourseList;
