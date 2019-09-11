import mongoose from 'mongoose';

const EmailValidation = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true
	},
	key: {
		type: String,
		required: true,
	},
	exp: {
		type: String,
		require: true,
	}
});

export default mongoose.model('EmailValidationSchema', EmailValidation);
