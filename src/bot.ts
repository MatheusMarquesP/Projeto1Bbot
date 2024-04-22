import TelegramBot from 'node-telegram-bot-api';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';

config(); 

const prisma = new PrismaClient();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      Bot_Token: string;
    }
  }
}

const bot = new TelegramBot(process.env.Bot_Token, { polling: true });

bot.on('message', async (msg: TelegramBot.Message) => {
  const chatId: number = msg.chat.id;
  const currentTime: Date = new Date();
  const currentHour: number = currentTime.getHours();

  if (currentHour >= 7 && currentHour < 8) {
    bot.sendMessage(chatId, 'Informações em: https://uvv.br');
  } else {
    bot.sendMessage(
      chatId,
      'Olá! Estamos fora do horário comercial. Por favor, informe seu e-mail para contato:'
    );

    bot.once('message', async (msg: TelegramBot.Message) => {
      const userEmail: string = msg.text || '';

      try {
        const user = await prisma.user.upsert({
          where: {
            id_telegram: chatId.toString(),
          },
          update: {
            name: `${msg.chat.first_name} ${msg.chat.last_name}`,
          },
          create: {
            name: `${msg.chat.first_name} ${msg.chat.last_name}`,
            id_telegram: chatId.toString(),
            email: userEmail,
          },
        });

        await bot.sendMessage(
          chatId,
          `Seu e-mail ${userEmail} foi salvo! Agradecemos pelo contato.`
        );
      } catch (error) {
        console.error('Erro ao salvar o e-mail:', error);
        await bot.sendMessage(
          chatId,
          'Ocorreu um erro ao salvar o e-mail. Por favor, tente novamente.'
        );
      }
    });
  }
});

bot.on('polling_error', (error: Error) => {
  console.error('Erro no polling:', error);
});

