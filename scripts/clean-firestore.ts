/**
 * Script de Limpeza do Firestore - Plataforma Mendonça
 * 
 * Executa a remoção e o reset de dados de teste:
 * 1. Remove documentos da coleção 'questions' (questões de teste)
 * 2. Remove placares da coleção 'leaderboard'
 * 3. Restaura os registros da coleção 'performance' para o estado inicial (0 XP, 0 acertos)
 * 4. Reinicia contadores de streak (1 dia) e progresso da coleção 'users'
 * 
 * Como executar:
 * npx tsx scripts/clean-firestore.ts
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  setDoc 
} from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Carregar configuração do Firebase
const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ Arquivo firebase-applet-config.json não encontrado.');
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function runCleanup() {
  console.log('=====================================================');
  console.log('🧹 INICIANDO SCRIPT DE LIMPEZA DO FIRESTORE');
  console.log(`📡 Projeto: ${firebaseConfig.projectId}`);
  console.log(`🗄️ Database ID: ${firebaseConfig.firestoreDatabaseId}`);
  console.log('=====================================================\n');

  let questionsCount = 0;
  let leaderboardCount = 0;
  let performanceCount = 0;
  let usersCount = 0;

  // 1. Limpar Questions
  try {
    process.stdout.write('1. Limpando coleção "questions"... ');
    const qSnap = await getDocs(collection(db, 'questions'));
    for (const d of qSnap.docs) {
      await deleteDoc(doc(db, 'questions', d.id));
      questionsCount++;
    }
    console.log(`✓ [${questionsCount} questões removidas]`);
  } catch (err) {
    console.log(`✗ Erro: ${err}`);
  }

  // 2. Limpar Leaderboard
  try {
    process.stdout.write('2. Limpando coleção "leaderboard"... ');
    const lSnap = await getDocs(collection(db, 'leaderboard'));
    for (const d of lSnap.docs) {
      await deleteDoc(doc(db, 'leaderboard', d.id));
      leaderboardCount++;
    }
    console.log(`✓ [${leaderboardCount} placares removidos]`);
  } catch (err) {
    console.log(`✗ Erro: ${err}`);
  }

  // 3. Resetar Performance
  try {
    process.stdout.write('3. Resetando coleção "performance"... ');
    const pSnap = await getDocs(collection(db, 'performance'));
    for (const d of pSnap.docs) {
      const userId = d.id;
      await setDoc(doc(db, 'performance', userId), {
        userId,
        totalAnswered: 0,
        totalCorrect: 0,
        totalWrong: 0,
        totalXpEarned: 0,
        bestStreakCombo: 1,
        totalSecondsPlayed: 0,
        subjectStats: {},
        recentQuestionsLog: [],
        sessionsHistory: [],
        updatedAt: new Date().toISOString()
      });
      performanceCount++;
    }
    console.log(`✓ [${performanceCount} perfis resetados para 0 XP e 0 resoluções]`);
  } catch (err) {
    console.log(`✗ Erro: ${err}`);
  }

  // 4. Resetar Users
  try {
    process.stdout.write('4. Reiniciando contadores na coleção "users"... ');
    const uSnap = await getDocs(collection(db, 'users'));
    for (const d of uSnap.docs) {
      const userId = d.id;
      const data = d.data();
      await setDoc(doc(db, 'users', userId), {
        ...data,
        totalXp: 0,
        streak: 1,
        highScore: 0,
        accuracy: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        division: 'Bronze I',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      usersCount++;
    }
    console.log(`✓ [${usersCount} usuários com streak = 1 e progresso zerado]`);
  } catch (err) {
    console.log(`✗ Erro: ${err}`);
  }

  console.log('\n=====================================================');
  console.log('🎉 LIMPEZA CONCLUÍDA COM SUCESSO!');
  console.log(`• Questões deletadas: ${questionsCount}`);
  console.log(`• Placares deletados: ${leaderboardCount}`);
  console.log(`• Perfis de Performance resetados: ${performanceCount}`);
  console.log(`• Perfis de Usuário com streak/XP reiniciados: ${usersCount}`);
  console.log('=====================================================');
  process.exit(0);
}

runCleanup().catch((err) => {
  console.error('❌ Falha fatal no script de limpeza:', err);
  process.exit(1);
});
