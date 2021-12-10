const axios = require('axios');

const getAccessToken = require('../util/accessToken');
const HttpError = require('../models/http-error');

const SRC_CALL = '1234';
const DST_CALL_A = '7890';
const DST_CALL_B = '5340';

CLOUDONIX_CALL_URL = 'insert your cloudonix server url here';
CLOUDONIX_API_KEY - 'insert your api key here';
FCM_URL = 'insert your fcm project url here';

const regDb = {
	//calleeId: 'device identifier'
};

exports.getCallerData = async (req, res, next) => {
	const callTo = req.query.dest;
	callerData = {};

	if (callTo === 'A') {
		callerData.msisdn = DST_CALL_A;
	} else if (callTo === 'B') {
		callerData.msisdn = DST_CALL_B;
	} else {
		return next(new HttpError('Call destination not found', 404));
	}

	const data = {
		destination: callerData.msisdn,
		callerId: SRC_CALL
	};

	try {
		const response = await axios.post(`${CLOUDONIX_CALL_URL}/outgoing`, data, {
			headers: {
				Authorization: `Bearer ${CLOUDONIX_API_KEY}`
			}
		});
		callerData.callToken = response.data.token;
		res.send(callerData);
	} catch (err) {
		return next(new HttpError('Something went wrong, getting token failed'));
	}
};

exports.receiveCall = async (req, res, next) => {
	const destCallee = req.body.dnid;
	const caller = req.body['caller-id'];
	const callToken = req.body.session;

	const existingCallee = regDb[destCallee];

	if (!existingCallee) {
		return next(new HttpError('User not found', 404));
	}

	try {
		const accessToken = await getAccessToken();

		const ring_url = `${CLOUDONIX_CALL_URL}/ringing/${SRC_CALL}/${callToken}`;

		const rcmRespone = await axios.post(
			FCM_URL,
			{
				validate_only: false,
				message: {
					data: {
						destCallee,
						caller,
						callToken,
						ring_url
					},
					// notification: {
					// 	body: `Click to answer`,
					// 	title: `Incoming call from ${caller}`
					// },
					token: existingCallee
				}
			},
			{
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}
		);

		res.send({ message: 'notification sent' });
	} catch (err) {
		console.log(err.response.data);
		return next(new HttpError('Notification send failed', 403));
	}
};

exports.register = async (req, res, next) => {
	// console.log(req.body);
	const { deviceId } = req.body;

	if (!deviceId) {
		return next(new HttpError('Please enter a device id', 400));
	}

	regDb[SRC_CALL] = deviceId;

	res.send({ message: 'Device was registered successfully!' });
};
