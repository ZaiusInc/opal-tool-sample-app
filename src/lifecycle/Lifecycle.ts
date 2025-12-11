import * as App from '@zaiusinc/app-sdk';
import {
  Lifecycle as AppLifecycle,
  AuthorizationGrantResult,
  LifecycleResult,
  LifecycleSettingsResult,
  logger,
  Request,
  storage,
  SubmittedFormData
} from '@zaiusinc/app-sdk';
// import { AuthSection, Token } from '../data/data';


export class Lifecycle extends AppLifecycle {
  public async onInstall(): Promise<LifecycleResult> {
    try {
      logger.info('Performing Install');

      /* example: initialize Google oauth section
      await storage.settings.patch('oauth', {
        authorized: false
      });
      */

      return { success: true };
    } catch (error: any) {
      logger.error('Error during installation:', error);
      return {
        success: false,
        retryable: true,
        message: `Error during installation: ${error}`,
      };
    }
  }

  public async onSettingsForm(
    section: string,
    action: string,
    formData: SubmittedFormData
  ): Promise<LifecycleSettingsResult> {
    const result = new LifecycleSettingsResult();
    try {
      // TODO: any logic you need to perform when a setup form section is submitted
      // When you are finished, save the form data to the settings store
      if (section === 'bearer_token') {
        if (action === 'save_token') {
          await storage.settings.put(section, formData);
        }
      }

      /*
       * example of handling username/password auth section
       *
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
      */

      return result;
    } catch {
      return result.addToast(
        'danger',
        'Sorry, an unexpected error occurred. Please try again in a moment.'
      );
    }
  }

  public async onAuthorizationRequest(
    _section: string,
    _formData: SubmittedFormData
  ): Promise<LifecycleSettingsResult> {
    // example: handling OAuth authorization request
    const result = new LifecycleSettingsResult();

    /* example: handling OAuth authorization request
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
    */

    return result.addToast('danger', 'Sorry, OAuth is not supported.');
  }

  public async onAuthorizationGrant(
    _request: Request
  ): Promise<AuthorizationGrantResult> {

    /* example: handling OAuth authorization grant

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
    */

    return new AuthorizationGrantResult('').addToast(
      'danger',
      'Sorry, OAuth is not supported.'
    );
  }

  public async onUpgrade(_fromVersion: string): Promise<LifecycleResult> {
    // TODO: any logic required when upgrading from a previous version of the app
    // Note: `fromVersion` may not be the most recent version or could be a beta version
    // write the generated webhook to the swell settings form
    return { success: true };
  }

  public async onFinalizeUpgrade(
    _fromVersion: string
  ): Promise<LifecycleResult> {
    // TODO: any logic required when finalizing an upgrade from a previous version
    // At this point, new webhook URLs have been created for any new functions in this version
    return { success: true };
  }

  public async onAfterUpgrade(): Promise<LifecycleResult> {
    // TODO: any logic required after the upgrade has been completed.  This is the plugin point
    // for triggering one-time jobs against the upgraded installation
    return { success: true };
  }

  public async onUninstall(): Promise<LifecycleResult> {
    // TODO: any logic required to properly uninstall the app
    return { success: true };
  }
}
