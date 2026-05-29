// // app/api/kora/extract-pdf/route.js
// import { verifyToken } from '@/app/lib/auth-utils-prisma';
// import prisma from '@/app/lib/prisma';

// export async function POST(request) {
//   try {
//     const authHeader = request.headers.get('authorization');
//     if (!authHeader?.startsWith('Bearer ')) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    
//     const token = authHeader.slice(7);
//     const decoded = verifyToken(token);
//     if (!decoded) return Response.json({ error: 'Invalid token' }, { status: 401 });

//     const formData = await request.formData();
//     const file = formData.get('file'); 
//     const documentId = formData.get('documentId');

//     if (!file || !documentId) return Response.json({ error: 'Arquivo e documentId necessários' }, { status: 400 });

//     const document = await prisma.document.findFirst({
//       where: { id: documentId, userId: decoded.userId },
//     });
//     if (!document) return Response.json({ error: 'Documento não encontrado' }, { status: 404 });

//     const apiKey = process.env.OCR_SPACE_API_KEY;
//     if (!apiKey) throw new Error('API Key do OCR.space não configurada no .env');

//     // --- AJUSTE NO ENVIO DO ARQUIVO ---
//     const ocrFormData = new FormData();
//     ocrFormData.append('apikey', apiKey);
//     ocrFormData.append('language', 'por');
//     ocrFormData.append('isOverlayRequired', 'false');
    
//     // Convertemos o arquivo para Blob para garantir compatibilidade com o fetch
//     const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
//     ocrFormData.append('file', fileBlob, file.name); 

//     const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
//       method: 'POST',
//       body: ocrFormData,
//     });

//     const ocrData = await ocrResponse.json();

//     // DEBUG: Imprime a resposta inteira no terminal para sabermos o erro real
//     console.log('Resposta completa do OCR.space:', JSON.stringify(ocrData, null, 2));

//     if (!ocrData.OCRExitCode || ocrData.OCRExitCode !== 1) {
//       // Aqui pegamos a mensagem real da API
//       throw new Error(ocrData.ErrorMessage || 'Erro desconhecido na API OCR.space');
//     }

//     const extractedText = ocrData.ParsedResults.map(page => page.ParsedText).join('\n');

//     if (!extractedText || extractedText.trim().length === 0) {
//       throw new Error('A API não conseguiu extrair texto deste documento.');
//     }

//     const pdfContent = await prisma.pdfContent.upsert({
//       where: { documentId },
//       update: { content: extractedText, updatedAt: new Date() },
//       create: { documentId, content: extractedText },
//     });

//     return Response.json({ success: true, message: 'Extraído com sucesso' });

//   } catch (error) {
//     console.error('Erro detalhado na extração:', error.message);
//     return Response.json({ error: error.message }, { status: 500 });
//   }
// }