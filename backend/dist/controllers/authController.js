"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.refresh = exports.login = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ccms_key_12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super_secret_ccms_refresh_key_12345';
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const passwordMatch = bcrypt.compareSync(password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const userSession = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isClassCoordinator: user.isClassCoordinator,
            department: user.department,
            assignedClassId: user.assignedClassId || undefined,
        };
        const accessToken = jwt.sign(userSession, JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return res.json({
            user: userSession,
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        const userSession = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isClassCoordinator: user.isClassCoordinator,
            department: user.department,
            assignedClassId: user.assignedClassId || undefined,
        };
        const newAccessToken = jwt.sign(userSession, JWT_SECRET, { expiresIn: '1h' });
        const newRefreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
};
exports.refresh = refresh;
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const passwordMatch = bcrypt.compareSync(currentPassword, user.passwordHash);
        if (!passwordMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }
        const newPasswordHash = bcrypt.hashSync(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
        return res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.changePassword = changePassword;
