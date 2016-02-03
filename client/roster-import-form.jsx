/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');
var moment = require('moment');

var baseUrl = require('../baseurl');
var Modal = require('react-bootstrap/lib/Modal');
var Button = require('react-bootstrap/lib/Button');

var RosterImportForm = React.createClass({
    propTypes: {
        courseId: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            showModal: false,
            uploading: false,
            rosterCount: null,
            lastUpdated: null,
            alertMessage: null
        };
    },

    componentDidMount: function() {
        var id = this.props.courseId;
        var url = baseUrl + '/api/courses/' + id + '/roster';
        $.get(url, function(data) {
            this.setState({
                rosterCount: data.count,
                lastUpdated: data.lastUpdated
            });
        }.bind(this));
    },

    openModal: function() {
        this.setState({
            showModal: true,
            alertMessage: null
        });
    },

    closeModal: function() {
        this.setState({showModal: false});
    },

    handleSubmit: function(e) {
        e.preventDefault();

        var files = this.refs.roster.files;
        if (files.length === 0) {
            this.setState({alertMessage: 'Please select a file'});
            return;
        }

        this.setState({uploading: true});

        var id = this.props.courseId;
        var data = new FormData();
        data.append('roster', files[0]);
        $.ajax({
            type: 'POST',
            url: baseUrl + '/api/courses/' + id + '/roster',
            data: data,
            processData: false,
            contentType: false
        })
        .done(function(result) {
            this.setState({
                rosterCount: result.count,
                lastUpdated: result.lastUpdated,
                uploading: false
            });
            this.closeModal();
        }.bind(this))
        .fail(function(xhr) {
            var alertMessage;
            if (xhr.status === 400) {
                alertMessage = 'Invalid roster file';
            } else {
                alertMessage = 'Import failed';
            }
            this.setState({
                alertMessage: alertMessage,
                uploading: false
            });
        }.bind(this));
    },

    renderDetails: function() {
        var count = this.state.rosterCount;
        if (count !== null){
            if (count > 0) {
                var m = moment(this.state.lastUpdated);
                var dateString = m.format('MMMM Do YYYY, h:mm:ss a');
                return <div>
                    <p>{count} students in roster</p>
                    <p>Last updated: {dateString}</p>
                </div>;
            } else {
                return <div>
                    <p>Roster is empty</p>
                </div>;
            }
        } else if (count === null) {
            return <div>
                <p>Loading...</p>
            </div>;
        }
    },

    render: function() {
        var count = this.state.rosterCount;
        var alert = null;
        if (this.state.alertMessage !== null) {
            alert = <div className="alert alert-danger" role="alert">
                {this.state.alertMessage}
            </div>;
        }
        return <div>
            <Modal
                show={this.state.showModal}
                onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Import roster</Modal.Title>
                </Modal.Header>
                <form onSubmit={this.handleSubmit}>
                    <Modal.Body>
                        <div className="form-group">
                            {alert}
                            <p>
                                You can download the roster from the
                                {' '}
                                <a href="https://my.cs.illinois.edu/">
                                    My.CS Portal
                                </a>
                                {' '}
                                by selecting all lecture sections and clicking
                                "Export to Excel."
                            </p>
                            <label htmlFor="roster">Roster file</label>
                            <input type="file" id="roster" ref="roster" />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.closeModal}>Cancel</Button>
                        <Button
                            type="submit"
                            bsStyle="primary"
                            disabled={this.state.uploading}>
                            {this.state.uploading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
            {this.renderDetails()}
            <button
                className="btn btn-default"
                onClick={this.openModal}>
                Import roster
            </button>
        </div>;
    }
});

module.exports = RosterImportForm;
