import nodemailer from 'nodemailer';
import chalk from 'chalk';

export default function sendMail(to, subject, html) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'eventsbook.app@gmail.com',
			pass: 'zakolka777'
		}
	});

	const mailOptions = {
		to,
		subject,
		html,
		from: 'EventsBook <eventsbook.app@gmail.com>',
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log(chalk.black.bgYellow('Email sent succesful: ' + info.response));
		}
	});
}
