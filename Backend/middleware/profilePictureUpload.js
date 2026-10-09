const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

const allowedImageTypes = new Map([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/webp', '.webp'],
    ['image/gif', '.gif']
]);

const upload = multer({
    storage: multer.diskStorage({
        destination: path.join(__dirname, '..', 'uploads'),
        filename: (req, file, callback) => {
            callback(null, `${crypto.randomUUID()}${allowedImageTypes.get(file.mimetype)}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, callback) => {
        if (!allowedImageTypes.has(file.mimetype)) {
            return callback(new Error('Upload a JPG, PNG, WebP, or GIF image'));
        }
        return callback(null, true);
    }
}).single('profilePicture');

module.exports = (req, res, next) => {
    upload(req, res, (error) => {
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ message: 'Profile pictures must be 5 MB or smaller' });
        }
        if (error) {
            if (error instanceof multer.MulterError) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message === 'Upload a JPG, PNG, WebP, or GIF image') {
                return res.status(400).json({ message: error.message });
            }
            return next(error);
        }
        return next();
    });
};
