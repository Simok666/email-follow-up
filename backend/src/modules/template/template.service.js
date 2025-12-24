const prisma = require("../../config/prisma");

async function uploadTemplate(userId, title, fileUrl) {
    const template = await prisma.template.create({
        data: {
            userId,
            title,
            fileUrl
        }
    });
    return template
}

async function getTemplates(userId) {
    return await prisma.template.findMany({
        where: {userId: userId}
    });
}

module.exports = {
    uploadTemplate,
    getTemplates
}