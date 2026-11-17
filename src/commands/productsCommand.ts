import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { MyContext } from "../types.js"
import { products } from "../constants/products.js"

export const productsCommand = async (ctx: CallbackQueryContext<MyContext>) => {
    await ctx.answerCallbackQuery();

    const productsList = products.reduce((acc, cur) => {
        return ( acc +
            `- ${cur.name}\nЦена ${cur.price}руб.\nОписание: ${cur.description}\n\n`
        );
    }, "")

    const message = `Все товары: \n${productsList}`;

    const keyboardButtonRows = products.map((product) => {
        return InlineKeyboard.text(product.name, `buyProduct-${product.id}`);
    });

    const keyboard = InlineKeyboard.from([
        keyboardButtonRows,
        [InlineKeyboard.text("Назад", "backToMenu")]
    ])

    await ctx.editMessageText(message, {
        reply_markup: keyboard
    });
};
