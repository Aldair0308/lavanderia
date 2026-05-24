import { Injectable } from '@nestjs/common';

export interface MessageAnalysis {
  category: 'promise_follow_up' | 'greeting' | 'short_reply' | 'question' | 'long_message' | 'default';
  bufferDelayMs: number;
  expectFollowUp: boolean;
}

const PROMISE_PATTERNS = [
  /te mando/i, /te paso/i, /espera/, /voy a buscar/i,
  /déjame ver/i, /déjame busc/i, /ahorita te/i, /ahorita le/i,
  /ubicación/i, /dirección/i, /espérame/i, /dame un momento/i,
  /te comparto/i, /te envío/i, /te voy a/i, /le voy a/i,
  /dame chance/i, /espera tant/i, /dame un segund/i,
  /ya te digo/i, /luego te/i, /más rato/i,
];

@Injectable()
export class WhatsappMessageAnalyzer {
  analyze(text: string): MessageAnalysis {
    const trimmed = text.trim();
    const charCount = trimmed.length;
    const wordCount = trimmed.split(/\s+/).length;

    // Check for promise_follow_up first (highest priority)
    for (const pattern of PROMISE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return { category: 'promise_follow_up', bufferDelayMs: 50_000, expectFollowUp: true };
      }
    }

    // Greeting detection
    if (/^(hola|buenas|buen[asod]|que tal|qué tal|saludos)/i.test(trimmed)) {
      return { category: 'greeting', bufferDelayMs: 3_000, expectFollowUp: false };
    }

    // Short reply (3 words or less)
    if (wordCount <= 3) {
      return { category: 'short_reply', bufferDelayMs: 1_500, expectFollowUp: false };
    }

    // Question detection
    if (/[¿?]|cuánto|cómo|dónde|cuándo|tienen|quién|qué es|me puedes|se puede/i.test(trimmed)) {
      return { category: 'question', bufferDelayMs: 4_000, expectFollowUp: false };
    }

    // Long message (>80 chars)
    if (charCount > 80) {
      return { category: 'long_message', bufferDelayMs: 5_000, expectFollowUp: false };
    }

    return { category: 'default', bufferDelayMs: 3_000, expectFollowUp: false };
  }
}
