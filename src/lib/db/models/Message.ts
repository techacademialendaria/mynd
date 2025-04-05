import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  sender: string;
  content: string;
  timestamp: Date;
  chat: string;
  mediaUrl?: string;
  processed: boolean;
  aiAnalysis?: {
    intent?: string;
    sentiment?: string;
    keywords?: string[];
    summary?: string;
  };
  metadata?: Record<string, any>;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chat: { type: String, required: true },
  mediaUrl: { type: String },
  processed: { type: Boolean, default: false },
  aiAnalysis: {
    intent: String,
    sentiment: String,
    keywords: [String],
    summary: String
  },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema); 