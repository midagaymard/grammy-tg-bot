import 'dotenv/config';
import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import mongoose from "mongoose";
import { hydrate } from "@grammyjs/hydrate";
import { MyContext } from "./types.js";
import { User } from "./models/User.js";
import { start, profile, backToMenu, productsCommand, payments, telegramSuccessPaymentsHandler } from "./commands/index.js";
import { products } from "./constants/products.js"

const BOT_API_KEY = process.env.BOT_TOKEN;
if (!BOT_API_KEY) throw new Error('BOT_API_KEY is missing');

const bot = new Bot<MyContext>(BOT_API_KEY);

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
})

bot.use(hydrate());

bot.on(":successful_payment", telegramSuccessPaymentsHandler);

bot.command('start', start);

bot.callbackQuery("menu", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
      "Вы в главном меню магазина.\nОтсюда вы можете попасть в раздел с товарами и в свой профиль. Для перехода нажмите на кнопу ниже",
      {
        reply_markup: new InlineKeyboard()
            .text("Товары", "products")
            .text("Профиль", "profile")
      }
  );
});

bot.callbackQuery("products", productsCommand);

bot.callbackQuery("profile", profile);

bot.callbackQuery(/^buyProduct-\d+$/, payments);

bot.callbackQuery("backToMenu", backToMenu);

bot.on('message:text', async (ctx) => {
  await ctx.reply(ctx.message.text);
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});

async function startBot() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('MongoDB URI is missing');

  try {
    await mongoose.connect(MONGODB_URI);
    await bot.start();
    console.log('MongoDB connected & Bot started');
  } catch (error) {
    console.error('Error in startBot:', error);
  }
}

startBot();
