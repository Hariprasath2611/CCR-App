import { Request, Response } from 'express';
import crypto from 'crypto';
import { AppReleaseService } from '../services/appRelease.service';
import { logAdminAction } from '../middleware/adminAuth';
import {
  versionQuerySchema,
  configQuerySchema,
  publishReleaseSchema,
  updateConfigSchema,
  rollbackSchema,
} from '../validators/appRelease.schema';

/**
 * Public: Get version information and update requirement
 */
export async function getAppVersion(req: Request, res: Response) {
  try {
    const parseResult = versionQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: parseResult.error.format() });
    }

    const versionData = await AppReleaseService.getVersion(parseResult.data);

    // ETag & Caching
    const bodyString = JSON.stringify(versionData);
    const etag = `"${crypto.createHash('md5').update(bodyString).digest('hex')}"`;

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json(versionData);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve version information' });
  }
}

/**
 * Public: Get remote config (feature flags, banners, maintenance, theme)
 */
export async function getAppConfig(req: Request, res: Response) {
  try {
    const parseResult = configQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: parseResult.error.format() });
    }

    const configData = await AppReleaseService.getConfig(parseResult.data);

    // ETag & Caching
    const bodyString = JSON.stringify(configData);
    const etag = `"${crypto.createHash('md5').update(bodyString).digest('hex')}"`;

    if (req.headers['if-none-match'] === etag) {
      return res.status(304).end();
    }

    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.json(configData);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve remote configuration' });
  }
}

/**
 * Public: Get latest self-hosted OTA bundle metadata
 */
export async function getLatestBundle(req: Request, res: Response) {
  try {
    const runtimeVersion = req.query.runtimeVersion as string;
    const platform = (req.query.platform as string) || 'android';
    const bundleData = AppReleaseService.getBundleLatest(runtimeVersion, platform);

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.json(bundleData);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve bundle information' });
  }
}

/**
 * Admin: Publish a new release
 */
export async function adminPublishRelease(req: Request, res: Response) {
  try {
    const parseResult = publishReleaseSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid release payload', details: parseResult.error.format() });
    }

    const release = await AppReleaseService.publishRelease(parseResult.data);
    await logAdminAction(
      `RELEASE_PUBLISHED: v${release.latestVersionName} (code ${release.latestVersionCode})`,
      req,
      JSON.stringify({ apkUrl: release.apkUrl, apkSha256: release.apkSha256 })
    );

    return res.status(201).json({
      success: true,
      message: `Release v${release.latestVersionName} published successfully`,
      release,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to publish release' });
  }
}

/**
 * Admin: Update remote configuration
 */
export async function adminUpdateConfig(req: Request, res: Response) {
  try {
    const parseResult = updateConfigSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid config payload', details: parseResult.error.format() });
    }

    const config = await AppReleaseService.updateConfig(parseResult.data);
    await logAdminAction(
      `CONFIG_UPDATED: version ${config.configVersion}`,
      req,
      JSON.stringify({ maintenance: config.maintenance.enabled })
    );

    return res.json({
      success: true,
      message: `Remote configuration updated to version ${config.configVersion}`,
      config,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update remote configuration' });
  }
}

/**
 * Admin: Rollback release or config
 */
export async function adminRollback(req: Request, res: Response) {
  try {
    const parseResult = rollbackSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid rollback target. Must be "release", "config", or "all".' });
    }

    const rolledBack = await AppReleaseService.rollback(parseResult.data.target);
    await logAdminAction(`ROLLBACK_PERFORMED: target=${parseResult.data.target}`, req);

    return res.json({
      success: true,
      message: `Rollback completed for target: ${parseResult.data.target}`,
      rolledBack,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to rollback' });
  }
}
