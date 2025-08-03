import { Request, Response, NextFunction } from 'express';
const { validationResult } = require('express-validator');

import fs from 'fs';

interface MulterFile {
    path: string;
}

interface ExtendedRequest extends Request {
    file?: MulterFile;
    files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
}

export const Validate = (req: ExtendedRequest, res: Response, next: NextFunction): void => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        if (req.file?.path) {
            fs.unlink(req.file.path, err => {
                if (err) console.error("Error deleting file:", err);
            });
        }

        if (Array.isArray(req.files)) {
            for (const file of req.files) {
                fs.unlink(file.path, err => {
                    if (err) console.error("Error deleting file:", err);
                });
            }
        } else if (req.files && typeof req.files === 'object') {
            Object.values(req.files).forEach(fileArray => {
                for (const file of fileArray) {
                    fs.unlink(file.path, err => {
                        if (err) console.error("Error deleting file:", err);
                    });
                }
            });
        }

        const allErrors = result.array();
        const uniqueErrors: Record<string, string> = {};
        for (const err of allErrors) {
            if (!uniqueErrors[err.param]) {
                uniqueErrors[err.param] = err.msg;
            }
        }

        res.status(422).json({
            status: false,
            message: 'Validation failed.',
            errors: uniqueErrors,
        });
    }

    next();
};
