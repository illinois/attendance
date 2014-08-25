/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');

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
                    <a
                        href={'/courses/' + course.id}
                        onClick={this.props.handleNav}>
                        {course.name}
                    </a>
                </div>;
            }.bind(this));
        }

        return <div>
            <h1>Courses</h1>
            {body}
        </div>;
    }
});

module.exports = CourseList;
