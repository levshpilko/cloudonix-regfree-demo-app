import React, { useEffect } from 'react';
import {
	Text,
	Image,
	View,
	StyleSheet,
	Button,
	SafeAreaView,
	NativeModules
} from 'react-native';

import axios from 'axios';

const { CxModule } = NativeModules;
import callModes from '../shared/callModes';

export default function StartCall({ changeMode, hangUp, serverUrl }) {
	useEffect(() => {
		hangUp(false);
	}, []);

	const callHandler = async dest => {
		try {
			console.log('Calling....');
			const res = await axios.get(`${serverUrl}/api/call?dest=${dest}`);
			console.log(res.data); //to delete before build

			// changeMode(true);
			changeMode(callModes.IN_CALL_MODE);
			CxModule.dial(res.data.msisdn, res.data.callToken, () => {
				hangUp(true);
				setTimeout(() => {
					changeMode(callModes.START_CALL_MODE);
					// changeMode(false);
				}, 1500);
			});
		} catch (err) {
			console.log(err.response.data.message);
			alert(
				err.response.data.message || 'Something went wrong. Please try again :('
			);
		}
	};

	return (
		<SafeAreaView style={styles.callScreen}>
			<Image
				style={styles.tinyLogo}
				source={{
					uri: 'https://cdn.statically.io/img/cloudonix.io/f=auto%2Cq=75/wp-content/uploads/2020/05/cloudonix_logo_Sign-e1598352742639.png'
				}}
			/>
			<Text style={styles.txt}>Welcome to Cloudonix reg-free demo app</Text>
			<View style={styles.buttons}>
				<Button title='Call A' onPress={() => callHandler('A')} color='green' />
				<Button title='Call B' onPress={() => callHandler('B')} color='green' />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	callScreen: {
		flex: 1,
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	txt: {
		paddingBottom: 10,
		paddingTop: 10
	},
	buttons: {
		flexDirection: 'row',
		width: '80%',
		justifyContent: 'space-around'
	},
	tinyLogo: {
		width: 210,
		height: 35
	}
});
