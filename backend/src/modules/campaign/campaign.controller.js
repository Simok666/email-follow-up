const service = require('./campaign.service');

async function upsert(req, res){
    const { subject } = req.body;

    if (!subject) {
        return res.status(400).json({ message: 'Subject is required' });
    }
    
    if (!req.user.userId || req.user.userId == null) {
        return res.status(401).json({ message: 'User not found' });
    }

    const campaign = await service.upsertCampaign(req.user.userId, req.body);
    return res.status(201).json(campaign);
}

async function list(req, res){
    const campaigns = await service.getCampaigns(req.user.userId);
    return res.status(200).json(campaigns);
}

async function detail(req, res) {
    const campaign = await service.getCampaignById(req.user.userId, req.params.id);

    if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' })
    }

    return res.status(200).json(campaign);
}

async function remove(req, res){
    await service.deleteCampaign(req.user.userId, req.params.id);
    return res.status(200).json({ message: 'Campaign removed' });
}

async function stop(req, res) {
    await service.stopCampaing(req.user.userId, req.params.id);
    return res.status(200).json({ message: 'Campaign stopped' });
}

module.exports = {
    upsert,
    list,
    detail,
    remove,
    stop
}