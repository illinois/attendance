/** @jsx React.DOM */

var React = require('react/addons');
var $ = require('jquery');

var baseUrl = require('../baseurl');
var NewSectionForm = require('./new-section-form.jsx');
var AddStaffForm = require('./add-staff-form.jsx');

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

    loadCourse: function(id) {
        $.get(baseUrl + '/api/courses/' + id, function(data) {
            this.setState({course: data});
        }.bind(this));
    },

    componentDidMount: function() {
        this.loadCourse(this.props.id);
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({course: null});
            this.loadCourse(nextProps.id);
        }
    },

    // Add the new course to the section list.
    handleNewSection: function(section) {
        var newCourse = React.addons.update(
            this.state.course,
            {sections: {$push: [section]}}
        );
        this.setState({course: newCourse});
    },

    handleAddStaff: function(user) {
        var newCourse = React.addons.update(
            this.state.course,
            {users: {$push: [user]}}
        );
        this.setState({course: newCourse});
    },

    render: function() {
        var course = this.state.course;

        var body;
        if (!course) {
            body = <div>Loading...</div>;
        } else {
            var sections = course.sections.map(function(section) {
                return <a
                    href={baseUrl + '/sections/' + section.id}
                    className="list-group-item"
                    onClick={this.props.handleNav}
                    key={section.id}>
                    {section.name}
                </a>;
            }.bind(this));
            var staff = course.users.map(function(user) {
                return <div key={user.id}>
                    {user.name} ({user.netid})
                </div>;
            });

            body = <div>
                <h1>{this.state.course.name}</h1>
                <h2>Sections</h2>
                <ul className="list-group">
                    {sections}
                </ul>
                <NewSectionForm
                    courseId={this.props.id}
                    onCreateSection={this.handleNewSection} />
                <h2>Staff</h2>
                {staff}
                <AddStaffForm
                    courseId={this.props.id}
                    onAddStaff={this.handleAddStaff} />
            </div>;
        }

        return <div>
            {body}
        </div>;
    }
});

module.exports = CourseView;
