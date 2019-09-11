import mongoose from 'mongoose';

const UserSubscriptioneSchema = new mongoose.Schema({
	user_id: {
		type: String,
		required: true,
		trim: true
	},
	events_subscribed: {
		type: Array,
		required: true,
	}
});

export default mongoose.model('User_Subscription', UserSubscriptioneSchema);
