const prisma = require('../../config/prisma')
const crypto = require('crypto')
const audit = require('../../services/audit.service')

exports.createContract = async (req, res) => {
    const { templateId, variables } = req.body

    const contract = await prisma.contract.create({
        data: {
            templateId,
            userId: req.user.userId,
            publicLink: crypto.randomUUID,
            status: 'DRAFT',
            variables: {
                create: variables
            }
        }
    })

    await audit.log({ contractId: contract.id, action: 'CREATE_CONTRACT', req });

     return res.status(201).json(contract);
}

exports.getContract = async (req, res) => {
    const contract = await prisma.contract.findUnique({
        where: {
            id: req.params.id
        },
        include: {
            variables: true
        }
    })

    return res.status(200).json(contract)
}

exports.signContract = async (req, res) => {
    const { signerName, type, value } = req.body

    const signature = await prisma.signature.create({
        data: {
            contractId: req.params.id,
            signerName,
            type,
            value
        }
    });

    await prisma.contract.update({
        where: {id : req.params.id},
        data: {
            status: 'SIGNED',
            signedAt: new Date()
        }
    });

    await audit.log({ contractId: req.params.id, action: 'SIGNED', req });

    return res.status(200).json(signature)
}
