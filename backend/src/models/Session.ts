import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  status: { type: String, default: 'desconectada'},
  connected: { type: Boolean, default: false},
  lastSeen: { type: Date },
}, {
    timestamps: true
});

export const Session = mongoose.model('Session', sessionSchema);
