import Amplify, { Auth } from 'aws-amplify';
import {
  AccessToken as FBAccessToken,
  LoginManager as FBLoginManager,
} from 'react-native-fbsdk';
import aws_exports from '../aws-exports';

Amplify.configure(aws_exports);

let openIdResolve;
let openIdTokenPromise = new Promise(resolve => {
  openIdResolve = resolve;
});

const cleanLoginStatus = () => {
  Auth.signOut()
    .then(data => console.log(data))
    .catch(err => console.log(err));

  openIdTokenPromise = new Promise(resolve => {
    openIdResolve = resolve;
  });
};

export const logout = () => {
  FBLoginManager.logOut();
  cleanLoginStatus();
};

export const loginFB = () => {
  return new Promise(async (resolve, reject) => {
    const loginResult = await FBLoginManager.logInWithReadPermissions(['email', 'user_birthday']);

    if (loginResult.isCancelled) {
      reject('Login canceled');

      return;
    }

    const tokenData = await FBAccessToken.getCurrentAccessToken();
    const { accessToken, expirationTime } = tokenData;
    const credentials =
      await Auth.federatedSignIn('facebook', { token: accessToken, expires_at: expirationTime });

    if (credentials.authenticated) {
      const result = await getOpenIdToken('graph.facebook.com', credentials._identityId, accessToken);

      resolve(result);

      return;
    }

    reject('Authentication failed');

    return;
  });
}

export const getOpenIdToken = async (provider, identityId, token) => {
  const payload = {
    IdentityId: identityId,
    Logins: {
      [provider]: token,
    },
  };

  try {
    const rsp = await fetch('https://cognito-identity.us-west-2.amazonaws.com/', {
      method: 'POST',
      headers: new Headers({
        'X-Amz-Target': 'AWSCognitoIdentityService.GetOpenIdToken',
        'Content-Type': 'application/x-amz-json-1.1',
        random: new Date().valueOf(),
        'cache-control': 'no-cache',
      }),
      body: JSON.stringify(payload),
    });

    if (!rsp.ok) {
      logout();
    } else {
      const json = await rsp.json();

      openIdResolve(json.Token);

      return json.Token;
    }
  } catch (e) {
    console.log('Error of getOpenIdToken: ', e);
  }
};
