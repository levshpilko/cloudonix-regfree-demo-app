import React from 'react';
import {
	Text,
	StyleSheet,
	Button,
	SafeAreaView,
	NativeModules
} from 'react-native';

const { CxModule } = NativeModules;
import callModes from '../shared/callModes';

export default function ReceiveCall({ caller, token, changeMode, hangUp }) {
	const answerHandler = () => {
		console.log('Answering call, token:', token);
		try {
			changeMode(callModes.IN_CALL_MODE);
			CxModule.dial(caller, token, () => {
				hangUp(true);
				setTimeout(() => {
					changeMode(callModes.START_CALL_MODE);
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
			<Text style={styles.txt}>{`Incoming Call From: ${caller}`}</Text>
			<Button title='Answer' onPress={answerHandler} color='green' />
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
		paddingTop: 10,
		fontSize: 20
	}
});
