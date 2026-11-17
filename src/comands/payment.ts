import 'dotenv/config';
import { MyContext } from "../types.js";
import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { products } from "../constants/products.js";
import {User} from "../models/User.js";
import { Order } from "../models/Order.js";

export const payments = async (ctx: CallbackQueryContext<MyContext>) => {
    await ctx.answerCallbackQuery();

    const productId = parseInt(ctx.callbackQuery.data.split("-")[1], 10);
    const product = products.find((product) => product.id === productId);

    if(!product) {
        return ctx.callbackQuery.message?.editText("Кажется, что-то пошло не так");
    }

    try {
        const chatId = ctx.chat?.id;
        if(!chatId) {
           return await ctx.reply("Chat ID is missing");
        }

        const providerInvoiceData = {
            receipt: {
                items: [
                    {
                        description: product.description,
                        quantity: 1,
                        amount: {
                            value: `${product.price}.00`,
                            currency: "RUB",
                        },
                        vat_code: 1
                    }
                ]
            }
        }

        await ctx.api.sendInvoice(chatId, product.name, product.description, product.id.toString(), "RUB", [
            {
                label: "Руб",
                amount: product.price * 100,
            }
        ], {
            provider_token: process.env.PAYMENT_TOKEN,
            need_email: true,
            send_email_to_provider: true,
            provider_data: JSON.stringify(providerInvoiceData),
        });
    } catch (e) {
        console.error("Error in payment");
        await ctx.reply("Произошла ошибка, обратитесь к @midagaymard")
    }
}


export const telegramSuccessPaymentsHandler = async (ctx: MyContext) => {
    console.log(ctx.message?.successful_payment);

    if(!ctx.message?.successful_payment) {
        return await ctx.reply("Произошла ошибка, обратитесь к @midagaymard")
    }

    const { invoice_payload, total_amount } = ctx.message?.successful_payment;

    const productId = parseInt(invoice_payload);
    const price = total_amount / 100;

    try {
        const user = await User.findOne({
            telegramId: ctx.from?.id
        });

        if(!user) {
            throw new Error(`${ctx.from?.id}: User not found`);
        }

        await Order.create({
            userId: user._id,
            productId,
            price,
        });

        await ctx.reply("Оплата прошла успешно", {
            reply_markup: new InlineKeyboard().text("Меню", "menu")
        })

    } catch (e) {
        console.error(`${e}`);
        return await ctx.reply("Произошла ошибка, обратитесь к @midagaymard")
    }
}