import NetInfo from '@react-native-community/netinfo';
import { SyncQueueRepository } from '@database/repositories/SyncQueueRepository';
import { useSyncStore } from './store/useSyncStore';
import { apiClient } from '@services/api/apiClient';

class SyncEngine {
  private syncQueueRepo = new SyncQueueRepository();
  private isProcessing = false;

  public initialize() {
    // Watch connectivity status changes
    NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        this.triggerSync();
      }
    });

    // Run periodic sync checks every 10 seconds to process any queued logs
    setInterval(() => {
      this.triggerSync();
    }, 10000);

    // Run once on startup
    this.triggerSync();
  }

  public async triggerSync(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    useSyncStore.getState().setSyncing(true);

    try {
      const pendingItems = await this.syncQueueRepo.getPendingItems();
      useSyncStore.getState().setPendingCount(pendingItems.length);

      for (const item of pendingItems) {
        let endpoint = '';
        switch (item.action_type) {
          case 'CREATE_PLAN':
            endpoint = '/plans/create';
            break;
          case 'SUBMIT_PROGRESS':
            endpoint = '/progress/submit';
            break;
          case 'REQUEST_EXTRA_HOURS':
            endpoint = '/extra-hours/request';
            break;
          default:
            console.warn(`Unknown action type: ${item.action_type}`);
            continue;
        }

        try {
          await this.syncQueueRepo.updateStatus(item.id, 'PROCESSING', item.retry_count);
          const payloadParsed = JSON.parse(item.payload);

          // Deliver request
          await apiClient.post(endpoint, payloadParsed);

          // Success, purge record
          await this.syncQueueRepo.remove(item.id);
        } catch (error) {
          console.error(`Sync payload failed for item ${item.id}:`, error);
          
          const nextRetry = item.retry_count + 1;
          const status = nextRetry >= 3 ? 'FAILED' : 'PENDING'; // Retries bound

          await this.syncQueueRepo.updateStatus(item.id, status, nextRetry);
        }
      }

      useSyncStore.getState().setLastSyncedAt(Date.now());
    } catch (err) {
      console.error('Error running synchronization processing:', err);
    } finally {
      const remainingItems = await this.syncQueueRepo.getPendingItems();
      useSyncStore.getState().setPendingCount(remainingItems.length);
      this.isProcessing = false;
      useSyncStore.getState().setSyncing(false);
    }
  }
}

export const syncEngine = new SyncEngine();
