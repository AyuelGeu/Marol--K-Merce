const mongoose = require('mongoose');
require('dotenv').config();

async function ingestData(textChunks) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collection = mongoose.connection.db.collection('documents');

        // Dynamically import the ES Module
        const { pipeline } = await import('@xenova/transformers');
        const generateEmbedding = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

        for (const chunk of textChunks) {
            const output = await generateEmbedding(chunk, { pooling: 'mean', normalize: true });
            const embedding = Array.from(output.data);

            await collection.insertOne({
                text: chunk,
                embedding: embedding
            });
        }
        console.log("Data vectorized and saved successfully!");
    } finally {
        await mongoose.disconnect();
    }
}

// Add your custom M-Pesa or business knowledge here
ingestData([
    "In order to order, you need to have an M-Pesa account and sufficient balance.",
    "M-Pesa is a mobile money transfer service that allows users to send and receive money using their mobile phones.",
    "To make a payment using M-Pesa, you need to enter the recipient's phone number and the amount you wish to send.",
]).catch(error => {
    console.error('Failed to ingest AI reference data:', error);
    process.exitCode = 1;
});