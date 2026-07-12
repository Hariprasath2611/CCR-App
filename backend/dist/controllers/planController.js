"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlan = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createPlan = async (req, res) => {
    const { id, facultyId, subjectCode, academicWeekNumber, targetTopicIds, status } = req.body;
    if (!id || !facultyId || !subjectCode || academicWeekNumber === undefined || !targetTopicIds) {
        return res.status(400).json({ error: 'Missing required weekly plan fields' });
    }
    try {
        const topicsStr = Array.isArray(targetTopicIds) ? targetTopicIds.join(',') : targetTopicIds;
        // Check if the plan already exists, upsert it
        const plan = await prisma.weeklyPlan.upsert({
            where: { id },
            update: {
                academicWeekNumber,
                subjectCode,
                targetTopicIds: topicsStr,
                status,
                isDraft: status === 'DRAFT',
                facultyId,
            },
            create: {
                id,
                academicWeekNumber,
                subjectCode,
                targetTopicIds: topicsStr,
                status,
                isDraft: status === 'DRAFT',
                facultyId,
            },
        });
        return res.json({ success: true, plan });
    }
    catch (error) {
        console.error('createPlan error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createPlan = createPlan;
