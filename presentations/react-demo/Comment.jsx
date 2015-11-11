window.Comment = (props) => {
	return (
		<div style={{paddingLeft: '1em',paddingBottom: '1em'}}>
			<div style={{background: 'white',padding: '1em'}}>
				{props.message}
			</div>
			{props.showReplyTo ? <NewCommentForm replyToId={props.commentId} /> : undefined}
			<div>
				<button type="button" onClick={setReplyTo.bind(null,props.commentId,!props.showReplyTo)}>
					{props.showReplyTo ? 'cancel' : 'reply'}
				</button>
			</div>
			{props.subComments.length ? 
				<div style={{paddingTop: '1em'}}>
					<CommentsList comments={props.subComments} />
				</div> : undefined 
			}
		</div>
	)
}