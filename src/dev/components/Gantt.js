import React, { Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Scheduler from 'legit-scheduler'
const socket = io.connect();
import moment from 'moment';
class Gantt extends Component {
	static contextTypes = {
		router: PropTypes.object
	}
	constructor(props) {
		super(props);
		this.state = {
			events:[],
			resources:[],
			showNotification:true,
			notificationText:"กำลังดาวน์โหลด..."
		}
	}
	componentDidMount() {
		socket.emit('list:members', {}, (result) => {
			if(result){
				var mem = [];
				result.map(function(item){
					mem.push(item.firstName);
				});
				this.setState({resources:mem});
			}
		});
		socket.emit('list:events', {bid:this.props.boardId}, (result) => {
			if(result){
				this.setState({events:result.events});
			}
		});
		this.setState({showNotification:false});
	}
	eventChanged(props) {
		const index = this.state.events.findIndex(event => event.id === props.id)
		const newEvents = this.state.events
		newEvents[index] = props
		this.setState({ ...props, events: newEvents });
		var start = new Date(props.startDate);
		start.setHours(0,0,0,0);
		var end = new Date(props.startDate);
		end.setHours(0,0,0,0);
		end.setDate(end.getDate() + (props.duration - 1));
		// console.log('user : ' +props.resource+' start : '+start.getTime()+' end : '+end.getTime()+' id : '+props.id);
		socket.emit('save:card', { 
			cid:parseInt(props.id),
			data:{start:start.getTime(),end:end.getTime(),user:props.resource,},
			cmd:'drop'
		}, (result) => {
			if(result){
				this.setState({ ...props, events: newEvents });
			}
		});
	}

	eventResized(props) {
		const index = this.state.events.findIndex(event => event.id === props.id)
		const newEvents = this.state.events
		newEvents[index] = props
		var start = new Date(props.startDate);
		start.setHours(0,0,0,0);

		var end = new Date(props.startDate);
		end.setHours(0,0,0,0);

		end.setDate(end.getDate() + (props.duration - 1));
		// console.log(' start : '+start.getTime()+' end : '+end.getTime()+' id : '+props.id);
		socket.emit('save:card', { 
			cid:parseInt(props.id),
			data:{start:start.getTime(),end:end.getTime()},
			cmd:'date'
		}, (result) => {
			if(result){
				this.setState({ ...props, events: newEvents });
			}
		});
	}

	eventClicked(props) {
		this.props.showCard({showCard:true,idCard:parseInt(props.id)});
	}

	cellClicked(resource, date) {
		
	}

	rangeChanged(range) {

	}
	render(){
		var date = new Date();
		// 	from={new Date(date.getFullYear(), date.getMonth(), 1)}
		// to={new Date(date.getFullYear(), date.getMonth() + 1, 0)}
		return(
			<div>
			<Scheduler
			resources={this.state.resources}
			events={this.state.events}
			width={1135}
			onEventChanged={this.eventChanged.bind(this)}
			onEventResized={this.eventResized.bind(this)}
			onEventClicked={this.eventClicked.bind(this)}
			onCellClicked={this.cellClicked.bind(this)}
			onRangeChanged={this.rangeChanged.bind(this)}
			/>
			</div>
			)
	}
}
var Notification = React.createClass({
	render:function(){
		return (<div id="notification">{this.props.text}</div>);
	}
});
function mapStateToProps (state) {
	return { session: state.session }
}
function onlyUnique(value, index, self) { 
	return self.indexOf(value) === index;
}
export default connect(mapStateToProps)(Gantt)