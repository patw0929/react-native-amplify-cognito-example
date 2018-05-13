React-Native Amplify Cognito Login Example App
---

<img src="https://user-images.githubusercontent.com/3055294/39964632-59fbf84c-56bb-11e8-81c0-e65ea392aad5.png" width="300" />

## Feature

Due to aws-amplify is not support user pool & hosted UI with react-native in current time, so I made this PoC to login with amplify & identity pool (federated login) via Google & Facebook social login.

Anyway, I am looking forward to the way that we can login with cognito user-pool & react-native supported hosted-ui (Native-based).

## Instruction

1. Please refer the AWS Amplify official documentation to set your AWS Mobile Hub & Cognito.
2. Make sure that you have `aws-exports.js` in `src/`.

   ```js
   const awsmobile = {
    'aws_auth_facebook': 'enable',
    'aws_cognito_identity_pool_id': 'us-west-2:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx',
    'aws_cognito_region': 'us-west-x',
    'aws_facebook_app_id': 'xxxxxxxxxxxxxxxxx',
    'aws_facebook_app_permissions': 'public_profile',
    'aws_google_app_permissions': 'email,profile,openid',
    'aws_google_web_app_id': 'xxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com',
    'aws_project_id': 'xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxxx',
    'aws_project_name': 'react-native-amplify-cognito-example-xxxxxxxxxx',
    'aws_project_region': 'us-west-x',
    'aws_resource_name_prefix': 'reactnativeamplifyco-mobilehub-xxxxxxxx',
    'aws_sign_in_enabled': 'enable',
   }

   export default awsmobile;
   ```

3. Run `react-native run-android` or `react-native run-ios`

## Packages

* [react-native](https://github.com/facebook/react-native) 0.55.4
* [react-native-fbsdk](https://github.com/facebook/react-native-fbsdk) 0.7.0
* [react-native-google-signin](https://github.com/devfd/react-native-google-signin) 0.12.0 (with patches)
* [aws-amplify](https://github.com/aws/aws-amplify) 0.3.3
* [patch-package](https://github.com/ds300/patch-package) 5.1.1 (for patching react-native-google-signin)

## License

MIT License
