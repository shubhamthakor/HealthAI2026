const { Resend } = require('resend');

// Instantiate Resend client only if API key is configured
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey && apiKey !== 're_your_api_key' ? new Resend(apiKey) : null;

// Send email helper
const sendEmail = async ({ to, subject, html }) => {
  const fromEmail = 'Smart Health System <onboarding@resend.dev>';

  try {
    if (!resend) {
      console.log('--- EMAIL SIMULATION (RESEND NOT CONFIGURED) ---');
      console.log(`To: ${to}`);
      console.log(`From: ${fromEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content:\n${html}`);
      console.log('------------------------------------------------');
      return { success: true, simulated: true };
    }

    const response = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html
    });

    console.log(`Email sent successfully via Resend. ID: ${response.data?.id}`);
    return { success: true, id: response.data?.id };
  } catch (error) {
    console.error(`Resend email delivery failed: ${error.message}`);
    // Return success: false, but don't throw to avoid crashing transaction flow
    return { success: false, error: error.message };
  }
};

// @desc    Email patient regarding appointment status modifications
const sendAppointmentStatusEmail = async (patientEmail, patientName, doctorName, status, details = {}) => {
  const { date, queueNumber, waitTime, reason, prescriptionNotes } = details;
  const formattedDate = date ? new Date(date).toDateString() : 'N/A';

  let subject = '';
  let html = '';

  switch (status.toLowerCase()) {
    case 'approved':
      subject = `Appointment Confirmed - Dr. ${doctorName}`;
      html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hello ${patientName},</h2>
          <p>Your appointment request with <strong>Dr. ${doctorName}</strong> has been <strong>approved</strong>!</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p><strong>Appointment Date:</strong> ${formattedDate}</p>
          <p><strong>Your Queue Number:</strong> ${queueNumber}</p>
          <p><strong>Estimated Wait Time:</strong> ${waitTime} minutes</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p>Please arrive at the clinic 15 minutes before your estimated appointment window.</p>
          <br/>
          <p>Best regards,<br/>Smart Hospital Queue Management Team</p>
        </div>
      `;
      break;

    case 'rejected':
      subject = `Appointment Status Update - Dr. ${doctorName}`;
      html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hello ${patientName},</h2>
          <p>We regret to inform you that your appointment request with <strong>Dr. ${doctorName}</strong> has been <strong>declined</strong>.</p>
          ${reason ? `<p><strong>Reason for rejection:</strong> ${reason}</p>` : ''}
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p>You may request a booking for another date or choose a different specialist.</p>
          <br/>
          <p>Best regards,<br/>Smart Hospital Queue Management Team</p>
        </div>
      `;
      break;

    case 'cancelled':
      subject = `Appointment Cancellation Notice - Dr. ${doctorName}`;
      html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hello ${patientName},</h2>
          <p>Your appointment with <strong>Dr. ${doctorName}</strong> scheduled for <strong>${formattedDate}</strong> has been <strong>cancelled</strong>.</p>
          ${reason ? `<p style="padding: 10px; background-color: #f9f9f9; border-left: 4px solid #f44336;"><strong>Reason for cancellation:</strong> ${reason}</p>` : ''}
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p>If you did not request this cancellation, it may be due to doctor unavailability or schedule changes.</p>
          <br/>
          <p>Best regards,<br/>Smart Hospital Queue Management Team</p>
        </div>
      `;
      break;

    case 'completed':
      subject = `Prescription & Summary - Dr. ${doctorName}`;
      html = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hello ${patientName},</h2>
          <p>Your consultation with <strong>Dr. ${doctorName}</strong> on <strong>${formattedDate}</strong> is complete.</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <h3>Consultation Notes:</h3>
          <p>${prescriptionNotes || 'No notes provided.'}</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p>You can check your patient dashboard to download your complete prescription details.</p>
          <br/>
          <p>Best regards,<br/>Smart Hospital Queue Management Team</p>
        </div>
      `;
      break;

    default:
      return;
  }

  return await sendEmail({ to: patientEmail, subject, html });
};

module.exports = {
  sendAppointmentStatusEmail
};
