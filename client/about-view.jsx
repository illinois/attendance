/** @jsx React.DOM */

var React = require('react');

/**
 * About page view
 */
var AboutView = React.createClass({
    render: function() {
        var kevin = <a href="mailto:klwang3@illinois.edu">Kevin Wang</a>;
        var sourceUrl = 'https://github.com/kevinwang/attendance';
        return <div>
            <h1>About</h1>
            <p>
                Attendance is a card swipe-based attendance/checkin app
                originally developed for CS 225 lab sections. I'm taking
                suggestions for more creative names.
            </p>
            <h2>TODO</h2>
            <p>
                The following features have not yet been implemented; email
                {' '}{kevin} if you need these done:
            </p>
            <ul>
                <li>Create a new course</li>
                <li>Add/remove staff to/from a course</li>
                <li>Rename a section</li>
            </ul>
            <h2>Source</h2>
            <p>
                Source is on <a href={sourceUrl}>GitHub</a>. Attendance is
                built with Node.js and React.
            </p>
        </div>;
    }
});

module.exports = AboutView;
