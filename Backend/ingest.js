require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
require('./models/Users');

const businessKnowledge = [
    'To pay, you must have a valid phone number.',
    'The transaction fee for sending 1000 KES is 12 KES.'
];

async function ingestData() {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be configured before ingesting chatbot knowledge.');
    }

    await mongoose.connect(process.env.MONGO_URI);

    try {
        const products = await Product.find({ isActive: true })
            .populate({
                path: 'vendor',
                match: {
                    role: 'vendor',
                    'vendorProfile.isApproved': true,
                    'vendorProfile.storeNameStatus': 'approved',
                    'vendorProfile.storeName': { $ne: '' }
                },
                select: 'vendorProfile.storeName'
            })
            .lean();

        const productKnowledge = products
            .filter((product) => product.vendor)
            .map((product) => [
                `Marketplace product: ${product.name}.`,
                `Store: ${product.vendor.vendorProfile.storeName}.`,
                `Category: ${product.category}.`,
                `Price: KSh ${product.price}.`,
                product.description && `Description: ${product.description}`
            ].filter(Boolean).join(' '));
        const textChunks = [...businessKnowledge, ...productKnowledge];
        const { pipeline } = await import('@xenova/transformers');
        const generateEmbedding = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        const documents = [];

        for (const text of textChunks) {
            const output = await generateEmbedding(text, { pooling: 'mean', normalize: true });
            documents.push({
                text,
                embedding: Array.from(output.data)
            });
        }

        const collection = mongoose.connection.db.collection('documents');
        await collection.deleteMany({});
        if (documents.length) {
            await collection.insertMany(documents);
        }
        console.log(`Chatbot knowledge indexed: ${documents.length} documents.`);
    } finally {
        await mongoose.disconnect();
    }
}

ingestData().catch((error) => {
    console.error('Unable to ingest chatbot knowledge:', error);
    process.exitCode = 1;
});
