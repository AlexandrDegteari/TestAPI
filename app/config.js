require('dotenv').config();

export default {
	ENV: process.env.NODE_ENV || '',
	PORT: process.env.PORT || '',
	URL: process.env.BASE_URL || '',
	MONGODB_URI: process.env.MONGODB_URI || '',
	JWT_SECRET: process.env.JWT_SECRET || '',
	UI_URL: process.env.UI_URL || ''
};