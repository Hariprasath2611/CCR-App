"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestExtraHours = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const requestExtraHours = async (req, res) => {
    const { id, facultyId, subjectCode, classId, requestedDate, period, reason, status } = req.body;
    if (!id || !facultyId || !subjectCode || !classId || !requestedDate || period === undefined || !reason) {
        return res.status(400).json({ error: 'Missing required extra hour request fields' });
    }
    try {
        const request = await prisma.extraHourRequest.upsert({
            where: { id },
            update: {
                facultyId,
                subjectCode,
                classId,
                requestedDate,
                period: parseInt(period),
                reason,
                status: status || 'PENDING',
            },
            create: {
                id,
                facultyId,
                subjectCode,
                classId,
                requestedDate,
                period: parseInt(period),
                reason,
                status: status || 'PENDING',
            },
        });
        return res.json({ success: true, request });
    }
    catch (error) {
        console.error('requestExtraHours error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.requestExtraHours = requestExtraHours;
