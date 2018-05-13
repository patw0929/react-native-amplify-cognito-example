import Amplify, { Auth } from 'aws-amplify';
import {
  AccessToken as FBAccessToken,
  LoginManager as FBLoginManager,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import { GoogleSignin } from 'react-native-google-signin';
import aws_exports from '../aws-exports';

Amplify.configure(aws_exports);

const COGNITO_IDENTITY_API = 'https://cognito-identity.us-west-2.amazonaws.com/';

const GOOGLE_SIGNIN_IOS_CLIENT_ID = '567874766145-ijht4o6ll24qjgtth2l4k5ek37ahftv6.apps.googleusercontent.com';
const GOOGLE_SIGNIN_WEBCLIENT_ID = '567874766145-u37t5dl48vole6ba27714u2nb6j3hfqm.apps.googleusercontent.com';

/*
 +----------------------------------------------+
 |                 Flow Chart                   |
 +----------------------------------------------+

              +-------init-------+
              |                  |
              | Google configure |
              |                  |
              +------------------+

    +----------------+    +-----------------+
    |                |    |                 |
    |    loginFB     |    |   loginGoogle   |
    |                |    |                 |
    +----------------+    +-----------------+
            V                      V
   +-----------------+    +---------------------+
   |                 |    |                     |
   | fbGetCredential |    | googleGetCredential |
   |                 |    |                     |
   +-----------------+    +---------------------+
                       V
              +----------------+
              |                |
              | getOpenIdToken |
              |                |
              +----------------+
*/


const cleanLoginStatus = () => {
  Auth.signOut();
};

export const logout = () => {
  FBLoginManager.logOut();
  GoogleSignin.signOut();
  cleanLoginStatus();
};

const fbGetCredential = () => {
  return new Promise(async (resolve, reject) => {
    const loginResult = await FBLoginManager.logInWithReadPermissions(['email']);

    if (loginResult.isCancelled) {
      reject('Login canceled');

      return;
    }

    const tokenData = await FBAccessToken.getCurrentAccessToken();
    const { accessToken, expirationTime } = tokenData;
    const userData = await getFBGraphRequest();
    const credentials =
      await Auth.federatedSignIn('facebook', { token: accessToken, expires_at: expirationTime }, userData);

    if (credentials.authenticated) {
      resolve({
        identityId: credentials._identityId,
        accessToken,
      });
    } else {
      reject('Authentication failed');
    }
  });
};

const googleGetCredential = () => {
  return new Promise((resolve, reject) => {
    GoogleSignin.currentUserAsync()
      .then(async user => {
        console.log('user', user);

        const { idToken, accessTokenExpirationDate } = user;
        const userData = {
          name: user.name,
          email: user.email,
        };

        const credentials =
          await Auth.federatedSignIn('google', { token: idToken, expires_at: accessTokenExpirationDate }, userData);

        if (credentials.authenticated) {
          resolve({
            identityId: credentials._identityId,
            idToken,
          });
        } else {
          reject('Authentication failed');
        }
      })
      .catch(err => {
        reject(err);
      });
  });
};

const getFBGraphRequest = () => {
  return new Promise((resolve, reject) => {
    const infoRequest = new GraphRequest(
      '/me',
      {
        parameters: {
          fields: {
            string: 'email,name,first_name,last_name',
          },
        },
      },
      (error, result) => {
        if (error) {
          console.log(error.toString());
          reject(error);
        } else {
          console.log(result);
          resolve(result);
        }
      }
    );

    new GraphRequestManager().addRequest(infoRequest).start();
  });
};

export const loginFB = () => {
  return new Promise(async (resolve, reject) => {
    const credential = await fbGetCredential();

    if (credential) {
      const result = await getOpenIdToken('graph.facebook.com', credential.identityId, credential.accessToken);

      resolve(result);

      return;
    }

    reject('Authentication failed');
    console.log('failed');

    return;
  });
};

export const loginGoogle = () => {
  return new Promise(async (resolve, reject) => {
    const user = await GoogleSignin.signIn().catch(error => {
      console.log('WRONG SIGNIN', error);
    });

    if (user) {
      const credential = await googleGetCredential();

      if (credential) {
        const result = await getOpenIdToken('accounts.google.com', credential.identityId, credential.idToken);

        resolve(result);

        return;
      }

      reject('Authentication failed');
      console.log('failed');

      return;
    }

    return;
  });
};

export const getOpenIdToken = async (provider, identityId, token) => {
  const payload = {
    IdentityId: identityId,
    Logins: {
      [provider]: token,
    },
  };

  try {
    const rsp = await fetch(COGNITO_IDENTITY_API, {
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

      return json.Token;
    }
  } catch (e) {
    console.log('Error of getOpenIdToken: ', e);
  }
};

const googleConfigure = () => {
  GoogleSignin.hasPlayServices({ autoResolve: true })
    .then(() =>
      GoogleSignin.configure({
        iosClientId: GOOGLE_SIGNIN_IOS_CLIENT_ID,
        webClientId: GOOGLE_SIGNIN_WEBCLIENT_ID,
      })
    );
};

export const init = () => {
  googleConfigure();
};
