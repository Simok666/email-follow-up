const service = require('./template.service');

async function uploadTemplate( req, res ) {
    const { title, fileUrl} = req.body;

    if (title === undefined || fileUrl === undefined || !req.user.userId || req.user.userId == null) {
            return res.status(400).json({ message: 'Invalid upload template data' });
        }
    
    const upload = await service.uploadTemplate(
        req.user.userId,
        title,
        fileUrl
    );
    
    return res.status(201).json(upload);
}


async function getTemplate(req, res) {
    const templates = await service.getTemplates(req.user.userId);
    return res.status(200).json(templates);
}

module.exports = {
    uploadTemplate,
    getTemplate
}