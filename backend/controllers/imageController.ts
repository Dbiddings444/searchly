import { pool } from '../db/index.js';
import { Request, Response } from 'express';
import { generateUploadUrl } from '../services/uploadService.ts';
import { analyzeImage } from '../services/analyzeImageService.ts';

// Normalize tags: ensure array of non-empty trimmed lowercase strings, de-duplicated
const normalizeTags = (tagsInput?: any): string[] => {
    if (!tagsInput) return [];
    const arr = Array.isArray(tagsInput) ? tagsInput : [tagsInput];
    const cleaned = arr
        .map((t) => (t === null || t === undefined ? '' : String(t)))
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => s.toLowerCase());
    return Array.from(new Set(cleaned));
};

interface CreateImageBody {
  url: string
  tags?: string[]
  s3Key: string
  description: string
  title: string
}

export const uploadImageData = async (req: Request, res: Response) => {
    try {
        const { url, tags, s3Key, description, title }: CreateImageBody = req.body;
        const detectedTags = s3Key ? await analyzeImage(s3Key) : [];
        const userTags = normalizeTags(tags);
        const rekTags = normalizeTags(detectedTags);
        const tagsToSave = Array.from(new Set([...userTags, ...rekTags]));

        const result = await pool.query(
            'INSERT INTO images (url, tags, s3_key, description, title) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [url, tagsToSave, s3Key, description, title]
        );
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload image' });
    }
};

export const getUploadUrl = async (req: Request, res: Response) => {

    const { fileName, fileType } = req.body;

    if(!fileName || !fileType) {
        return res.status(400).json({ error: 'fileName and fileType are required'});   
     }

     try {
        const result = await generateUploadUrl(fileName, fileType);
        res.json(result);
     }
     catch (err) {
        console.log('Error generating upload URL:', err);
        res.status(500).json({ error: 'Failed to generate upload URL'});
     }
}

export const getAllImages = async (req: Request, res: Response) => {

    try {
            const { rows } = await pool.query('SELECT * FROM images');
            return res.status(200).json(rows);
    }
    catch (error) {
        console.error('Error fetching all images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
}

export const getImageById = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const { rows } = await pool.query('SELECT * FROM images WHERE id = $1', [id]);
        if(rows.length === 0)
            return res.status(404).json({ error: 'image not found'});
    }
    catch(err){
        console.log('Error fetching image by ID:', err);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
}

export const deleteImage = async (req: Request, res: Response) => {
    const {id} = req.params;
    
    try { 
        
        const imageResult = await pool.query('SELECT s3_key FROM images WHERE id = $1',[id]);
        if(imageResult.rows.length === 0){
            return res.status(404).json({error: 'image not found'});
        }
        const { rows } = await pool.query('DELETE FROM images WHERE id = $1 RETURNING *', [id]);
        if(rows.length === 0){
            return res.status(404).json({error: 'image not found'});
        }
        return res.status(200).json({ message: 'Task deleted successfully' });
    }
    catch(err) {
        console.log('Error deleting image:', err);
        res.status(500).json({ error: 'Failed to delete image'});
    }
}

export const updateImage = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {tags, description, title} = req.body;
    const normalizedTags = normalizeTags(tags);

    try {
        const { rows } = await pool.query(
            'UPDATE images SET tags = $1, description = $2, title = $3 WHERE id = $4 RETURNING *',
            [normalizedTags, description, title, id]
        );
        if(rows.length === 0){
            return res.status(404).json({error: 'image not found'});
        }
        return res.status(200).json(rows[0]);
    }
    catch(err) {
        console.log('Error updating image:', err);
        res.status(500).json({ error: 'Failed to update image'});
    }
}