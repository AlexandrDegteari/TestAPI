import UsersSchema from '../models/User';
import getAccessToken from '../helpers/getAccessToken';
import jwt from 'jsonwebtoken';
import moment from 'moment';

export const GetAllUsers = async (req, res) => {
	try {
		const users = await UsersSchema.find({});
		return res.status(200).send(users);
	} catch (err) {
		console.log(`${err}`);
		return res.status(500).send('Something is not ok!');
	}
};

export const GetUser = async (req, res, next) => {
	try {
		const user = await UsersSchema.findById(req.params.id);
		res.status(200).send(user);
		return next();
	} catch (err) {
		console.log(`${err}`);
		return res.status(500).send('Something is not ok!');
	}
};

export const GetUserDetails = async (req, res) => {
	const token = await getAccessToken(req);

	if (!token) {
		return res.status(404).send('Not found accessToken in header');
	}

	const {
		id
	} = jwt.decode(getAccessToken(req));

	try {
		await UsersSchema.findById({
				_id: id
			}, function (err, data) {

				if (err) {
					console.info(err);
					return res.status(500).send('Something is not ok with UsersSchema -> findById !');
				}

				if (data) {
					const userInfo = {
						id: data._id,
						email: data.email,
						name: data.name,
						avatar: data.avatar,
					};
					return res.status(200).send(userInfo);
				}
			}
		);

	} catch (err) {
		console.log(`${err}`);
		return res.status(500).send('Something is not ok with GetUserDetails!');
	}
};

export const EditUser = async (req, res) => {
	const {
		name,
		avatar
	} = req.body;

	const {
		id
	} = await jwt.decode(getAccessToken(req));

	try {
		const avatarURL = avatar ? avatar : null;

		const user = await UsersSchema.findByIdAndUpdate(
			id,
			{
				$set: {
					'updated': moment().unix(),
					'name': name,
					'avatar': avatarURL,
				}}, function (err) {
				if (err) {
					return res.status(500).send('Something is not ok with UsersSchema -> findOneAndUpdate !');
				}
			}
		);

		if ( ! user) {
			return res.status(500).send('Something is not ok not find user from UsersSchema');
		}

		const userData = {
			avatar,
		};

		return res.status(200).send(userData);

	} catch (err) {
		console.log(`${err}`);
		return res.status(500).send('Something is not ok with EditUser!');
	}
};
