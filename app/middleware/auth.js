import getAccessToken from '../helpers/getAccessToken';
import jwt from 'jsonwebtoken';
import UsersSchema from '../models/User';

export default async (req, res, next) => {
	const token = await getAccessToken(req);

	if ( ! token) {
		return res.status(404).send('Not found accessToken in header');
	}

	const {
		id: userId
	} = await jwt.decode(token);

	const user = await UsersSchema.findById(userId);

	if ( ! user) {
		return res.status(404).send('Not found user in database');
	}


	next();
};