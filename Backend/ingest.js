const mongoose = require('mongoose');
require('dotenv').config();

async function ingestData(textChunks) {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collection = mongoose.connection.db.collection('documents');

        // Clear existing documents to prevent duplicates on re-runs
        await collection.deleteMany({});

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

// Pass your custom knowledge base chunks here
ingestData([
    // Add your system's text chunks or load them from a file here
]).catch(error => {
    console.error('Failed to ingest AI reference data:', error);
    process.exitCode = 1;
});