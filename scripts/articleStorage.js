const { db } = require('@vercel/postgres');
const fs = require('fs');

async function main() {
  const client = await db.connect();
  const fileContent = fs.readFileSync('data/classEvent.md', 'utf-8')
  // addArticle(client, '中台 FLV 视频播放详解', '中台 FLV 视频播放详解', fileContent)
  // await createTable(client)

  await insertData(client, '自定义事件封装', '可以在类里面使用事件，包含注册事件，触发事件，注销事件，检测事件是否存在，只触发一次就销毁的事件', fileContent)
  console.log('success');
}

async function addArticle(client, title, summary, content) {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  const createTable = await client.sql`
        CREATE TABLE IF NOT EXISTS articles (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          summary TEXT,
          content TEXT NOT NULL
      );
    `;
    const article = await client.sql`
      INSERT INTO articles (title, summary, content) 
      VALUES (${title}, ${summary}, ${content}); 
    `

}

async function createTable(client) {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await client.sql`
    CREATE TABLE articles (
      article_id INT PRIMARY KEY,
      title VARCHAR(255),
      summary TEXT,
      date DATE
  );
  `
  await client.sql`
    CREATE TABLE article_content (
      content_id INT PRIMARY KEY,
      article_id INT,
      content TEXT,
      FOREIGN KEY (article_id) REFERENCES articles(article_id),
      date DATE
  );
  `
}
function getId() {
  const time = Date.now().toString().slice(7)
  return time
}
async function insertData(client, title, summary, content) {
  const id = getId()
  const date = new Date().toISOString().split('T')[0];
  await client.sql`
    INSERT INTO articles (article_id, title, summary, date)
    VALUES (${id}, ${title}, ${summary}, ${date});
  `
  await client.sql`
    INSERT INTO article_content (content_id, article_id, content, date)
    VALUES (${id},${id}, ${content}, ${date});
  `
}

main()