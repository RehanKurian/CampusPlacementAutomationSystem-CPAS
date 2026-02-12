const buildEmailContent = ({
  status,
  studentName,
  jobTitle,
  companyName,
  recruiterName,
  recruiterPosition,
  recruiterEmail,
  statusMessage,
  customMessage,
  subjectOverride
}) => {
  const safeStudent = studentName || 'Applicant';
  const safeJob = jobTitle || 'the role';
  const safeCompany = companyName || 'our company';
  const safeRecruiter = recruiterName || 'Recruitment Team';
  const safePosition = recruiterPosition || '';
  const safeEmail = recruiterEmail || '';

  const templates = {
    pending: {
      subject: `Application received for ${safeJob}`,
      body: `Thanks for applying to ${safeCompany}. We have received your application for ${safeJob} and will review it soon.`
    },
    'in-review': {
      subject: `Application in review for ${safeJob}`,
      body: `Your application for ${safeJob} at ${safeCompany} is now in review. We will update you as soon as there is progress.`
    },
    shortlisted: {
      subject: `You are shortlisted for ${safeJob}`,
      body: `Congratulations. You have been shortlisted for ${safeJob} at ${safeCompany}. We will share next steps shortly.`
    },
    interview: {
      subject: `Interview update for ${safeJob}`,
      body: `Your interview process for ${safeJob} at ${safeCompany} is moving forward. Please review the details below.`
    },
    accepted: {
      subject: `Offer update for ${safeJob}`,
      body: `Congratulations. We are excited to move forward with you for ${safeJob} at ${safeCompany}. Please review the details below.`
    },
    rejected: {
      subject: `Update on your application for ${safeJob}`,
      body: `Thank you for your time and interest in ${safeJob} at ${safeCompany}. After careful review, we have decided to move forward with other candidates.`
    }
  };

  const template = templates[status] || templates.pending;
  const subject = subjectOverride || template.subject;

  // Build signature
  const signatureLines = [safeRecruiter];
  if (safePosition || safeCompany) {
    signatureLines.push([safePosition, safeCompany].filter(Boolean).join(', '));
  }
  if (safeEmail) {
    signatureLines.push(safeEmail);
  }

  const messageBlocks = [
    template.body,
    statusMessage ? `Recruiter note: ${statusMessage}` : null,
    customMessage ? `Additional message: ${customMessage}` : null,
    `Regards,\n${signatureLines.join('\n')}`
  ].filter(Boolean);

  const text = `Hi ${safeStudent},\n\n${messageBlocks.join('\n\n')}`;

  const htmlBlocks = [
    `<p>Hi ${safeStudent},</p>`,
    `<p>${template.body}</p>`,
    statusMessage ? `<p><strong>Recruiter note:</strong> ${statusMessage}</p>` : null,
    customMessage ? `<p>${customMessage}</p>` : null,
    `<p>Regards,<br />${signatureLines.join('<br />')}</p>`
  ].filter(Boolean);

  const html = htmlBlocks.join('');

  return { subject, text, html };
};

module.exports = { buildEmailContent };
