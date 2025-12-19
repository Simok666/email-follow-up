const service = require('./followup.service');

async function add(req, res) {
    const { step, delayDays, emailBody } = req.body;
    
    if (!step || !delayDays || !emailBody) {
        return res.status(400).json({ message: 'Invalid follow-up data' });
    }

    const followup = await service.addFollowup(
        req.params.campaignId,
        step, 
        delayDays, 
        emailBody
    );

    return res.status(201).json(followup);
}

async function remove(req, res) {
  await service.deleteFollowup(req.params.id)
  res.json({ message: 'Follow-up deleted' })
}

async function list(req, res) {
    const followups = await service.getFollowups(req.params.campaignId);
    return res.status(200).json(followups);
}

module.exports = {
    add,
    remove,
    list
}