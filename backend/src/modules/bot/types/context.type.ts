import { Context, SessionFlavor } from 'grammy';
import { ConversationFlavor } from '@grammyjs/conversations';

export interface SessionData {
  language: string;
  userId?: string;
  smsService?: string;
  waitingPaymentAmount?: boolean;
  waitingPaymentReceipt?: boolean;
  pendingPaymentAmount?: number;
  orderServiceId?: string;
  orderLink?: string;
  waitingOrderLink?: boolean;
  waitingOrderQuantity?: boolean;
}

export interface BotUserData {
  id: string;
  telegramId: bigint;
  username?: string;
  firstName?: string;
  balance: number;
  language: string;
  role: string;
}

type BaseContext = Context & SessionFlavor<SessionData> & {
  user?: BotUserData;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export type BotContext = BaseContext & ConversationFlavor<BaseContext>;
