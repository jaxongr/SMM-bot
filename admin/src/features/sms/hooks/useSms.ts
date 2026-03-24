import { useQuery } from '@tanstack/react-query';
import { smsApi } from '../api/sms.api';
import type { SmsOrderFiltersParams } from '../api/sms.api';

const SMS_KEY = 'sms-orders';

export const useSmsOrders = (params: SmsOrderFiltersParams) => {
  return useQuery({
    queryKey: [SMS_KEY, params],
    queryFn: () => smsApi.getOrders(params),
  });
};

export const useSmsStats = () => {
  return useQuery({
    queryKey: [SMS_KEY, 'stats'],
    queryFn: () => smsApi.getStats(),
  });
};
