const readline = require('readline');
const { exec } = require('child_process');
const { promisify } = require('util');

const run = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const menu = `
📦 Prisma Tools - Escolha uma opção:

[1] Criar migration
[2] Resetar banco (CUIDADO)
[3] Rodar seed
[4] Gerar Prisma Client
[5] Abrir Prisma Studio
[0] Sair

Digite o número da opção: `;

rl.question(menu, (res) => {
  switch (res.trim()) {
    case '1':
      rl.question('Digite o nome da migration: ', async (nome) => {
        console.log(`🚀 Criando migration "${nome}"...`);
        try {
          await run(`npx prisma migrate dev --name ${nome}`);
        } catch (e) {
          console.error('Erro na migration:', e);
        }
        rl.close();
      });
      break;
    case '2':
      (async () => {
        console.log('⚠️ Resetando banco...');
        try {
          await run(`npx prisma migrate reset --force`);
        } catch (e) {
          console.error('Erro ao resetar banco:', e);
        }
        rl.close();
      })();
      break;
    case '3':
      (async () => {
        console.log('🌱 Rodando seed...');
        try {
          await run(`npm run seed`);
        } catch (e) {
          console.error('Erro ao rodar seed:', e);
        }
        rl.close();
      })();
      break;
    case '4':
      (async () => {
        console.log('⚙️ Gerando Prisma Client...');
        try {
          await run(`npm run generate`);
        } catch (e) {
          console.error('Erro ao gerar Prisma Client:', e);
        }
        rl.close();
      })();
      break;
    case '5':
      (async () => {
        console.log('🔍 Abrindo Prisma Studio...');
        try {
          await run(`npm run studio`);
        } catch (e) {
          console.error('Erro ao abrir Prisma Studio:', e);
        }
        rl.close();
      })();
      break;
    case '0':
      console.log('👋 Saindo...');
      rl.close();
      break;
    default:
      console.log('❌ Opção inválida');
      rl.close();
  }
});
