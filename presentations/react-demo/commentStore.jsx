const comments = [
	{ commentId: 1, message: 'First!' },
	{ commentId: 2, message: 'FIRST!!!!' },
	{ commentId: 3, message: 'How about no, lol!', inReplyTo: 2 }
];

const replyingTo = {}

window.commentStore = {
	setReplyTo: (commentId,active) => {
		if(active)
			replyingTo[commentId] = {message: ''};
		else
			delete replyingTo[commentId];
		renderApp();
	},
	editReplyToText: (commentId,message) => {
		replyingTo[commentId] = {message:message};
		renderApp();
	},
	addReply: (commentId,message) => {
		delete replyingTo[commentId];
		const newCommentId = Math.max.apply(undefined,comments.map(comment => comment.commentId)) + 1;
		comments.push({commentId: newCommentId, message, inReplyTo: commentId});
		renderApp();
	},
	getNestedComments: function(){
		return comments.filter(comment => !comment.inReplyTo)
				.map(function nest(comment) {
					return { ...comment,
							replyingTo: replyingTo[comment.commentId],
						subComments: comments.filter(subComment => subComment.inReplyTo === comment.commentId).map(nest)
				}
	});
}
}