/** @jsx React.DOM */

var React = require('react');
var update = require('react-addons-update');
var Modal = require('react-bootstrap/lib/Modal');
var Button = require('react-bootstrap/lib/Button');

var baseUrl = require('../baseurl');
var AddStaffForm = require('./add-staff-form.jsx');

var StaffList = React.createClass({
    propTypes: {
        courseId: React.PropTypes.number.isRequired,
        initialStaff: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    },

    getInitialState: function() {
        return {
            staff: this.props.initialStaff,
            removeTarget: null
        };
    },

    handleAddStaff: function(user) {
        var newStaff = update(
            this.state.staff,
            {$push: [user]}
        );
        this.setState({staff: newStaff});
    },

    handleRemoveStaff: function(user, e) {
        e.preventDefault();
        this.setState({removeTarget: user});
    },

    handleConfirmRemove: function() {
        var courseId = this.props.courseId;
        var userId = this.state.removeTarget.id;
        var url = baseUrl + '/api/courses/' + courseId + '/staff/' + userId;
        $.ajax({
            type: 'DELETE',
            url: url
        })
        .done(function(result) {
            var index = this.state.staff.indexOf(this.state.removeTarget);
            var newStaff = update(
                this.state.staff,
                {$splice: [[index, 1]]}
            );
            this.setState({staff: newStaff});
            this.closeModal();
        }.bind(this));
    },

    closeModal: function() {
        this.setState({removeTarget: null});
    },

    render: function() {
        var staff = this.state.staff.map(function(user) {
            return <div key={user.id}>
                {user.name} ({user.netid})
                {' '}
                <a
                    href="#"
                    onClick={this.handleRemoveStaff.bind(this, user)}>
                    &#x2715;
                </a>
            </div>;
        }.bind(this));

        return <div>
            <Modal
                show={this.state.removeTarget !== null}
                onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Remove staff</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to remove this staff member?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.closeModal}>Cancel</Button>
                    <Button
                        bsStyle="danger"
                        onClick={this.handleConfirmRemove}>
                        Remove
                    </Button>
                </Modal.Footer>
            </Modal>
            {staff}
            <AddStaffForm
                courseId={this.props.courseId}
                onAddStaff={this.handleAddStaff} />
        </div>;
    }
});

module.exports = StaffList;
