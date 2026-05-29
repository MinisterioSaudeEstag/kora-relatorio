// app/api/kora/chat/route.js
import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import Groq from 'groq-sdk';
import OpenAI from 'openai';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { message, documentId } = await request.json();

    if (!documentId) return NextResponse.json({ error: 'Documento não selecionado' }, { status: 400 });

    // 1. Transforma a pergunta do usuário em um vetor (Embedding)
    const embeddingRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: message,
    });
    const queryVector = embeddingRes.data[0].embedding;
    const vectorString = `[${queryVector.join(',')}]`;

    // 2. BUSCA SEMÂNTICA NO SUPABASE (Cosine Similarity)
    // O operador <=> calcula a distância entre os vetores. Menor distância = maior similaridade.
    const rows = await prisma.$queryRaw`
      SELECT content 
      FROM "pdf_chunks" 
      WHERE "documentId" = ${documentId} 
      ORDER BY embedding <=> ${vectorString}::vector 
      LIMIT 5
    `;

    console.log("--- TRECHOS RECUPERADOS DO BANCO ---");
    console.log(rows.map(row => row.content).join("\n\n"));
    console.log("-----------------------------------");

    if (!rows || rows.length === 0) {
      return NextResponse.json({ answer: "Não encontrei informações relevantes no documento para responder a isso." });
    }

    // 3. Monta o contexto com os 5 fragmentos mais relevantes
    const context = rows.map(row => row.content).join("\n\n---\n\n");

    const systemPrompt = `Você é um assistente corporativo de alta precisão. 
    Use APENAS os trechos do documento fornecido abaixo para responder à pergunta.
    Se a informação não estiver nos trechos, diga educadamente que não encontrou no documento.
    
    CONTEXTO RELEVANTE:
    ${context}`;

    // 4. Gera a resposta final usando o Groq (Gratuito e Ultra Rápido)
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
    });

    return NextResponse.json({ answer: response.choices[0].message.content });
  } catch (error) {
    console.error('Erro no Chat RAG:', error);
    return NextResponse.json({ error: 'Erro interno no processamento da IA' }, { status: 500 });
  }
}