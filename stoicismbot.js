const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const token = '5656691460:AAFl9Ljwh3hijUCHYbPUkDZlx-QNDKSolKM';
const bot = new TelegramBot(token, { polling: true });

let quotes = [];
let usersData = [];

// Read quotes and user data from file
fs.readFile('quotes.json', 'utf8', (err, data) => {
if (err) throw err;
quotes = JSON.parse(data);
});

fs.readFile('usersData.json', 'utf8', (err, data) => {
if (err) throw err;
usersData = JSON.parse(data);
});



// Map to store chat id and its next message time
const chatMap = new Map();

bot.onText(/start/, (msg) => {
const chatId = msg.chat.id;
const nextMessageTime = new Date();
nextMessageTime.setHours (nextMessageTime.getHours() + 12);
chatMap.set(chatId, nextMessageTime);

// If user data not exists, add it
if (!usersData[chatId]) {
usersData[chatId] = {
sent: 0,
read: 0,
};
fs.writeFileSync('usersData.json', JSON.stringify(usersData), 'utf8');
}

// count number of bot users
let botUsersCount = Object.keys(usersData).length;

// Add the number of users to the usersData object
usersData["botUsersCount"] = botUsersCount;

// Write the updated usersData object to the usersData.json file
fs.writeFileSync('usersData.json', JSON.stringify(usersData), 'utf8');

// Send quote and increment the sent and read count
const quote = quotes[Math.floor(Math.random() * quotes.length)];
bot.sendMessage(chatId, quote.text).then(() => {
usersData[chatId].sent += 1;
fs.writeFileSync('usersData.json', JSON.stringify(usersData), 'utf8');
});
});

// Handle message read event
bot.on('message', (msg) => {
const chatId = msg.chat.id;
if (usersData[chatId]) {
botUsersCount = Object.keys(usersData).length;
console.log('Number of bot users: ', botUsersCount);
usersData[chatId].read += 1;
fs.writeFileSync('usersData.json', JSON.stringify(usersData), 'utf8');
}
});

// Async function to send daily message
async function sendDailyMessage() {
while (true) {
const now = new Date();
for (const [chatId, nextMessageTime] of chatMap) {
if (nextMessageTime <= now) {
const quote = quotes[Math.floor(Math.random() * quotes.length)];
bot.sendMessage(chatId, quote.text).then(() => {
usersData[chatId].sent += 1;
fs.writeFileSync('usersData.json', JSON.stringify(usersData), 'utf8');
});
chatMap.set(chatId, new Date(nextMessageTime.getTime() + 12 * 60 * 60 * 1000));
}
}
await new Promise((resolve) => setTimeout(resolve, 60000));
}
}

// Start the async function
sendDailyMessage().catch(console.error);

// Может убрать чтобы не дублировать цикл?
let botUsersCount = Object.keys(usersData);