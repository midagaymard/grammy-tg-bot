import { CallbackQueryContext,InlineKeyboard } from "grammy";
import { MyContext } from "../types.js"

export const backToMenu = async (ctx: CallbackQueryContext<MyContext>) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
        "Вы в главном меню магазина.\nОтсюда вы можете попасть в раздел с товарами и в свой профиль. Для перехода нажмите на кнопу ниже",
        {
            reply_markup: new InlineKeyboard()
                .text("Товары", "products")
                .text("Профиль", "profile")
        }
    );
}