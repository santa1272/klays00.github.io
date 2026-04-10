// netlify/functions/counter.js
const fs = require('fs');
const path = require('path');

// Путь к файлу, где будем хранить значение счётчика
const DATA_FILE = path.join('/tmp', 'global_counter.json');

exports.handler = async (event, context) => {
  const method = event.httpMethod;
  
  // Читаем текущее значение из файла (или создаём 0)
  let count = 0;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      count = JSON.parse(data).count || 0;
    }
  } catch (e) {
    console.error('Ошибка чтения файла:', e);
  }

  // Если GET — возвращаем текущее значение
  if (method === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ count })
    };
  }

  // Если POST — увеличиваем счётчик и сохраняем
  if (method === 'POST') {
    count += 1;
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ count }), 'utf8');
    } catch (e) {
      console.error('Ошибка записи файла:', e);
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ count })
    };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};