import { Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import fs from 'fs';
import path from 'path';
import { v7 as uuidv7 } from 'uuid';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

// Inicializa o cliente S3 somente em produção
let s3: S3Client | null = null;
if (process.env.NODE_ENV === 'production') {
    s3 = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
        }
    });
}

let upload: multer.Multer;

if (process.env.NODE_ENV === 'production' && s3) {
    // Configura o armazenamento para o S3 usando multer-s3 sem ACL
    upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_S3_BUCKET_NAME!,
            // Remova 'acl' daqui
            metadata: (req, file, cb) => {
                cb(null, { fieldName: file.fieldname });
            },
            key: (req, file, cb) => {
                cb(null, `${uuidv7()}-${file.originalname}`);
            },
        }),
    });
} else {
    // Configura o armazenamento local
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, `${uuidv7()}-${file.originalname}`);
        },
    });

    upload = multer({ storage });
}

// Interface para estender o tipo de arquivo do multer no S3
interface S3File extends Express.Multer.File {
    key: string;
    location: string;
}

// Função para fazer upload da imagem
const uploadCoverImage = async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    let imageUrl: string;
    let imageFileName: string;

    if (process.env.NODE_ENV === 'production' && s3) {
        const s3File = file as S3File;
        imageFileName = s3File.key;

        // Gerar URL pré-assinada
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: imageFileName,
        });

        const expiresIn = 3600; // URL válida por 1 hora (valor em segundos)

        try {
            imageUrl = await getSignedUrl(s3, command, { expiresIn });
        } catch (error) {
            console.error('Erro ao gerar URL pré-assinada:', error);
            return res.status(500).json({ error: 'Erro ao gerar a URL da imagem.' });
        }
    } else {
        imageFileName = file.filename;
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${imageFileName}`;
    }

    try {
        res.json({ imageUrl, imageFileName });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao enviar a URL da imagem.' });
    }
};

// Função para deletar a imagem
const deleteCoverImage = async (req: Request, res: Response) => {
    const imageFileName = req.body.imageFileName;

    if (!imageFileName) {
        return res.status(400).json({ error: 'Nome do arquivo de imagem não fornecido.' });
    }

    // Valida o nome do arquivo para evitar ataques de traversal
    if (imageFileName.includes('/') || imageFileName.includes('\\')) {
        return res.status(400).json({ error: 'Nome de arquivo de imagem inválido.' });
    }

    if (process.env.NODE_ENV === 'production' && s3) {
        // Deleta a imagem do S3
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: imageFileName,
        };

        try {
            await s3.send(new DeleteObjectCommand(params));
            res.status(200).json({ message: 'Imagem deletada com sucesso.' });
        } catch (err) {
            console.error('Erro ao deletar a imagem do S3:', err);
            res.status(500).json({ error: 'Erro ao deletar a imagem do S3.' });
        }
    } else {
        // Deleta a imagem localmente
        const imagePath = path.join(__dirname, '..', 'uploads', imageFileName);

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Erro ao deletar a imagem:', err);
                return res.status(500).json({ error: 'Erro ao deletar a imagem.' });
            }

            res.status(200).json({ message: 'Imagem deletada com sucesso.' });
        });
    }
};

export { upload, uploadCoverImage, deleteCoverImage };
