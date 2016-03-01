/** @jsx React.DOM */

var React = require('react');
var $ = require('jquery');
var Modal = require('react-bootstrap/lib/Modal');
var Button = require('react-bootstrap/lib/Button');

var baseUrl = require('../baseurl');
var CheckinForm = require('./checkin-form.jsx');
var CommentSection = require('./comment-section.jsx');

var SectionView = React.createClass({
    propTypes: {
        handleNav: React.PropTypes.func.isRequired,
        id: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            section: null,
            renameName: '',
            renameModalExpanded: false
        };
    },

    loadSection: function(id) {
        $.get(baseUrl + '/api/sections/' + id, function(data) {
            this.setState({section: data});
        }.bind(this));
    },

    componentDidMount: function() {
        this.loadSection(this.props.id);
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.id !== this.props.id) {
            this.setState({section: null});
            this.loadSection(nextProps.id);
        }
    },

    modalOnEntered: function() {
        this.refs.name.select();
    },

    handleRename: function(e) {
        e.preventDefault();
        this.setState({
            renameName: this.state.section.name,
            renameModalExpanded: true
        });
    },

    handleRenameNameChange: function(e) {
        this.setState({renameName: e.target.value});
    },

    handleRenameSubmit: function(e) {
        e.preventDefault();
        $.ajax({
            type: 'PUT',
            url: baseUrl + '/api/sections/' + this.props.id,
            data: {name: this.state.renameName}
        })
        .done(function(result) {
            this.setState({section: result});
            this.closeModal();
        }.bind(this));
    },

    closeModal: function() {
        this.setState({renameModalExpanded: false});
    },

    render: function() {
        if (!this.state.section) {
            return <div>Loading...</div>;
        }

        var id = this.props.id;
        return <div>
            <Modal
                show={this.state.renameModalExpanded}
                onEntered={this.modalOnEntered}
                onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Rename section</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Enter new name for this section:
                    </p>
                    <form onSubmit={this.handleRenameSubmit}>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            ref="name"
                            placeholder="Name"
                            value={this.state.renameName}
                            onChange={this.handleRenameNameChange} />
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Cancel</Button>
                    <Button
                        bsStyle="primary"
                        onClick={this.handleRenameSubmit}>
                        Rename
                    </Button>
                </Modal.Footer>
            </Modal>
            <a
                href={baseUrl + '/courses/' + this.state.section.CourseId}
                onClick={this.props.handleNav}>
                &laquo; Back to course
            </a>
            <div className="row">
                <div className="col-md-12">
                    <h1>
                        {this.state.section.name}
                        <a
                            href="#"
                            className="section-rename-icon"
                            onClick={this.handleRename}>
                            <span
                                className="glyphicon glyphicon-edit"
                                aria-hidden="true" />
                        </a>
                    </h1>
                </div>
            </div>
            <div className="row">
                <div className="col-md-6">
                    <CheckinForm sectionId={id} />
                    <a
                        href={baseUrl + '/api/sections/' + id + '/checkins.csv'}
                        className="btn btn-default"
                        download>
                        Export to CSV
                    </a>
                </div>
                <div className="col-md-6">
                    <CommentSection sectionId={id} />
                </div>
            </div>
        </div>;
    }
});

module.exports = SectionView;
