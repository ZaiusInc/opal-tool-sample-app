import { logger } from '@zaiusinc/app-sdk';
import { ToolFunction, tool, ParameterType, OptiIdAuthData } from '@optimizely-opal/opal-tool-ocp-sdk';
// import { storage } from '@zaiusinc/app-sdk';
// import { AuthSection } from '../data/data';

// Define interfaces for the parameters of each function
interface GreetingParameters {
  name: string;
  language?: string;
}

interface DateParameters {
  format?: string;
}

/**
 * Class that implements the Opal tool functions. Requirements:
 * - Must extend the ToolFunction class from the SDK
 * - Name must match the value of entry_point property from app.yml manifest
 * - Name must match the file name
 */
export class OpalToolFunction extends ToolFunction {

  /**
   * Optional: Override the ready() method to check if the function is ready to process requests
   * The /ready endpoint will call this method and return the status
   */
  protected async ready(): Promise<boolean> {
    // Add any initialization checks here
    // For example: check if external services are available, configuration is valid, etc.
    return true;
  }

  /**
   * Optional: Bearer token authentication
   * Uncomment this method to validate bearer tokens before processing requests
   */
  /*
  protected async validateBearerToken(): Promise<boolean> {
    const bearerToken = (await storage.settings.get('bearer_token')).bearer_token as string;
    if (bearerToken && this.request.headers.get('Authorization') !== `Bearer ${bearerToken}`) {
      logger.warn('Invalid or missing bearer token', JSON.stringify(this.request));
      return false;
    }
    return true;
  }
  */

  /**
   * Greeting tool - greets a person in a specified or random language
   *
   * The @tool decorator automatically:
   * - Registers the tool in the discovery endpoint
   * - Validates parameters against the defined schema
   * - Routes requests to this handler method
   * - Returns RFC 9457 compliant error responses for validation failures
   */
  @tool({
    name: 'greeting',
    description: 'Greets a person in a random language (English, Spanish, or French)',
    endpoint: '/tools/greeting',
    parameters: [
      {
        name: 'name',
        type: ParameterType.String,
        description: 'Name of the person to greet',
        required: true
      },
      {
        name: 'language',
        type: ParameterType.String,
        description: 'Language for greeting (defaults to random)',
        required: false
      }
    ]
  })
  public async greeting(parameters: GreetingParameters, _authData?: OptiIdAuthData) {
    /*
     * Example: fetching configured username/password credentials
     *
     * const auth = await storage.settings.get<AuthSection>('auth');
     */

    /*
     * Example: fetching Google OAuth token from secret storage
     *
     * const token = await storage.secrets.get<Token>('token');
     */

    /*
     * Example: using OptiID authentication data
     *
     * if (authData) {
     *   const { customer_id, instance_id, access_token } = authData.credentials;
     *   // Use the credentials for authenticated operations
     * }
     */

    logger.info('Greeting tool called with parameters:', parameters);

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

  /**
   * Today's date tool - returns the current date in a specified format
   */
  @tool({
    name: 'todays-date',
    description: 'Returns today\'s date in the specified format',
    endpoint: '/tools/todays-date',
    parameters: [
      {
        name: 'format',
        type: ParameterType.String,
        description: 'Date format (defaults to ISO format)',
        required: false
      }
    ]
  })
  public async todaysDate(parameters: DateParameters, _authData?: OptiIdAuthData) {
    logger.info('Today\'s date tool called with parameters:', parameters);

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
