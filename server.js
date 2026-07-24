const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar el SDK oficial con la clave segura
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        // Se utiliza el modelo recomendado gemini-2.5-flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite', 
            contents: messages,
            config: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        });

        res.json({ text: response.text });
    } catch (error) {
        console.error('Error al consultar Gemini:', error);
        
        // Manejo específico del error de límite de velocidad (429)
        if (error.status === 429) {
            return res.status(429).json({ error: 'Has alcanzado el límite de peticiones. Inténtalo de nuevo en un minuto.' });
        }
        
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
