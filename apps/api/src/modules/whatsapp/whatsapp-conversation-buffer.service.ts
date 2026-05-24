import { Injectable, Logger } from '@nestjs/common';
import { MessageAnalysis } from './whatsapp-message-analyzer.service';

interface BufferEntry {
  messages: string[];
  remoteJid: string;
  timer: NodeJS.Timeout | null;
  expectFollowUp: boolean;
  nudgeSent: boolean;
  silenceTimer: NodeJS.Timeout | null;
}

export type BatchReadyCallback = (convId: string, messages: string[], remoteJid: string, isNudge: boolean) => Promise<void>;

const EXTEND_MS = 60_000;

@Injectable()
export class WhatsappConversationBuffer {
  private readonly logger = new Logger(WhatsappConversationBuffer.name);
  private buffers = new Map<string, BufferEntry>();

  onBatchReady: BatchReadyCallback = async () => {};

  push(convId: string, remoteJid: string, text: string, analysis: MessageAnalysis): void {
    let entry = this.buffers.get(convId);

    if (!entry) {
      entry = { messages: [], remoteJid, timer: null, expectFollowUp: false, nudgeSent: false, silenceTimer: null };
      this.buffers.set(convId, entry);
    }

    entry.messages.push(text);
    entry.remoteJid = remoteJid;

    // Use the LATEST message's analysis for the timer
    entry.expectFollowUp = analysis.expectFollowUp;

    this.resetTimer(convId, analysis.bufferDelayMs);
  }

  private resetTimer(convId: string, delayMs: number): void {
    const entry = this.buffers.get(convId);
    if (!entry) return;

    if (entry.timer) clearTimeout(entry.timer);
    if (entry.silenceTimer) clearTimeout(entry.silenceTimer);

    entry.timer = setTimeout(() => this.onTimerFired(convId), delayMs);
  }

  private async onTimerFired(convId: string): Promise<void> {
    const entry = this.buffers.get(convId);
    if (!entry || entry.messages.length === 0) return;

    // If we just have the promise message and no follow-up yet
    if (entry.expectFollowUp && entry.messages.length === 1 && !entry.nudgeSent) {
      this.logger.log(`[Buffer] expectFollowUp for ${convId}, extending ${EXTEND_MS}ms`);
      entry.silenceTimer = setTimeout(async () => {
        // Still nothing after extension → send nudge
        entry.nudgeSent = true;
        this.logger.log(`[Buffer] Sending nudge for ${convId}`);
        await this.onBatchReady(convId, entry.messages, entry.remoteJid, true);
        entry.messages = [];
      }, EXTEND_MS);
      return;
    }

    // If we already sent a nudge and still only 1 message → extend forever (wait silently)
    if (entry.expectFollowUp && entry.messages.length === 1 && entry.nudgeSent) {
      this.logger.log(`[Buffer] Already nudged for ${convId}, extending silently`);
      entry.timer = setTimeout(() => this.onTimerFired(convId), EXTEND_MS);
      return;
    }

    // Normal processing: we have messages to process
    this.logger.log(`[Buffer] Processing batch for ${convId}: ${entry.messages.length} messages`);
    const messages = [...entry.messages];
    entry.messages = [];
    entry.nudgeSent = false;
    await this.onBatchReady(convId, messages, entry.remoteJid, false);
  }

  flush(convId: string): void {
    const entry = this.buffers.get(convId);
    if (!entry) return;
    if (entry.timer) clearTimeout(entry.timer);
    if (entry.silenceTimer) clearTimeout(entry.silenceTimer);
    this.buffers.delete(convId);
  }

  getPendingCount(convId: string): number {
    return this.buffers.get(convId)?.messages.length ?? 0;
  }
}
