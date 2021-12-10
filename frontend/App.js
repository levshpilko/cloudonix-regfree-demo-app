import React, { useState, useEffect } from 'react';
import {
	StyleSheet,
	SafeAreaView,
	StatusBar,
	NativeModules
} from 'react-native';

import { Notifications } from 'react-native-notifications';
import axios from 'axios';

import EndCall from './components/EndCall';
import StartCall from './components/StartCall';
import ReceiveCall from './components/ReceiveCall';
import callModes from './shared/callModes';

const { CxModule } = NativeModules;

const LICENSE_KEY = 'insert sdk key here';
const SERVER_URL = 'insert your node.js server url here';
export default function App() {
	const [isEndCall, setIsEndCall] = useState(false); // boolean flag to track if a call was ended
	const [caller, setCaller] = useState({}); // caller data to display and use in dial method
	const [callMode, setCallMode] = useState(callModes.START_CALL_MODE);

	// handeling the isEndCall state. gets a boolean
	const hangUpHandler = isHangUp => {
		setIsEndCall(isHangUp);
	};

	const callModeHandler = mode => {
		// gets a mode and re-renders the screen accordingly
		setCallMode(mode);
	};

	useEffect(() => {
		try {
			Notifications.registerRemoteNotifications();

			Notifications.events().registerRemoteNotificationsRegistered(event => {
				console.log('Device Token Received', event.deviceToken);

				axios.post(SERVER_URL + '/api/register', {
					deviceId: event.deviceToken
				});
			});

			Notifications.events().registerRemoteNotificationsRegistrationFailed(
				event => {
					console.error(event);
				}
			);

			Notifications.events().registerNotificationReceivedBackground(
				notification => {
					console.log(
						'Notification Received - Background',
						notification.payload
					);

					try {
						CxModule.invokeApp();
					} catch (err) {
						console.log(err);
					}
					axios
						.get(notification.payload.ring_url)
						.then(res => {
							console.log('********* call result status:', res.status);
							if (res.status === 205) {
								// Caller hung up before callee answered
								// return to homepage
								setCallMode(callModes.START_CALL_MODE);
								setCaller({});
								return;
							}
						})
						.catch(err => console.log(err));
					setCallMode(callModes.RECEIVE_CALL_MODE);
					setCaller({
						name: notification.payload.caller,
						token: notification.payload.callToken
					});
				}
			);

			Notifications.events().registerNotificationReceivedForeground(
				(notification, completion) => {
					console.log(
						'Notification Received - Foreground',
						notification.payload
					);

					axios
						.get(notification.payload.ring_url)
						.then(res => {
							console.log('********* result status', res.status);
							if (res.status === 205) {
								// Caller hung up before callee answered
								// return to homepage
								setCallMode(callModes.START_CALL_MODE);
								setCaller({});
								return;
							}
						})
						.catch(err => console.log(err));
					// setIsReceivingCall(true);
					setCallMode(callModes.RECEIVE_CALL_MODE);
					setCaller({
						name: notification.payload.caller,
						token: notification.payload.callToken
					});
					completion({ alert: true, sound: true, badge: false });
				}
			);

			CxModule.initCloudonixSDK(LICENSE_KEY);
			CxModule.onLicense(() => {
				console.log('SDK initialized!');
			});
		} catch (err) {
			alert('Something went wrong. Please try again :(');
		}
	}, []);

	let pageToShow;

	if (callMode === callModes.START_CALL_MODE) {
		pageToShow = (
			<StartCall
				changeMode={callModeHandler}
				hangUp={hangUpHandler}
				serverUrl={SERVER_URL}
			/>
		);
	} else if (callMode === callModes.IN_CALL_MODE) {
		pageToShow = <EndCall showMsg={isEndCall} />;
	} else if (callMode === callModes.RECEIVE_CALL_MODE) {
		pageToShow = (
			<ReceiveCall
				caller={caller.name}
				token={caller.token}
				changeMode={callModeHandler}
				hangUp={hangUpHandler}
			/>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar
				barStyle={callMode === 'start-call' ? 'dark-content' : 'light-content'}
				backgroundColor={callMode === 'start-call' ? '#fff' : '#212121'}
			/>
			{pageToShow}
			{/* {isReceivingCall ? (
				<ReceiveCall
					caller={caller.name}
					token={caller.token}
					changeMode={callModeHandler}
					hangUp={hangUpHandler}
					answer={answerHandler}
				/>
			) : !isStartCall ? (
				<StartCall changeMode={callModeHandler} hangUp={hangUpHandler} />
			) : (
				<EndCall showMsg={isEndCall} />
			)} */}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	}
});
