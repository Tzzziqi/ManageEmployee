const Invite = require('../models/RegistrationToken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dayjs = require('dayjs');

const getAllInvites = async (req, res) => {
    try {
        const invites = await Invite.find().sort({ createdAt: -1 });
        res.status(200).json(invites);
    } catch (error) {
        res.status(500).json({ message: 'Server error during get all invites.', error: error.message });
    }
};

const revokeInvite = async (req, res) => {
    const { id } = req.params;

    try {

        const invite = await Invite.findById(id);

        if (!invite) {
            return res.status(404).json({ message: 'Invite not found.' });
        }

        if (invite.status === 'used') {
            return res.status(400).json({ message: 'Invite has already been used.' });
        }

        invite.status = 'revoked';
        await invite.save();

        res.status(200).json({ message: 'Success revoke', data: invite });
    } catch (error) {
        res.status(500).json({ message: 'Server error during revoke invite.', error: error.message });
    }
};

const generateInvite = async (req, res) => {
    const { email, role } = req.body;

    try {

        const token = crypto.randomBytes(16).toString('hex');

        const expirationDate = dayjs().add(3, 'hours').toDate();

        // 3. 儲存到 MongoDB
        const newInvite = new Invite({
            email,
            role,
            inviteToken: token,
            expirationDate,
            status: 'pending'
        });
        await newInvite.save();

        // 4. 發送郵件 (使用 Nodemailer)
        const transporter = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "093eaffb16cd3a",
                pass: "30b4a27a69a6ad"
            }
        });

        const registrationLink = `http://localhost:5173/WelcomeToChuwa/${token}`;

        const mailOptions = {
            from: '"HR Department" <hr@yourcompany.com>',
            to: email,
            subject: 'Invitation to Join Our Team',
            html: `
                <h3>Welcome to the team!</h3>
                <p>You have been invited to join as a <b>${role}</b>.</p>
                <p>Please click the link below to complete your registration:</p>
                <a href="${registrationLink}">${registrationLink}</a>
                <p>This link will expire on ${dayjs(expirationDate).format('MM-DD-YYYY')}.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'Invite generated and email sent', data: newInvite });
    } catch (error) {
        res.status(500).json({ message: 'Error generating invite', error: error.message });
    }
};

module.exports = {
    getAllInvites,
    revokeInvite,
    generateInvite
};