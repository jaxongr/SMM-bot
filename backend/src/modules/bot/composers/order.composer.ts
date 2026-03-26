import { Composer, InlineKeyboard } from 'grammy';
import { Logger } from '@nestjs/common';
import { BotContext } from '../types/context.type';
import { mainMenuKeyboard } from '../keyboards/main-menu.keyboard';
import { formatPrice } from '../utils/format-message';
import { getPackageContents, sendPackageToProvider } from '../utils/package-orders';
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

      const cancelKb = new InlineKeyboard().text('❌ Bekor qilish', 'cancel_order');

      const isPackage = svc.minQuantity === 1 && svc.maxQuantity <= 10;
      const priceInfo = isPackage
        ? `💰 Paket narxi: ${formatPrice(Number(svc.pricePerUnit))}`
        : `💰 Narx: ${formatPrice(Number(svc.pricePerUnit) * 1000)} / 1000\n📦 Min: ${svc.minQuantity} | Max: ${svc.maxQuantity}`;

      await ctx.editMessageText(
        `<b>🛒 Buyurtma: ${name}</b>\n\n` +
        `${priceInfo}\n\n` +
        `🔗 <b>Kanal/guruh/profil linkini yuboring:</b>\n\n` +
        `<i>Yoki bekor qilish uchun tugmani bosing</i>`,
        { parse_mode: 'HTML', reply_markup: cancelKb },
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

      // Bekor qilish so'zi
      if (link.toLowerCase() === 'bekor' || link === '❌' || link.toLowerCase() === 'cancel') {
        session.waitingOrderLink = false;
        session.orderServiceId = undefined;
        await ctx.reply('❌ Buyurtma bekor qilindi.', { parse_mode: 'HTML' });
        return;
      }

      if (!link.startsWith('http') && !link.startsWith('t.me') && !link.startsWith('@')) {
        await ctx.reply('❌ Noto\'g\'ri link! Qaytadan kiriting:\n\nMasalan: <code>https://t.me/kanal_nomi</code>\n\nBekor qilish uchun: <b>bekor</b> yozing', { parse_mode: 'HTML' });
        return;
      }

      session.waitingOrderLink = false;
      session.orderLink = link;

      const serviceId = session.orderServiceId as string;
      try {
        const result = await servicesService.findById(serviceId);
        const svc = result.data;
        const isPackage = svc.minQuantity === 1 && svc.maxQuantity <= 10;

        if (isPackage) {
          // Paket — miqdor so'ramasdan to'g'ridan tasdiqlashga
          const lang = getLang(ctx);
          const name = (svc.name as Record<string, string>)[lang] ||
            (svc.name as Record<string, string>)['uz'] || 'Xizmat';
          const totalPrice = Number(svc.pricePerUnit);
          const userBalance = ctx.user?.balance || 0;

          const keyboard = new InlineKeyboard()
            .text('✅ Tasdiqlash', `confirm_order:${serviceId}:1`)
            .row()
            .text('❌ Bekor qilish', 'cancel_order');

          await ctx.reply(
            `<b>📦 Paket buyurtmasi:</b>\n\n` +
            `🔧 Paket: <b>${name}</b>\n` +
            `🔗 Link: <code>${link}</code>\n` +
            `💰 Narx: <b>${formatPrice(totalPrice)}</b>\n` +
            `💳 Balans: <b>${formatPrice(userBalance)}</b>\n\n` +
            (userBalance < totalPrice
              ? `❌ <b>Balans yetarli emas!</b> ${formatPrice(totalPrice - userBalance)} yetmaydi.`
              : `✅ Tasdiqlash uchun tugmani bosing:`),
            { parse_mode: 'HTML', reply_markup: userBalance >= totalPrice ? keyboard : undefined },
          );
          return;
        }

        // Oddiy xizmat — miqdor so'rash
        session.waitingOrderQuantity = true;
        await ctx.reply(
          `🔗 Link: <code>${link}</code>\n\n` +
          `🔢 <b>Miqdorni kiriting:</b>\n` +
          `📦 Min: <b>${svc.minQuantity}</b> | Max: <b>${svc.maxQuantity.toLocaleString()}</b>`,
          { parse_mode: 'HTML' },
        );
      } catch {
        session.waitingOrderQuantity = true;
        await ctx.reply('🔢 <b>Miqdorni kiriting:</b>', { parse_mode: 'HTML' });
      }
      return;
    }

    // Step 2: Capture quantity
    if (session.waitingOrderQuantity) {
      const text = ctx.message.text.trim().toLowerCase();
      if (text === 'bekor' || text === '❌' || text === 'cancel') {
        session.waitingOrderQuantity = false;
        session.orderServiceId = undefined;
        session.orderLink = undefined;
        await ctx.reply('❌ Buyurtma bekor qilindi.', { parse_mode: 'HTML' });
        return;
      }

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
      let packageResults: string[] = [];
      const isPackage = svc.minQuantity === 1 && svc.maxQuantity <= 10;
      const packageContents = getPackageContents(name);

      try {
        if (isPackage && packageContents) {
          // PAKET — barcha xizmatlarni alohida yuborish
          const result = await sendPackageToProvider(prisma, order.id, link, name);
          packageResults = result.results;
          providerStatus = result.success ? '🔄 Barcha xizmatlar yuborildi' : '⚠️ Ba\'zi xizmatlar yuborilmadi';
          logger.log(`Package order sent: ${name}, success=${result.success}`);
        } else {
          // ODDIY XIZMAT — bitta provayederga yuborish
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

      const packageInfo = packageResults.length > 0
        ? `\n\n📦 <b>Paket tarkibi:</b>\n${packageResults.join('\n')}`
        : '';

      await ctx.editMessageText(
        `<b>✅ Buyurtma yaratildi!</b>\n\n` +
        `🆔 Buyurtma: <code>#${order.id.slice(-6).toUpperCase()}</code>\n` +
        `🔧 ${isPackage ? 'Paket' : 'Xizmat'}: ${name}\n` +
        (isPackage ? '' : `🔢 Miqdor: ${quantity.toLocaleString()}\n`) +
        `💰 Narx: ${formatPrice(totalPrice)}\n` +
        `📊 Holat: ${providerStatus}` +
        `${packageInfo}\n\n` +
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
