# Sample Opal tool OCP app

Sample OCP app that implements an Opal tool using the `@optimizely-opal/opal-tool-ocp-sdk`. You can use it as a template for building your Opal tools in OCP with decorator-based tool registration. 

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

Opal tools are implemented in OCP as [functions](https://docs.developers.optimizely.com/optimizely-connect-platform/docs/functions-ocp2).

With the `@optimizely-opal/opal-tool-ocp-sdk`, tools are registered using `@tool` decorators, which can be used in:
- **ToolFunction classes** - Recommended approach with built-in `/discovery` and `/ready` endpoints, request handling, and lifecycle management
- **Standalone classes** - Regular TypeScript classes that use `@tool` decorators without extending ToolFunction

> [!NOTE]
> The SDK currently supports **one OCP function per app**. However, you can register multiple tools within that function using multiple `@tool` decorators.

## About the Opal Tool SDK

This sample app uses the `@optimizely-opal/opal-tool-ocp-sdk`, which streamlines Opal tool development with:

- **Decorator-based tool registration** - Use `@tool` and `@interaction` decorators instead of manual discovery payloads
- **Automatic parameter validation** - SDK validates all parameters and returns RFC 9457 compliant error responses
- **Type-safe development** - Full TypeScript support with comprehensive type definitions
- **Automatic request routing** - No need to manually check paths and route requests
- **Built-in endpoints** - `/discovery` and `/ready` endpoints automatically generated
- **Authentication support** - Built-in OptiID authentication integration

The SDK significantly reduces boilerplate code and makes tool development faster and more maintainable. 

## Setting up a tool registry

This section describes how a tool registry is set up.

A tool/function is declared in `app.yml` file:
```yml
functions:
  opal_tool:
    entry_point: OpalToolFunction
    description: Opal tool function
    opal_tool: true
```

The value of `entry_point` property is the name of the class that implements the tool. The file is located in `src/functions` folder. The file exports a class, which name matches the value of `entry_point` property.
`opal_tool` flag tells OCP that the function implements Opal tools. OCP will allow users to register the tool from OCP UI. 

Here is the template of an Opal tool function class. Check [src/functions/OpalToolFunction.ts](./src/functions/OpalToolFunction.ts) for sample implementation.

```TypeScript
import { logger } from '@zaiusinc/app-sdk';
import { ToolFunction, tool, ParameterType, OptiIdAuthData } from '@optimizely-opal/opal-tool-ocp-sdk';

// Define interfaces for the parameters of each function
interface Tool1Parameters {
  param1: string;
  param2?: number;
}

/**
 * Class that implements the Opal tool functions. Requirements:
 * - Must extend the ToolFunction class from the SDK
 * - Name must match the value of entry_point property from app.yml manifest
 * - Name must match the file name
 */
export class OpalToolFunction extends ToolFunction {

  /**
   * Optional: Override the ready() method to check if the function is ready
   * The /ready endpoint will call this method and return the status
   */
  protected async ready(): Promise<boolean> {
    // Add any initialization checks here
    return true;
  }

  /**
   * Tool definition using the @tool decorator
   *
   * The @tool decorator automatically:
   * - Registers the tool in the discovery endpoint
   * - Validates parameters against the defined schema
   * - Routes requests to this handler method
   * - Returns RFC 9457 compliant error responses for validation failures
   */
  @tool({
    name: 'tool1',
    description: 'Description of the tool',
    endpoint: '/tools/tool1',
    parameters: [
      {
        name: 'param1',
        type: ParameterType.String,
        description: 'Text param',
        required: true
      },
      {
        name: 'param2',
        type: ParameterType.Number,
        description: 'Numeric param',
        required: false
      }
    ]
  })
  async tool1Handler(parameters: Tool1Parameters, authData?: OptiIdAuthData) {
    logger.info('Tool1 called with parameters:', parameters);

    // Implement your logic here
    return {
      output_value: `Processed ${parameters.param1}`,
      param2: parameters.param2
    };
  }
}
```

**Key features of the new SDK:**

- **Decorator-based registration**: Use `@tool` decorator to register tools - no manual discovery payload needed
- **Automatic parameter validation**: SDK validates parameters automatically and returns RFC 9457 compliant errors
- **Automatic routing**: SDK handles request routing - no manual path checking needed
- **Type safety**: Full TypeScript support with type-safe parameter interfaces
- **Discovery endpoint**: Automatically generated at `/discovery`
- **Ready endpoint**: Automatically generated at `/ready` (override `ready()` method for custom logic)

Parameter types supported by the SDK:
- `ParameterType.String` - string values
- `ParameterType.Integer` - integer numbers
- `ParameterType.Number` - numeric values (including decimals)
- `ParameterType.Boolean` - boolean values
- `ParameterType.List` - arrays
- `ParameterType.Dictionary` - objects

## Registring tools from OCP UI

For every function marked as Opal tool function (`opal_tool` flag in `app.yml` file), OCP will allow registering tools implemented by the app to Opal directly in OCP UI. 

## Multiple tools within a registry

A single tool registry (ToolFunction class) can contain multiple tools by using multiple `@tool` decorators. This is the recommended way to organize related tools together.

**Example with multiple tools:**

```TypeScript
import { logger } from '@zaiusinc/app-sdk';
import { ToolFunction, tool, ParameterType, OptiIdAuthData } from '@optimizely-opal/opal-tool-ocp-sdk';

export class OpalToolFunction extends ToolFunction {

  // First tool
  @tool({
    name: 'greeting',
    description: 'Greets a person',
    endpoint: '/tools/greeting',
    parameters: [
      {
        name: 'name',
        type: ParameterType.String,
        description: 'Name of the person to greet',
        required: true
      }
    ]
  })
  public async greeting(parameters: { name: string }) {
    return { greeting: `Hello, ${parameters.name}!` };
  }

  // Second tool
  @tool({
    name: 'calculator',
    description: 'Performs arithmetic operations',
    endpoint: '/tools/calculator',
    parameters: [
      {
        name: 'operation',
        type: ParameterType.String,
        description: 'Operation: add, subtract, multiply, divide',
        required: true
      },
      {
        name: 'a',
        type: ParameterType.Number,
        description: 'First number',
        required: true
      },
      {
        name: 'b',
        type: ParameterType.Number,
        description: 'Second number',
        required: true
      }
    ]
  })
  public async calculator(parameters: { operation: string; a: number; b: number }) {
    let result: number;
    switch (parameters.operation) {
    case 'add':
      result = parameters.a + parameters.b;
      break;
    case 'subtract':
      result = parameters.a - parameters.b;
      break;
    case 'multiply':
      result = parameters.a * parameters.b;
      break;
    case 'divide':
      result = parameters.a / parameters.b;
      break;
    default:
      throw new Error(`Unknown operation: ${parameters.operation}`);
    }
    return { result };
  }

  // Add more tools as needed...
}
```

All tools defined with `@tool` decorators within the same ToolFunction class will be automatically:
- Registered in the discovery endpoint
- Routed to the correct handler method
- Validated for parameter types and requirements

## Organizing tools in separate classes

For better code organization, you can define `@tool` decorators in separate classes and import them into your main `ToolFunction` class. The decorators register tools globally, so simply importing the classes is enough to make their tools available.

**Example - Organizing tools by domain:**

**src/tools/WeatherTools.ts:**
```TypeScript
import { tool, ParameterType } from '@optimizely-opal/opal-tool-ocp-sdk';

export class WeatherTools {
  @tool({
    name: 'get_weather',
    description: 'Gets current weather for a location',
    endpoint: '/tools/weather',
    parameters: [
      {
        name: 'city',
        type: ParameterType.String,
        description: 'City name',
        required: true
      }
    ]
  })
  public async getWeather(parameters: { city: string }) {
    // Tool implementation
    return { temperature: 72, conditions: 'sunny', city: parameters.city };
  }
}
```

**src/tools/CalculatorTools.ts:**
```TypeScript
import { tool, ParameterType } from '@optimizely-opal/opal-tool-ocp-sdk';

export class CalculatorTools {
  @tool({
    name: 'add_numbers',
    description: 'Adds two numbers together',
    endpoint: '/tools/add',
    parameters: [
      {
        name: 'a',
        type: ParameterType.Number,
        description: 'First number',
        required: true
      },
      {
        name: 'b',
        type: ParameterType.Number,
        description: 'Second number',
        required: true
      }
    ]
  })
  public async addNumbers(parameters: { a: number; b: number }) {
    return { result: parameters.a + parameters.b };
  }
}
```

**src/functions/OpalToolFunction.ts:**
```TypeScript
import { ToolFunction } from '@optimizely-opal/opal-tool-ocp-sdk';

// Import tool classes - this registers all their @tool decorators
import { WeatherTools } from '../tools/WeatherTools';
import { CalculatorTools } from '../tools/CalculatorTools';

/**
 * Main OCP function class
 * Simply importing the tool classes above registers all their tools
 */
export class OpalToolFunction extends ToolFunction {
  protected async ready(): Promise<boolean> {
    return true;
  }
}
```

**How it works:**
1. **Tool registration** - When you import a class with `@tool` decorators, those decorators execute immediately and register the tools globally with the SDK
2. **Discovery** - The `ToolFunction` base class automatically includes all registered tools in the `/discovery` endpoint
3. **Request routing** - The SDK automatically routes requests to the correct tool handlers
4. **No additional wiring needed** - Just import the classes, and their tools become available

**Benefits of this approach:**
- ✅ **Better organization** - Group related tools together in separate files
- ✅ **Easier maintenance** - Find and modify tools more easily
- ✅ **Team collaboration** - Different developers can work on different tool files
- ✅ **Reusability** - Share tool classes across projects if needed
- ✅ **Cleaner code** - Keep your main `ToolFunction` class simple and focused

**Important notes:**
- You **must** extend `ToolFunction` in your main OCP function class (defined in `app.yml`)
- Tool decorators can be in any class - they don't need to extend anything
- All tools are registered globally, regardless of which class they're defined in
- The main `ToolFunction` class provides the entry point (`perform()` method) that OCP calls

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
