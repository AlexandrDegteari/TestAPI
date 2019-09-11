import mongoose from 'mongoose';

const EventSubscribeSchema = new mongoose.Schema({
	event_id: {
		type: String,
		required: true,
		trim: true
	},
	users_subscribed: {
		type: Array,
		required: true,
	}
});

export default mongoose.model('EventSubscribe', EventSubscribeSchema);
