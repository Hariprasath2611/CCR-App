import { z } from 'zod';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

export const hexColorSchema = z.string().regex(hexColorRegex, {
  message: 'Color must be a valid 6-char or 8-char hex code starting with # (e.g. #2B35E0)',
});

export const themeOverrideSchema = z.object({
  blue: hexColorSchema.optional(),
  amber: hexColorSchema.optional(),
  coral: hexColorSchema.optional(),
  mint: hexColorSchema.optional(),
  ink: hexColorSchema.optional(),
}).optional();

export const bannerSchema = z.object({
  id: z.string().min(1, 'Banner ID is required'),
  text: z.string().min(1, 'Banner text is required'),
  type: z.enum(['info', 'warning', 'alert', 'success']).default('info'),
  startsAt: z.string().datetime({ message: 'startsAt must be a valid ISO datetime' }),
  endsAt: z.string().datetime({ message: 'endsAt must be a valid ISO datetime' }),
  dismissible: z.boolean().default(true),
});

export const publishReleaseSchema = z.object({
  latestVersionName: z.string().min(1, 'latestVersionName is required'),
  latestVersionCode: z.number().int().positive('latestVersionCode must be a positive integer'),
  minSupportedVersionCode: z.number().int().positive('minSupportedVersionCode must be a positive integer'),
  apkUrl: z.string().url('apkUrl must be a valid URL').refine((url) => url.startsWith('https://'), {
    message: 'apkUrl must use HTTPS',
  }),
  apkSha256: z.string().length(64, 'apkSha256 must be a 64-character SHA-256 hexadecimal hash'),
  apkSizeBytes: z.number().int().positive().optional(),
  releaseNotes: z.array(z.string()).min(1, 'releaseNotes must have at least one entry'),
  channel: z.enum(['stable', 'beta']).default('stable'),
});

export const updateConfigSchema = z.object({
  maintenance: z.object({
    enabled: z.boolean(),
    title: z.string().min(1, 'Maintenance title is required'),
    message: z.string().min(1, 'Maintenance message is required'),
    allowedRoles: z.array(z.string()).default(['ADMIN', 'PRINCIPAL']),
  }),
  featureFlags: z.record(z.string(), z.boolean()),
  banners: z.array(bannerSchema),
  texts: z.record(z.string(), z.string()),
  theme: themeOverrideSchema,
  minSupportedVersionCode: z.number().int().positive().optional(),
});

export const versionQuerySchema = z.object({
  platform: z.enum(['android', 'ios', 'web']).default('android'),
  versionCode: z.coerce.number().int().optional().default(1),
  versionName: z.string().optional(),
  channel: z.enum(['stable', 'beta']).default('stable'),
});

export const configQuerySchema = z.object({
  versionCode: z.coerce.number().int().optional(),
});

export const rollbackSchema = z.object({
  target: z.enum(['release', 'config', 'all']),
});

export type PublishReleaseInput = z.infer<typeof publishReleaseSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type VersionQueryInput = z.infer<typeof versionQuerySchema>;
export type ConfigQueryInput = z.infer<typeof configQuerySchema>;
