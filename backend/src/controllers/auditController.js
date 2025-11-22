const auditService = require('../services/auditService');

class AuditController {
  async getAuditLogs(req, res, next) {
    try {
      const logs = await auditService.getAuditLogs(req.query);
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditController();
