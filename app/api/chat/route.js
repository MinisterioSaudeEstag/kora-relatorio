import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import Groq from 'groq-sdk';
import { OpenAIEmbeddings } from "@langchain/openai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { message, documentId } = await request.json();

    // 1. Transformar a pergunta do usuário em um vetor
    const embeddingsModel = new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY });
    const queryVector = await embeddingsModel.embedQuery(message);
    const vectorString = `[${queryVector.join(',')}]`;

    // 2. BUSCA SEMÂNTICA (A mágica do RAG)
    // Buscamos os 5 pedaços de texto mais parecidos com a pergunta
    const { rows } = await prisma.$queryRaw`
      SELECT content 
      FROM "PdfChunk" 
      WHERE "documentId" = ${documentId} 
      ORDER BY embedding <=> ${vectorString}::vector 
      LIMIT 5
    `;

    const context = rows.map(row => row.content).join("\n\n");

    // 3. Enviar apenas o contexto relevante para a IA
    const systemPrompt = `Você é um assistente corporativo. Use APENAS os trechos do documento abaixo para responder.
    Se a resposta não estiver nos trechos, diga que a informação não foi encontrada.
    
    CONTEXTO:
    ${context}`;

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
    return NextResponse.json({ error: 'Erro interno no chat' }, { status: 500 });
  }
}