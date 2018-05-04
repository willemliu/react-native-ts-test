import React from 'react';
import { Text, View, AsyncStorage, Linking } from 'react-native';
import { NavigationActions } from 'react-navigation';
import {textStyle, viewStyle} from "../styles/Styles";

export default class DrawerContainer extends React.Component<any, any> {
    props: any;
    state: any;

    constructor(props: any) {
        super(props);
        this.state = {
            loggedIn: this.props.navigation.getParam('loggedIn', null)
        };
        this.checkLogin();
    }

    checkLogin = async () => {
        this.setState({
            loggedIn: await AsyncStorage.getItem('loggedIn')
        });
    }

    logOut = async () => {
        await AsyncStorage.removeItem('loggedIn');
        this.setState({
            loggedIn: null
        });

        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Drawer' })],
        });
        this.props.navigation.dispatch(resetAction);
    }

    render() {
        const { navigation } = this.props;
        return (
            <View style={viewStyle.drawer}>
                <Text
                    onPress={() => navigation.navigate('Home')}
                    style={textStyle.button}>
                        Home
                </Text>
                {this.state.loggedIn ? null : <Text
                    onPress={() => navigation.navigate('Login')}
                    style={textStyle.button}>
                        Login
                </Text>}
                {this.state.loggedIn ? null : <Text
                    onPress={() => navigation.navigate('SignUp')}
                    style={textStyle.button}>
                        Sign up
                </Text>}
                {this.state.loggedIn ? <Text
                    onPress={this.logOut}
                    style={textStyle.button}>
                        Logout
                </Text> : null}

                <Text onPress={() => Linking.openURL('exp://exp.host/@willem_liu/react-native-ts?tmdbMovieId=500')} style={textStyle.button}>Link external</Text>
                <Text onPress={() => this.props.navigation.navigate('Donate', {url: 'https://app.moviesom.com'})} style={textStyle.button}>MovieSom</Text>

                <Text
                    onPress={() => navigation.navigate('About', {name: 'Willem Liu'})}
                    style={textStyle.button}>
                        About
                </Text>
            </View>
        );
    }
}
