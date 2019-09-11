export default function getAccessToken(req) {

	if (req.headers['authorization']) {
		return req.headers['authorization'].split(' ')[1];
	}

	return null;
}