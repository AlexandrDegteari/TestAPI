import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true
	},
	password: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	avatar: {
		type: String,
	},
	created: {
		type: Number,
		required: true,
	},
	updated: {
		type: Number,
		required: true,
	},
	userAccess: [{
		iat: Number,
		expires_in: Number,
		access_token: String
	}]
});

export default mongoose.model('User', UserSchema);
