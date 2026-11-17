import {User} from "../models/User.js";
import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { MyContext } from "../types.js"

export const profile = async (ctx: CallbackQueryContext<MyContext>) => {
    await ctx.answerCallbackQuery();

    const user = await User.findOne({ telegramId: ctx.from?.id });

    if (!user) {
        return ctx.editMessageText(
            "Для доступа к профилю необходимо зарегистрироваться, используя команду /start"
        );
    }

    const registrationDate = user.createdAt
        ? user.createdAt.toLocaleDateString("ru-RU", {
            year: "numeric", month: "2-digit", day: "2-digit"
        })
        : "неизвестно";

    await ctx.editMessageText(
        `Здравствуйте, ${ctx.from?.first_name}\nДата регистрации ${registrationDate}\nУ вас еще нет заказов. Для начала покупок перейдите во вкладку "Товары".`,
        { reply_markup: new InlineKeyboard().text("Назад", "backToMenu") }
    );
}