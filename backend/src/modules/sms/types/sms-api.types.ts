export interface SmsProvider {
  name: string;
  apiUrl: string;
  apiKey: string;
}

export interface SmsCountry {
  id: number;
  name: string;
  code: string;
}

export interface SmsService {
  code: string;
  name: string;
}

export interface SmsNumber {
  id: string;
  phone: string;
  operator: string;
}

export interface SmsActivation {
  id: string;
  phone: string;
  service: string;
  country: string;
  status: 'WAITING' | 'RECEIVED' | 'CANCELED' | 'TIMEOUT';
  smsCode?: string;
  expiresAt: Date;
}
