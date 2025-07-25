import * as App from '@zaiusinc/app-sdk';

export interface AuthSection extends App.ValueHash {
  email?: string;
  api_key?: string;
}

export interface Token extends App.ValueHash {
  value: string;
  refresh: string;
  exp: number;
}
