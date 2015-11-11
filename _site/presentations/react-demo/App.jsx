
window.renderApp = () => {
	ReactDOM.render(<App comments={commentStore.getNestedComments()} />, document.getElementById('mount'));
}

class App extends React.Component {
	render() {
		return (
			<div style={{background: '#F44336',fontFamily: 'sans-serif', paddingRight: '1em'}}>
				<NewCommentForm />
				<CommentsList comments={this.props.comments} />
			</div>
		)
	}
}

renderApp();