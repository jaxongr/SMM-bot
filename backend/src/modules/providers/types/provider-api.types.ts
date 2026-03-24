export interface ProviderInfo {
  id: string;
  apiUrl: string;
  apiKey: string;
}

export interface ProviderBalanceResponse {
  balance: string;
  currency: string;
}

export interface ProviderExternalService {
  service: number;
  name: string;
  type: string;
  rate: string;
  min: string;
  max: string;
  category: string;
  refill: boolean;
  cancel: boolean;
  dripfeed: boolean;
}

export interface ProviderCreateOrderParams {
  service: string;
  link: string;
  quantity: number;
  runs?: number;
  interval?: number;
}

export interface ProviderCreateOrderResponse {
  order: number;
}

export interface ProviderOrderStatusResponse {
  charge: string;
  start_count: string;
  status: string;
  remains: string;
  currency: string;
}

export interface ProviderMultipleOrderStatusResponse {
  [orderId: string]: ProviderOrderStatusResponse;
}

export interface ProviderCancelResponse {
  cancel?: number;
  error?: string;
}

export interface ProviderRefillResponse {
  refill?: number;
  error?: string;
}

export interface ProviderApiError {
  error: string;
}
