window.CommentsList = ({comments}) => {
	return (
		<div>
			{comments.map(comment => <Comment {...comment} />)}
		</div>
	)
}