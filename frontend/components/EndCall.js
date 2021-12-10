import React from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Button,
	Text,
	NativeModules
} from 'react-native';

const { CxModule } = NativeModules;

export default function EndCall({ showMsg }) {
	const endCallHandler = () => {
		CxModule.endCall();
	};
	return (
		<SafeAreaView style={styles.callScreen}>
			<Text style={styles.txt}>{showMsg && 'Call Ended'}</Text>
			<Button title='End Call' onPress={endCallHandler} color='red' />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	callScreen: {
		flex: 1,
		width: '100%',
		backgroundColor: '#212121',
		alignItems: 'center',
		justifyContent: 'center'
	},
	txt: {
		paddingBottom: 10,
		color: 'white'
	}
});
