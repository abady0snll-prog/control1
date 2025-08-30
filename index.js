import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';
import dotenv from 'dotenv';  // استخدام import بدلاً من require

dotenv.config();  // لتحميل المتغيرات من .env

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const PREFIX = 'ww';
const token = process.env.DISCORD_TOKEN;  // قراءة التوكن من .env

let userSessions = {};

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // خطوة 1: mention + ww
  if (message.mentions.has(client.user) && message.content.toLowerCase().includes(PREFIX)) {
    userSessions[message.author.id] = { step: 1, images: [] };
    message.reply('**send me pics 1 - 2 **');
    return;
  }

  let session = userSessions[message.author.id];
  if (!session) return;

  // خطوة 2: استقبال الصور
  if (session.step === 1) {
    if (message.attachments.size === 0) {
      message.reply('**ارسل الصوره او صورتين**');
      return;
    }
    session.images = Array.from(message.attachments.values())
      .slice(0, 2)
      .map((a) => a.url);
    session.step = 2;
    message.reply('**ID**');
    return;
  }

  // خطوة 3: استقبال روم الـID
  if (session.step === 2) {
    const channel = message.guild.channels.cache.get(message.content.trim());
    if (!channel) {
      message.reply('**ID NOT FOUND**');
      return;
    }

    // إرسال الصور مع زر تحميل
    for (const img of session.images) {
      const embed = new EmbedBuilder()
        .setImage(img)
        .setColor('#e6dfdf'); // هنا تم تغيير اللون إلى الأسود

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('تحميل').setStyle(ButtonStyle.Link).setURL(img)
      );

      await channel.send({ embeds: [embed], components: [row] });
    }

    // إرسال صورة tob.png من الملفات
    if (fs.existsSync('./tob.png')) {
      await channel.send({ files: ['./tob.png'] });
    }

    delete userSessions[message.author.id];
  }
});

// تسجيل الدخول باستخدام التوكن من .env
client.login(process.env.DISCORD_TOKEN);
