import getAccessToken from '../helpers/getAccessToken';
import jwt from 'jsonwebtoken';
import EventsSchema from '../models/Events';

export default async (req, res, next) => {
	const  { id: eventId } = req.params;

	if ( ! eventId ) {
		return res.status(404).send('Not found event id in url');
	}

	const token = await getAccessToken(req);

	const {
		id: userIdfromToken
	} = await jwt.decode(token);

	const event = await EventsSchema.findById(eventId);

	if ( ! event ) {
		return res.status(404).send('This event was not found');
	}

	if (event.userId !== userIdfromToken) {
		return res.status(403).send('This event does not belong for this user');
	}

	next();
};