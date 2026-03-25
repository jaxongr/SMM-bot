import { Composer, InlineKeyboard } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { formatPrice } from '../utils/format-message';
import { t, getLang } from '../utils/i18n.helper';
import { ServicesService } from '../../services/services.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BalanceService } from '../../balance/balance.service';

const logger = new Logger('OrderComposer');

export function createOrderComposer(
  servicesService: ServicesService,
  prisma: PrismaService,
  balanceService: BalanceService,
): Composer<BotContext> {
  const composer = new Composer<BotContext>();

  // User clicks "Buyurtma berish" button from service detail
  composer.callbackQuery(/^order:(.+)$/, async (ctx) => {
    const serviceId = ctx.match[1];
    if (serviceId === 'confirm' || serviceId === 'cancel') return;

    try {
      const result = await servicesService.findById(serviceId);
      const svc = result.data;
      const lang = getLang(ctx);
      const name = (svc.name as Record<string, string>)[lang] ||
        (svc.name as Record<string, string>)['uz'] || 'Xizmat';

      // Save service ID to session
      if (ctx.session) {
        ctx.session.orderServiceId = serviceId;
        ctx.session.waitingOrderLink = true;
      }

      await ctx.editMessageText(
        `<b>🛒 Buyurtma: ${name}</b>\n\n` +
        `💰 Narx: ${formatPrice(Number(svc.pricePerUnit) * 1000)} / 1000\n` +
        `📦 Min: ${svc.minQuantity} | Max: ${svc.maxQuantity}\n\n` +
        `🔗 <b>Kanal/guruh/profil linkini yuboring:</b>`,
        { parse_mode: 'HTML' },
      );
    } catch (error) {
      logger.error(`Service not found: ${error}`);
      await ctx.answerCallbackQuery({ text: 'Xizmat topilmadi' });
    }
    await ctx.answerCallbackQuery();
  });

  // Capture link
  composer.on('message:text', async (ctx, next) => {
    const session = ctx.session;
    if (!session?.waitingOrderLink && !session?.waitingOrderQuantity) {
      return next();
    }

    // Step 1: Capture link
    if (session.waitingOrderLink) {
      const link = ctx.message.text.trim();

      if (!link.startsWith('http') && !link.startsWith('t.me') && !link.startsWith('@')) {
        await ctx.reply('❌ Noto\'g\'ri link! Qaytadan kiriting:\n\nMasalan: <code>https://t.me/kanal_nomi</code>', { parse_mode: 'HTML' });
        return;
      }

      session.waitingOrderLink = false;
      session.orderLink = link;
      session.waitingOrderQuantity = true;

      const serviceId = session.orderServiceId as string;
      try {
        const result = await servicesService.findById(serviceId);
        const svc = result.data;
        await ctx.reply(
          `🔗 Link: <code>${link}</code>\n\n` +
          `🔢 <b>Miqdorni kiriting:</b>\n` +
          `📦 Min: <b>${svc.minQuantity}</b> | Max: <b>${svc.maxQuantity.toLocaleString()}</b>`,
          { parse_mode: 'HTML' },
        );
      } catch {
        await ctx.reply('🔢 <b>Miqdorni kiriting:</b>', { parse_mode: 'HTML' });
      }
      return;
    }

    // Step 2: Capture quantity
    if (session.waitingOrderQuantity) {
      const qty = parseInt(ctx.message.text.replace(/\s/g, ''), 10);
      const serviceId = session.orderServiceId as string;

      let svc;
      try {
        const result = await servicesService.findById(serviceId);
        svc = result.data;
      } catch {
        await ctx.reply('❌ Xizmat topilmadi');
        session.waitingOrderQuantity = false;
        return;
      }

      if (isNaN(qty) || qty < svc.minQuantity || qty > svc.maxQuantity) {
        await ctx.reply(
          `❌ Miqdor ${svc.minQuantity} dan ${svc.maxQuantity.toLocaleString()} gacha bo'lishi kerak!`,
          { parse_mode: 'HTML' },
        );
        return;
      }

      session.waitingOrderQuantity = false;
      const link = session.orderLink as string;
      const lang = getLang(ctx);
      const name = (svc.name as Record<string, string>)[lang] ||
        (svc.name as Record<string, string>)['uz'] || 'Xizmat';
      const totalPrice = Number(svc.pricePerUnit) * qty;
      const userBalance = ctx.user?.balance || 0;

      const keyboard = new InlineKeyboard()
        .text('✅ Tasdiqlash', `confirm_order:${serviceId}:${qty}`)
        .row()
        .text('❌ Bekor qilish', 'cancel_order');

      await ctx.reply(
        `<b>📋 Buyurtma ma'lumotlari:</b>\n\n` +
        `🔧 Xizmat: <b>${name}</b>\n` +
        `🔗 Link: <code>${link}</code>\n` +
        `🔢 Miqdor: <b>${qty.toLocaleString()}</b>\n` +
        `💰 Narx: <b>${formatPrice(totalPrice)}</b>\n` +
        `💳 Balans: <b>${formatPrice(userBalance)}</b>\n\n` +
        (userBalance < totalPrice
          ? `❌ <b>Balans yetarli emas!</b> ${formatPrice(totalPrice - userBalance)} yetmaydi.`
          : `✅ Tasdiqlash uchun tugmani bosing:`),
        { parse_mode: 'HTML', reply_markup: userBalance >= totalPrice ? keyboard : undefined },
      );
      return;
    }

    return next();
  });

  // Confirm order
  composer.callbackQuery(/^confirm_order:(.+):(\d+)$/, async (ctx) => {
    const serviceId = ctx.match[1];
    const quantity = parseInt(ctx.match[2], 10);
    const link = ctx.session.orderLink as string;

    if (!ctx.user || !link) {
      await ctx.answerCallbackQuery({ text: 'Xatolik' });
      return;
    }

    try {
      const result = await servicesService.findById(serviceId);
      const svc = result.data;
      const lang = getLang(ctx);
      const name = (svc.name as Record<string, string>)[lang] ||
        (svc.name as Record<string, string>)['uz'] || 'Xizmat';
      const totalPrice = Number(svc.pricePerUnit) * quantity;

      // Deduct balance
      await balanceService.deduct(
        ctx.user.id,
        totalPrice,
        `Buyurtma: ${name} x${quantity}`,
      );

      // Create order
      const order = await prisma.order.create({
        data: {
          userId: ctx.user.id,
          serviceId,
          link,
          quantity,
          totalPrice,
          status: 'PENDING',
        },
      });

      // Clear session
      const session = ctx.session;
      session.orderServiceId = undefined;
      session.orderLink = undefined;

      // Send to provider automatically
      let providerStatus = '⏳ Kutilmoqda';
      try {
        const mapping = await prisma.serviceProviderMapping.findFirst({
          where: { serviceId, isActive: true },
          include: { providerService: true, provider: true },
          orderBy: { priority: 'desc' },
        });

        if (mapping && mapping.provider.isActive) {
          const params = new URLSearchParams({
            key: mapping.provider.apiKey,
            action: 'add',
            service: mapping.providerService.externalServiceId,
            link,
            quantity: quantity.toString(),
          });

          const resp = await fetch(mapping.provider.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
          });
          const apiResult = await resp.json() as Record<string, unknown>;

          if (apiResult.order) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'PROCESSING',
                providerId: mapping.provider.id,
                providerOrderId: String(apiResult.order),
              },
            });
            providerStatus = '🔄 Provayderga yuborildi';
            logger.log(`Order sent to provider: orderId=${order.id}, providerOrderId=${apiResult.order}`);
          } else {
            logger.error(`Provider rejected order: ${JSON.stringify(apiResult)}`);
          }
        }
      } catch (providerError) {
        logger.error(`Provider send failed: ${providerError}`);
      }

      await ctx.editMessageText(
        `<b>✅ Buyurtma yaratildi!</b>\n\n` +
        `🆔 Buyurtma: <code>#${order.id.slice(-6).toUpperCase()}</code>\n` +
        `🔧 Xizmat: ${name}\n` +
        `🔢 Miqdor: ${quantity.toLocaleString()}\n` +
        `💰 Narx: ${formatPrice(totalPrice)}\n` +
        `📊 Holat: ${providerStatus}\n\n` +
        `⏱ O'rtacha bajarilish vaqti: 5-60 daqiqa`,
        { parse_mode: 'HTML' },
      );

      await ctx.reply(t(ctx, 'main_menu'), {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(lang),
      });

      logger.log(`Order created: id=${order.id}, user=${ctx.user.id}, service=${serviceId}, qty=${quantity}`);
    } catch (error) {
      logger.error(`Order failed: ${error}`);
      const errorMsg = String(error).includes('INSUFFICIENT')
        ? '❌ Balans yetarli emas! Avval balansni to\'ldiring.'
        : '❌ Buyurtma yaratishda xatolik. Qaytadan urinib ko\'ring.';
      await ctx.editMessageText(errorMsg, { parse_mode: 'HTML' });
    }
    await ctx.answerCallbackQuery();
  });

  // Cancel order
  composer.callbackQuery('cancel_order', async (ctx) => {
    const session = ctx.session;
    session.orderServiceId = undefined;
    session.orderLink = undefined;
    session.waitingOrderLink = false;
    session.waitingOrderQuantity = false;

    await ctx.editMessageText('❌ Buyurtma bekor qilindi.', { parse_mode: 'HTML' });
    await ctx.answerCallbackQuery();
  });

  return composer;
}
