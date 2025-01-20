import nodemailer from 'nodemailer';

const sendMail = async ({ email = null, subject, message, html = null, bcc, attachmentUrl }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });


    const mailOptions = {
      from: 'Sudip Sharma <info@sudipsharma.com.np>',
      to: email || process.env.EMAIL, // Default to your email if `email` is null
      bcc: Array.isArray(bcc) ? bcc.join(',') : bcc || process.env.EMAIL, // Handles BCC properly
      subject: subject,
      text: message || '', // Fallback to empty string if `message` is missing
      html: html || message || '', // Use `html` if available, fallback to `message`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: ', info.response);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Failed to send email');
  }
};

export default sendMail;