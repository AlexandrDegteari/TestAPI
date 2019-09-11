import moment from 'moment';
import EmailValidationSchema from '../models/EmailValidation';
import UserSubscriptionSchema from '../models/UserSubscription';
import sendMail from '../helpers/sendMail';
import crypto from 'crypto';
import UserSchema from '../models/User';
import jwt from 'jsonwebtoken';
import config from '../config';
import bcryptjs from 'bcryptjs';
import _ from 'lodash';
import getAccessToken from '../helpers/getAccessToken';

export const SendEmailController = async (req, res) => {
	if (_.isEmpty(req.body)) {
		return res.status(400).send('Body is empty. Please provide value for "email"!');
	}

	const {
		email,
	} = req.body;

	let emailDuplicate = false;

	try {
		// Check if them email already registered for the email verification
		await EmailValidationSchema.findOne({
			email
		}, function (err, obj) {
			if (obj) emailDuplicate = true;
		});

		if (emailDuplicate) {
			return res.status(200).send('Va rugam sa verificati posta, email-ul pentru confirmarea contului a fost deja expediat.');
		}

		// Check if email is assigned to an actual registered user
		await UserSchema.findOne({
			email
		}, function (err, obj) {
			if (obj) emailDuplicate = true;
		});

		if (emailDuplicate) {
			return res.status(406).send('Email-ul dat este deja inregistrat.');
		}

		// Generating unique key for validation
		const key = crypto.randomBytes(40).toString('hex');

		// Setting the time limit of 24h
		const exp = moment().add(1, 'day').unix();

		const emailValidationSchema = new EmailValidationSchema({
			email,
			key,
			exp
		});

		// Saving user's info into database
		await emailValidationSchema.save();

		// Composing email
		const subject = 'Confirmati email-ul pentru contul EventsBook';
		const html = (`
			<h4>Salut pentru a confirma acceseaza acest 
				<a href="${config.UI_URL}/sign-up?email=${email}&key=${key}">link</a>
			</h4>
		`);

		// Sending the email
		await sendMail(email, subject, html);

		// Respond with token
		return res.status(200).send('OK');
	} catch (err) {
		console.log(`${err}`);
		return res.status(500).send('Something is not ok!');
	}
};


export const RegisterController = async (req, res) => {
	const {
		email,
		password,
		key,
		name,
	} = req.body;

	if (!req.body) res.status(400).send('Please provide the data into the body!');

	await UserSchema.findOne({
		email: email
	}, async function (err, obj) {
		if (obj) {
			return res.status(406).send('Asa email exista');
		} else {
			try {
				await EmailValidationSchema.findOne({
					email,
					key
				}, function (err, obj) {
					if (obj) {
						const userSchema = new UserSchema({
							email,
							password,
							name,
							created: moment().unix(),
							updated: moment().unix()
						});

						bcryptjs.genSalt(10, (err, salt) => {
							bcryptjs.hash(userSchema.password, salt, async (err, hash) => {
								// Hash password
								userSchema.password = hash;

								// Save user
								try {
									await userSchema.save();

									await EmailValidationSchema.findOneAndRemove({
										email
									});

									const userSubscriptionSchema = new UserSubscriptionSchema({
										user_id: userSchema.id,
										events_subscribed: [],
									});

									await userSubscriptionSchema.save();

									return res.send(201);
								} catch (err) {
									console.log(`${err}`);
									return res.status(500).send('Something is not ok!');
								}
							});
						});
					} else {
						return res.status(404).send('Email or key not found');
					}
				});
			} catch (err) {
				console.log(`${err}`);
				return res.status(500).send('Something is not ok!');
			}
		}
	});
};

export const LoginController = async (req, res) => {
	const {
		email,
		password
	} = req.body;

	// Authenticate user
		try {
			const user = await UserSchema.findOne({
				email
			});

			if (_.isEmpty(user)) {
				return res.status(404).send('No user with that email was found!');
			}

			// Match password
			await bcryptjs.compare(password, user.password, (err, isMatch) => {
				if (err) {
					console.info(err);
				}

				if (!isMatch) {
					return res.status(404).send('Password is incorrect!');
				}
			});

			// Create JWT
			const access_token = jwt.sign({
				id: user._id,
				email: user.email
			}, config.JWT_SECRET, {
				expiresIn: '7d',
			});

			const {
				iat,
				exp
			} = jwt.decode(access_token);

			const userAccess = {
				iat,
				expires_in: exp,
				access_token
			};

			await UserSchema.findOneAndUpdate({
				email,
			}, {
				$push: { userAccess }
			});

			// Respond with token
			res.status(200).send({
				expires_in: exp,
				access_token,
			});
		} catch (err) {
			return `Error: ${err}`;
		}
};

export const LogoutController = async (req, res) => {
	const {
		id
	} = jwt.decode(getAccessToken(req));

	try {
		await UserSchema.findOneAndUpdate({_id: id},
			{$pull: {userAccess: {access_token : getAccessToken(req)}}}
		);

	} catch (err) {
		console.log(`${err}`);
		return res.status(500).send('Something is not ok!');
	}
};

export const RefreshAccessTokenController = async (req, res) => {
	const {
		id,
		email
	} = jwt.decode(getAccessToken(req));

	try {
		// Create JWT
		const access_token = jwt.sign({
			id,
			email
		}, config.JWT_SECRET, {
			expiresIn: '7d',
		});

		const {
			iat,
			exp
		} = jwt.decode(access_token);

		const accessToken = await UserSchema.findOneAndUpdate({
				userAccess:
					{ $elemMatch: {access_token: getAccessToken(req)}
					}},
			{
				$set: {
				'userAccess.$.iat': iat,
				'userAccess.$.expires_in': exp,
				'userAccess.$.access_token': access_token,
			}}
		);

		if (accessToken) {
			res.status(200).send({
				expires_in: exp,
				access_token,
			});
		} else {
			res.status(404).send('Not found AccessToken');
		}

	} catch (err) {
		console.log(`${err}`);
		return res.status(500).send('Something is not ok!');
	}
};
