# Sample Opal tool OCP app

Sample OCP app that implements an Opal tool. You can use it as a template for building your Opal tools in OCP. 

# Prerequisites 

1. [OCP developer account](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/get-started-with-the-ocp2-developer-platform)
2. Configured OCP development environment - check [out documentation](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/configure-your-development-environment-ocp2)

# Before you start building...

## Get source code

The easiest way to start building your Opal tools in OCP is by cloning [this sample app](TODO).
Either fork [the repo](TODO) in GitHub or download [ZIP file](TODO) of your app and unzip in to your local folder.

> [!NOTE]  
> OCP requires every app to be a git repository. If you downloaded the ZIP file with the app, go to the folder with the app and run `git init` to initialize git repository. 

## Register your app in OCP

Run `ocp app register` command to register your app in OCP. 

```shell
$ ocp app register
✔ The app id to reserve my_opal_tool
✔ The display name of the app My Opal tool
✔ Target product for the app Connect Platform - for developing an app for Optimizely holistic integration solution, Optimizely Connect Platform (OCP).
✔ Keep this app private and not share it with other developers in your organization? Yes
Registering app my_opal_tool in all shards
```

Notes: 
- pick a meaningful app id and display name for your app - app id can not contain spaces, use underscores instead
- select `Connect Platform` for target product
- select `No` for private app question if you want to share your app with other developers in your organization

## Configure your app

Edit `app.yml` file in your app folder and set: 
- `meta`/`app_id` - change the value to the `app_id` of the app you registered in the previous step
- `meta`/`display_name` - change the value to the `dispay name` of the app you registered in the previous step
- `meta`/`vendor` - run `ocp accounts whoami` command to check the vendor of your OCP develoment account
- `meta`/`summary` - short summary of your app; this will appear in OCP App Directory
- `meta`/`support_url` - to be shown in OCP App Directory
- `meta`/`contact_email` - to be shown in OCP App Directory

## Validate your app

Run `ocp app validate` command in app folder to validate all settings. 

# Build your Opal tool

Opal tools are implement in OCP as [functions](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/functions-ocp2).
Each function is a tool registry - a set of logically related tools that can be registered in Opal. 
An OCP app can contain one or more Opal tool registries. 

## Setting up a tool registry

This section describes how a tool registry is set up. 

> [!NOTE] 
> The sample app contains one tool registry, so if you you are not planning to build mulitple registries in your app, you can skip this section. 

A tool/function is declared in `app.yml` file: 
```yml
functions:
  opal_tool:
    entry_point: OpalToolFunction
    description: Opal tool function
```

The value of `entry_point` property is the name of the class that implements the tool. The file is located in `src/functions` folder. The file exports a class, which name matches the value of `entry_point` property.

Here is the template of an Opla tool function class. Check [src/functions/OpalToolFunction.ts](./src/functions/OpalToolFunction.ts) for sample implementation.
```TypeScript
import { logger, Function, Response } from '@zaiusinc/app-sdk';

// Define interfaces for the parameters of each function
interface Tool1Parameters {
  param1: string;
  param2: number;
}

// Define Opal tool metadata  - list of tools and their parameters
const discoveryPayload = {
  'functions': [
    {
      'name': 'tool1', // tool name will show on the list in Opal UI
      'description': 'Description of the tool', // description - tells Opal what the tool does
      'parameters': [ // parameters
        {
          'name': 'param1',
          'type': 'string',
          'description': 'Text param',
          'required': true
        },
        {
          'name': 'param2',
          'type': 'number',
          'description': 'Numeric param',
          'required': false
        }
      ],
      'endpoint': '/tools/greeting',
      'http_method': 'POST'
    }
  ]
};

/**
 * class that implements the Opal tool functions. Requirements:
 * - Must extend the Function class from the SDK
 * - Name must match the value of entry_point property from app.yml manifest
 * - Name must match the file name
 */
export class OpalToolFunction extends Function {

  /**
   * Processing the request from Opal
   * Add your logic here to handle every tool declared in the discoveryPayload.
   */
  public async perform(): Promise<Response> {
    if (this.request.path === '/discovery') {
      return new Response(200, discoveryPayload);
    } else if (this.request.path === '/tools/greeting') {
      const params = this.extractParameters() as Tool1Parameters;
      const response =  this.tool1Handler(params);
      return new Response(200, response);
    } else {
      return new Response(400, 'Invalid path');
    }
  }

  private extractParameters() {
    // Extract parameters from the request body
    if (this.request.bodyJSON && this.request.bodyJSON.parameters) {
      // Standard format: { "parameters": { ... } }
      logger.info('Extracted parameters from \'parameters\' key:', this.request.bodyJSON.parameters);
      return this.request.bodyJSON.parameters;
    } else {
      // Fallback for direct testing: { "name": "value" }
      logger.warn('\'parameters\' key not found in request body. Using body directly.');
      return this.request.bodyJSON;
    }
  }

  /**
   * The logic of the tool goes here.
   */
  private async tool1Handler(parameters: Tool1Parameters) {
    // implement your logic here

    return {
      output_value: "Output from the tool"
    };
  }

}

```

Parameter types supported by Opal: 
- string
- integer
- number
- boolean
- array
- object

## Exposing tool registry

The app exposes discovery URL of the tool in app settings form UI. 

> [!NOTE]  
> You can skip this section if you do not plan to expose muliple tool registries from your app. 

The app exposes discovery URL by defining `opal_tool_url` configuration property in `forms/settings.yml` file:
```yml
sections:
  - key: instructions
    label: Instructions
    elements:
      - type: text
        key: opal_tool_url
        label: Opal Tool URL
        disabled: true
        help: Paste the URL below into your Opal tool settings to enable the sample tool.
      - type: divider
      - type: instructions
        text:
          Paste the URL above into `Discovery URL` field in Opal account `Tools` section.
```

Then, it sets the value of the property in life-cycle `onInstall` and `onUpdate` events in `src/lifecycle/Lifecycle.ts` file: 
```TypeScript
// write the generated webhook to the swell settings form
const functions = await App.functions.getEndpoints();
await App.storage.settings.put('instructions', {opal_tool_url: `${functions.opal_tool}/discovery`});
```

TODO screenshot

## Multiple tool registries in a single app

The sample app comes with a single tool registry. This is enough in most cases. However, sometimes it might be useful to expose multiple registeries and allow app users to pick registries they want to install to their Opal account. If you decide to add more registries to your app, you can do this in these steps: 

1. Declare new registry function in `app.yml`
```yml
another_opal_tool: 
  entry_point: AnotherOpalToolFunction
  description: AnotherOpal tool function
```

2. Implement your tool function 

  Create `AnotherOpalToolFunction.ts` file in `src/functions` folder. The file should export `AnotherOpalToolFunction` class, which extends `Function` abstract class.

  Implement `perform` method of the class, similarily to how it is done in `src/functions/OpalToolFunction.ts`. 

3. Expose another registry URL

  Add an extra paramter to app settings form in `forms/settings.yml` class: 
  ```yml
  - type: text
    key: another_opal_tool_url
    label: Another Opal Tool URL
    disabled: true
    help: Paste the URL below into your Opal tool settings to enable another Opal tool.
  ```

  Set the new parameter in both `onInstall` and `onUpgrade` methods in `src/lifecycle/Lifecycle.ts` file: 
  ```TypeScript
    await App.storage.settings.put('instructions', {
      opal_tool_url: `${functions.opal_tool}/discovery`,
      another_opal_tool_url: `${functions.another_opal_tool}/discovery`
    });
  ```

Now, users of your app can install each tool registry separately to their Opal accounts. 

## Custom configuration and authorization

You can define custom settings (configuration) of your app. 
This allows OCP users that install to provide configuration properties defined by you. 

There are two main uses cases where this is useful: 

- authorization in external services - you can ask users who use your app to authorize in an external service, e.g. Google
- app behaviour customization - users can customize your app behaviour

Check [OCP documentation](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/forms-ocp2) for all features supported by OCP. 

Let's look at two common examples where this feature is useful: username/password authentication and OAuth authentication. 

### Username/password authentication

You can ask users to provide credentials to an external service your app connects to. 

Start from declaring app settings section in `forms/settings.xml` file: 
```yml
 - key: auth
   label: Authorization
   properties:
     - integrated
   elements:
     - type: text
       key: email
       required: true
       label: Username/Email Address
       help: |
         Enter your username or email address to authenticate
       hint: user@yourcompany.com
     - type: secret
       key: api_key
       required: true
       label: API Key
       help: |
         Enter your API key to authenticate
     - type: button
       label: Authorize
       style: primary
       action: authorize
```

Next, validate provided credentials in `onFormSubmit` method in `src/lifecycle/Lifecycle.ts` file: 
```TypeScript
/*
* example of handling username/password auth section
*/
if (section === 'auth' && action === 'authorize') {
  await storage.settings.put<AuthSection>(section, {...formData, integrated: true});

  // validate the credentials here, e.g. by making an API call
  const success = true; // replace with actual validation logic

  if (success) {
    result.addToast('success', 'Validation successful!');
  } else {
    result.addToast('warning', 'Your credentials were not accepted. Please check them and try again.');
  }
} else {
  result.addToast('warning', 'Unexpected action received.');
}
```

In your code, you get access to stored credentials via `storage` interface from `app-sdk`: 
```TypeScript
import { storage } from '@zaiusinc/app-sdk';
const auth = await storage.settings.get<AuthSection>('auth');
```

### OAuth authentication

A common use case is to require OAuth authroization to the external service. This use case is more complex and details depends on OAuth provider. The sample app contains an example of Google OAuth.

> [!NOTE] 
> Real-life examples might be more complex, e.g. involve storing refresh token and refreshing access token periodically

Start from adding OAuth button to app settings in `forms/settings.xml` file: 
```yml
- key: oauth
  label: OAuth authorization
  properties:
    - authorized
  elements:
    - type: instructions
      text: Please continue to Google to authorize the connection with ODP
    - type: oauth_button
      label: Authorize with Google
    - type: instructions
      text: |
        ** ⚠️ You need to perform the authorization to start to sync data. ⚠️ **
      visible:
        key: oauth.authorized
        equals: false
```

When a user clicks the button, OCP will redirect the user to the URL returned by `onAuthorizationRequest` method of `Lifecycle` class. Implement `onAuthorizationRequest` method, for example: 
```Typescript
public async onAuthorizationRequest(
  _section: string,
  _formData: SubmittedFormData
): Promise<LifecycleSettingsResult> {
  // example: handling OAuth authorization request
  const result = new LifecycleSettingsResult();

  try {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      client_id: process.env.APP_ENV_CLIENT_ID,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      scope: process.env.APP_ENV_SCOPE,
      redirect_uri: functions.getAuthorizationGrantUrl()
    } as any).toString();
    return result.redirect(url.toString());
  } catch (e) {
    return result.addToast(
      'danger',
      'Sorry, an unexpected error occurred. Please try again in a moment.',
    );
  }

  return result.addToast('danger', 'Sorry, OAuth is not supported.');
}
```

You will have to add `CLIEND_ID` and `ENV_SCOPE` to app env config. More info about env config in [this doc](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/app-structure-env-ocp2). You can also hard-code both values for now. 

Apon successful authorization, user get redirected by back to OCP and OCP calls `onAuthorizationGrant` method of `Lifecycle` class. You should implement this method. You should validate the response, request access token from OAuth provider and store the token in [secret storage](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/secrets-store-ocp2) for later use by the app.

An example of `onAuthorizationGrant` method: 
```TypeScript
public async onAuthorizationGrant(
  _request: Request
): Promise<AuthorizationGrantResult> {
  // make sure to add CLIENT_ID, CLIENT_SECRET, and DEVELOPER_TOKEN to your .env file
  const CLIENT_ID = process.env.APP_ENV_CLIENT_ID || '';
  const CLIENT_SECRET = process.env.APP_ENV_CLIENT_SECRET || '';

  const result = new AuthorizationGrantResult('');
  try {
    await storage.settings.patch('auth', {
      authorized: false
    });
    const request = {
      method: 'POST',
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: functions.getAuthorizationGrantUrl(),
        code: _request.params.code as string
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    let token: Token | undefined;
    const response = await fetch('https://oauth2.googleapis.com/token', request);
    switch (response.status) {
    case 200:
      const rawToken = await response.json() as any;
      token = {
        value: rawToken.access_token,
        refresh: rawToken.refresh_token,
        exp: Date.now() + (rawToken.expires_in - 60) * 1000
      };
      await storage.secrets.put('token', token);
      break;
    case 401:
      logger.error('Unauthorized, invalid credentials.');
      break;
    default:
      logger.error('General server error', response.status, await response.text());
      throw new Error('API Call Issue');
    }
    if (token) {
      result.addToast('success', 'Successfully authorized!');
      await storage.settings.patch('auth', {authorized: true});
    }
  } catch (e) {
    logger.error(e);
    return result.addToast('danger', 'Sorry, OAuth is not supported.');
  }
}
```

Notice that `onAuthorizationGrant` method stores Google token in `token` secret in secret store. 
You app can access this token by accessing secret store: 
```TypeScript
import { storage } from '@zaiusinc/app-sdk';
const token = await storage.secrets.get<Token>('token');
```

## Storage

Your app can use 4 types of [storage](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/storage-ocp2):
- secrets store - suitable for sensitive information not related to a settings form
- settings store – data backing the settings form. Suitable for any configuration-related data (including passwords and API keys), especially data you need to present to the user through the settings form.
- key value store – General purpose storage for simple data structures, lists, and sets. Designed for high throughput and moderately large data sets when necessary, but limited to about 400 KB per record.
- shared key value store – Store and share common data between different components of your app.

Refer to the [docs](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/storage-ocp2) for more details. The sample app contains examples of using settings store and secret store. 

## Custom dependencies

You can add [your own dependencies](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/add-a-dependency-ocp2) to your app by using the npm install or yarn add command, or by manually editing the package.json file.

For example: 
```bash
npm install axios
```

## Logging and notifications

Use logger provided by `app-sdk` library to log important events in your app and support visibility and troubleshooting. 

Examples: 
```TypeScript
import { logger } from '@zaiusinc/app-sdk';

logger.info('Tool called with parameters:', this.request.bodyJSON.parameters);
logger.warn('Missing recommended parameter:', this.request.bodyJSON.parameters);
logger.debug('Extra debugging info:', this.request.bodyJSON.parameters);
```

You can access logs in two ways: 
- in UI - `Troubleshooting` tab in your app view in OCP App Directory
- via OCP CLI - with `ocp app logs` command, e.g. `ocp app logs --appId=<YOUR_APP_ID>` (check `ocp app logs --help` for more options)

By default, OCP logs in `INFO` level. You can temporairly change the level (e.g. for troubleshooting) using `ocp app set-log-level` command, e.g. `ocp app set-log-level <YOUR_APP_ID>@<YOUR_APP_VERSION> --trackerID=<PUBLIC_API_KEY_OF_YOUR_OCP_ACCOUNT>

You can also track significant activity through notifications in the Optimizely Connect Platform (OCP) [Activity Log](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/activity-log-notifications-ocp2) (a log of events available for OCP users in OCP UI in `Settings` -> `Activity log`). 

For example: 
```TypeScript
import {notifications} from '@zaiusinc/app-sdk';
notifications.success('Opal tool', 'Tool registered', 'App registered as an Opal tool');
```

## Overview and assets

Customise how your app is presented in App Directory by editing `directory/overview.md` file. The file is rendered to the app's Overview tab, which is presented when a user clicks through to your app from the OCP App Directory.

You can also privide your own icon for the app. To do this, replace `assets/logo.svg` file with your own icon. The icon is displayed on your app card in the OCP App Directory. The recommended size is 150 x 50 px.

# Test your Opal tool

To test your app with Opal, build your app and publish it to OCP: 
```bash
$ ocp app prepare --bump-dev-version --publish
```

> [!NOTE]
> `--bump-dev-version` option increases the version of your app in `app.yml` and lets you upgrade previously deployed versions. 

Then, install your app to your sandbox OCP account: 
```bash
$ ocp directory install <YOUR_APP_ID>@<YOUR_APP_VERSION> <PUBLIC_API_KEY> 
```

where:
- `<YOUR_APP_ID>` and `<YOUR_APP_VERSION>` are app id and version from `app.yml` manifest (both values can also be taken from the output of `ocp app prepare` command from previous step)
- <PUBLIC_API_KEY> - is the private API key of your sandbox OCP account. You can get the value from `Settings` -> `APIs` section in OCP UI (public API key before the first, before the dot, part of private API key) or from the output of `$ ocp accounts whoami` command

> [!NOTE]
> OCP auto-upgrades app versions according to semver order, so you need to install your app only once and it will be upgrades automatically after you deploy upgraded version

Got to your OCP account, `Data Setup -> App Directory` section, and find your app. In `Settings` tab, copy the value of `Opal Tool URL` property. 

Go to your Opal account, `Tools` -> `Registries` tab, and hit `Add tool registry` button. 

Pick `Registry Name`, use URL from `Opal Tool URL` of your app as `Discovery URL`. Leave `Bearer Token (Optional)` empty for now. Hit `Save`. 

Your tools should now be registered in Opal!

> [!NOTE]
> Every time you change tools manifest in your app and publish new version of your app, Opal needs to update tools configuration. To do this, hit `Sync` contextual menu option in Opal tools registry UI. 
