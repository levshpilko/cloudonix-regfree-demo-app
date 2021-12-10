const { JWT } = require('google-auth-library');

function getAccessToken() {
	return new Promise(function (resolve, reject) {
		const key = require('../service-account.json');
		const jwtClient = new JWT(
			key.client_email,
			null,
			key.private_key,
			['https://www.googleapis.com/auth/firebase.messaging'],
			null
		);
		jwtClient.authorize(function (err, tokens) {
			if (err) {
				reject(err);
				return;
			}
			resolve(tokens.access_token);
		});
	});
}

module.exports = getAccessToken;
