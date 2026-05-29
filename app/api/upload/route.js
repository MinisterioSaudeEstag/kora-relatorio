// app/api/upload/route.js
import { verifyToken } from '@/app/lib/auth-utils-prisma';
import prisma from '@/app/lib/prisma';

export async function POST(request) {
  try {
    // Extrair token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return Response.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || file.type !== 'application/pdf') {
      return Response.json(
        { error: 'Apenas arquivos PDF são permitidos' },
        { status: 400 }
      );
    }

    // Validar tamanho (máx 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json(
        { error: 'Arquivo muito grande. Máximo 10MB' },
        { status: 400 }
      );
    }

    // Salvar documento no banco de dados
    const document = await prisma.document.create({
      data: {
        userId: decoded.userId,
        nome_arquivo: file.name,
        caminho_armazenamento: `/uploads/documents/${Date.now()}_${file.name}`,
      },
    });

    return Response.json({
      success: true,
      message: 'Arquivo enviado com sucesso',
      document: {
        id: document.id,
        nome_arquivo: document.nome_arquivo,
        data_upload: document.data_upload,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return Response.json(
      { error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    );
  }
}
