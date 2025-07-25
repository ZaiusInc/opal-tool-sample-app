import { logger, Function, Response, storage } from '@zaiusinc/app-sdk';

// Define interfaces for the parameters of each function
interface ToolParameters {
  name: string;
  language?: string;
}

// Define Opal tool metadata  - list of tools and their parameters
const discoveryPayload = {
  'functions': [
    {
      'name': '<tool_name>',
      'description': '<tool_description>',
      'parameters': [
        {
          'name': '<parameter_name>',
          'type': '<parameter_type: string|number|boolean|etc>',
          'description': '<parameter_description>',
          'required': true
        }
      ],
      'endpoint': '/tools/<tool_name>',
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
export class AnotherOpalToolFunction extends Function {

  /**
   * Processing the request from Opal
   * Add your logic here to handle every tool declared in the discoveryPayload.
   */
  public async perform(): Promise<Response> {
    // uncomment the following lines to enable bearer token authentication
    /*
    const bearerToken = (await storage.settings.get('bearer_token')).bearer_token as string;
    if (bearerToken && this.request.headers.get('Authorization') !== `Bearer ${bearerToken}`) {
      logger.warn('Invalid or missing bearer token', JSON.stringify(this.request));
      return new Response(401, 'Invalid or missing bearer token');
    }
    */

    if (this.request.path === '/discovery') {
      return new Response(200, discoveryPayload);
    } else {
      if (this.request.path === '/tools/<tool_name>') {
        const params = this.extractParameters() as ToolParameters;
        const response =  this.toolHandler(params);
        return new Response(200, response);
      } else {
        return new Response(400, 'Invalid path');
      }
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
  private async toolHandler(parameters: ToolParameters) {
    return {
      output: `Hello, ${parameters.name}!`,
    };
  }

}
