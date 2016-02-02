/** @jsx React.DOM */

var React = require('react');
var update = require('react-addons-update');
var $ = require('jquery');
var moment = require('moment');
var marked = require('marked');
marked.setOptions({sanitize: true});

var baseUrl = require('../baseurl');

/**
 * Comments and comment form for given section
 */
var CommentSection = React.createClass({
    propTypes: {
        sectionId: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            loading: true,
            comments: [],
            commentText: '',
            disabled: false
        };
    },

    componentDidMount: function() {
        var id = this.props.sectionId;
        var url = baseUrl + '/api/sections/' + id + '/comments';
        $.get(url, function(data) {
            this.setState({
                loading: false,
                comments: data.comments
            });
        }.bind(this));
    },

    handleCommentTextChange: function(e) {
        this.setState({commentText: e.target.value});

        // Scroll to bottom of page after preview renders
        setTimeout(function() {
            window.scrollTo(0, document.body.scrollHeight);
        }, 0);
    },

    handleSubmit: function(e) {
        e.preventDefault();
        if (!this.state.commentText) {
            return;
        }
        this.setState({disabled: true});

        var id = this.props.sectionId;
        $.ajax({
            type: 'POST',
            url: baseUrl + '/api/sections/' + id + '/comments',
            data: {text: this.state.commentText}
        })
        .done(function(result) {
            var newComments = update(
                this.state.comments,
                {$push: [result]}
            );
            this.setState({
                commentText: '',
                comments: newComments,
                disabled: false
            });
        }.bind(this));
    },

    render: function() {
        if (this.state.loading) {
            return <div>
                <h2 className="comment-section-heading">Comments</h2>
                Loading...
            </div>;
        }

        var comments = this.state.comments.map(function(comment) {
            var time = moment(comment.createdAt).calendar();
            var textHTML = marked(comment.text);

            return <div key={comment.id} className="comment">
                <div className="comment-header">
                    <span className="comment-name">
                        {comment.user.name}
                    </span>
                    <span className="comment-netid">
                        ({comment.user.netid})
                    </span>
                    <span className="comment-timestamp">
                        {time}
                    </span>
                </div>
                <div dangerouslySetInnerHTML={{__html: textHTML}} />
            </div>;
        });

        var preview = null;
        if (this.state.commentText) {
            previewHTML = marked(this.state.commentText);
            preview = <div>
                <h3>Preview</h3>
                <div dangerouslySetInnerHTML={{__html: previewHTML}} />
            </div>;
        }

        return <div>
            <h2 className="comment-section-heading">Comments</h2>
            {comments}
            {preview}
            <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <textarea
                        className="form-control"
                        value={this.state.commentText}
                        onChange={this.handleCommentTextChange}
                        required />
                </div>
                <div className="form-group">
                    <input
                        type="submit"
                        className="btn btn-default"
                        value="Post"
                        disabled={this.state.disabled} />
                </div>
            </form>
        </div>;
    }
});

module.exports = CommentSection;
