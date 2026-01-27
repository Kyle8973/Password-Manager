const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  ip: { type: String }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;