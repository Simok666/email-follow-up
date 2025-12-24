const { act } = require("react");
const prisma = require("../../config/prisma");

exports.log = async ({ contractId, action, req }) => {
    await prisma.auditLog.create({
        data: {
            contractId,
            action,
            ipAddress: req.ip,
            userAgent: req.headers('user-agent')
        }  
    });
}