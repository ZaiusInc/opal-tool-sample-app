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
        help: Paste the URL below into your Opal tool settings to enable the runtime calculator.
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

## Custom configuration and authorization

## Custom dependencies

# Test your Opal tool

To test your app with Opal, build your app and publish it to OCP: 
```bash
$ ocp app prepare --bump-dev-version --publish
```

> [!NOTE]
> `--bump-dev-version` option increases the version of your app in `app.yml` and lets you upgrade previously deployed versions. 

Then, install your app to your sandbox OCP account: 
```bash
$ ocp app install <YOUR_APP_ID>@<YOUR_APP_VERSION> <PUBLIC_API_KEY> 
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
