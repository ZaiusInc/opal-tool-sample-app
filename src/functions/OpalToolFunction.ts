import { logger, Function, Response, storage } from '@zaiusinc/app-sdk';
// import { AuthSection } from '../data/data';

// Define interfaces for the parameters of each function
interface GreetingParameters {
  name: string;
  language?: string;
}

interface DateParameters {
  format?: string;
}

// Define Opal tool metadata  - list of tools and their parameters
const discoveryPayload = {
  'functions': [
    {
      'name': 'greeting',
      'description': 'Greets a person in a random language (English, Spanish, or French)',
      'parameters': [
        {
          'name': 'name',
          'type': 'string',
          'description': 'Name of the person to greet',
          'required': true
        },
        {
          'name': 'language',
          'type': 'string',
          'description': 'Language for greeting (defaults to random)',
          'required': false
        }
      ],
      'endpoint': '/tools/greeting',
      'http_method': 'POST'
    },
    {
      'name': 'todays-date',
      'description': 'Returns today\'s date in the specified format',
      'parameters': [
        {
          'name': 'format',
          'type': 'string',
          'description': 'Date format (defaults to ISO format)',
          'required': false
        }
      ],
      'endpoint': '/tools/todays-date',
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
    // uncomment the following lines to enable bearer token authentication
    /*
    const bearerToken = (await storage.settings.get('bearer_token')).bearer_token as string;
    if (bearerToken && this.request.headers.get('Authorization') !== `Bearer ${bearerToken}`) {
      logger.warn('Invalid or missing bearer token', JSON.stringify(this.request));
      return new Response(401, 'Invalid or missing bearer token');
    }
    */

    /*
     * example: fetching configured username/password credentials
     *
    const auth = await storage.settings.get<AuthSection>('auth');
    */

    /*
     * example: fetching Google Oauth token from secret storage
     *
     const token = await storage.secrets.get<Token>('token');
     */

    if (this.request.path === '/discovery') {
      return new Response(200, discoveryPayload);
    } else if (this.request.path === '/tools/greeting') {
      const params = this.extractParameters() as GreetingParameters;
      const response =  this.greeting(params);
      return new Response(200, response);
    } else if (this.request.path === '/tools/todays-date') {
      const params = this.extractParameters() as DateParameters;
      const response =  this.todaysDate(params);
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
  private async greeting(parameters: GreetingParameters) {
    const { name, language } = parameters;

    // If language not specified, choose randomly
    const selectedLanguage = language ||
      ['english', 'spanish', 'french'][Math.floor(Math.random() * 3)];

    // Generate greeting based on language
    let greeting: string;
    if (selectedLanguage.toLowerCase() === 'spanish') {
      greeting = `¡Hola, ${name}! ¿Cómo estás?`;
    } else if (selectedLanguage.toLowerCase() === 'french') {
      greeting = `Bonjour, ${name}! Comment ça va?`;
    } else { // Default to English
      greeting = `Hello, ${name}! How are you?`;
    }

    return {
      greeting,
      language: selectedLanguage
    };
  }

  private async todaysDate(parameters: DateParameters) {
    const format = parameters.format || '%Y-%m-%d';

    // Get today's date
    const today = new Date();

    // Format the date (simplified implementation)
    let formattedDate: string;
    if (format === '%Y-%m-%d') {
      formattedDate = today.toISOString().split('T')[0];
    } else if (format === '%B %d, %Y') {
      formattedDate = today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (format === '%d/%m/%Y') {
      formattedDate = today.toLocaleDateString('en-GB');
    } else {
      // Default to ISO format
      formattedDate = today.toISOString().split('T')[0];
    }

    return {
      date: formattedDate,
      format,
      timestamp: today.getTime() / 1000
    };
  }
}
