// @flow
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Auth } from 'aws-amplify';
import {
  AccessToken as FBAccessToken,
  LoginManager as FBLoginManager,
} from 'react-native-fbsdk';
import * as AuthUtils from './src/utils/auth';

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headingText: {
    fontWeight: '500',
    fontSize: 18,
    color: 'rgb(38, 38, 38)',
    marginTop: 20,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
  },
  facebookLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    backgroundColor: 'rgb(59, 90, 150)',
    borderRadius: 4,
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  facebookLoginButtonText: {
    fontWeight: 'normal',
    fontSize: 17,
    color: 'rgb(255, 255, 255)',
  },
  googleLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    backgroundColor: 'rgb(234, 67, 53)',
    borderRadius: 4,
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  googleLoginButtonText: {
    fontWeight: 'normal',
    fontSize: 17,
    color: 'rgb(255, 255, 255)',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    backgroundColor: 'rgb(234, 67, 53)',
    borderRadius: 4,
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 32,
  },
  logoutButtonText: {
    fontWeight: 'normal',
    fontSize: 17,
    color: 'rgb(255, 255, 255)',
    marginLeft: 10,
  },
});

type Props = {};
type State = {
  isLoading: boolean,
  loggedIn: boolean,
};
export default class App extends Component<Props, State> {
  state = {
    isLoading: false,
    loggedIn: false,
  };

  componentWillMount() {
    AuthUtils.init();

    // const session = await Auth.currentUserCredentials();

    // console.log(session);
  }

  handleLogin = async (type) => {
    let result;

    this.setState(prevState => ({
      ...prevState,
      isLoading: true,
    }));

    try {
      if (type === 'facebook') {
        result = await AuthUtils.loginFB();
      }
      else if (type === 'google') {
        result = await AuthUtils.loginGoogle();
      }
    } catch (err) {
      console.log(err);

      this.setState(prevState => ({
        ...prevState,
        isLoading: false,
      }));
    }

    if (result) {
      Alert.alert(`Your OpenID token: ${result}`);

      this.setState(prevState => ({
        ...prevState,
        loggedIn: true,
        isLoading: false,
      }));
    } else {
      this.setState(prevState => ({
        ...prevState,
        isLoading: false,
      }));
    }
  }

  handleLogout = () => {
    AuthUtils.logout();

    this.setState({
      loggedIn: false,
      isLoading: false,
    });
  }

  render() {
    const { isLoading, loggedIn, profile } = this.state;

    return (
      <View style={styles.containerStyle}>
        <Text style={styles.headingText}>React-Native Cognito Login Example</Text>

        {loggedIn && <View style={styles.welcome}>
          <Text style={styles.welcomeText}>
            You're logged in!
          </Text>
          <TouchableOpacity onPress={() => this.handleLogout()} style={styles.logoutButton}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>}

        {!loggedIn && <View>
          <TouchableOpacity onPress={() => this.handleLogin('facebook')} style={styles.facebookLoginButton}>
            <Text style={styles.facebookLoginButtonText}>Login with Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.handleLogin('google')} style={styles.googleLoginButton}>
            <Text style={styles.googleLoginButtonText}>Login with Google</Text>
          </TouchableOpacity>
        </View>}
      </View>
    );
  }
}
