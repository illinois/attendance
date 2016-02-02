/** @jsx React.DOM */

var React = require('react');
var update = require('react-addons-update');
var $ = require('jquery');
var classNames = require('classnames');

var baseUrl = require('../baseurl');
var NewSectionForm = require('./new-section-form.jsx');
var StaffList = require('./staff-list.jsx');
var StudentLookupForm = require('./student-lookup-form.jsx');

var CourseView = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired,
        id: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            course: null,
            checkins: []
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
        var newCourse = update(
            this.state.course,
            {sections: {$push: [section]}}
        );
        this.setState({course: newCourse});
    },

    handleStudentLookup: function(result) {
        this.setState({checkins: result.checkins});
    },

    render: function() {
        var course = this.state.course;

        var body;
        if (!course) {
            body = <div>Loading...</div>;
        } else {
            var sections = course.sections.map(function(section) {
                var highlight = this.state.checkins.some(function(checkin) {
                    return checkin.SectionId == section.id;
                });
                var classes = classNames('list-group-item', {
                    'list-group-item-success': highlight
                });
                return <a
                    href={baseUrl + '/sections/' + section.id}
                    className={classes}
                    onClick={this.props.handleNav}
                    key={section.id}>
                    {section.name}
                </a>;
            }.bind(this));

            body = <div>
                <div className="row">
                    <div className="col-md-12">
                        <h1>{this.state.course.name}</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-8">
                        <h2>Sections</h2>
                        <StudentLookupForm
                            courseId={this.props.id}
                            onStudentLookup={this.handleStudentLookup} />
                        <ul className="list-group">
                            {sections}
                        </ul>
                        <NewSectionForm
                            courseId={this.props.id}
                            onCreateSection={this.handleNewSection} />
                    </div>
                    <div className="col-md-4">
                        <h2>Staff</h2>
                        <StaffList
                            courseId={this.props.id}
                            initialStaff={course.users} />
                    </div>
                </div>
            </div>;
        }

        return body;
    }
});

module.exports = CourseView;
