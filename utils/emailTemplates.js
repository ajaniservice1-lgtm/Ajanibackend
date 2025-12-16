// REGISTRATION EMAIL TEMPLATES


const userRegistrationEmailTemplate = firstName => {
  return `
    <p>Hi ${firstName || "there"},</p>
    <p>Congratulations! Your account has been successfully created.</p>
    <p>You can now start using all the features of Ajani.</p>
    <a href="${process.env.FRONTEND_URL}" style="text-decoration: none; padding: 10px; border-radius: 5px; background-color: #007bff; display: inline-block; margin-top: 10px; color: white;">Explore Our Listings</a>
    <p>Thank you for joining us!</p>
    <p>Best regards,</p>
    <p>Ajani Team</p>
  `;
};

const vendorRegistrationEmailTemplate = firstName => {
  return `
    <p>Hi ${firstName || "there"},</p>
    <p>Congratulations! Your vendor account has been successfully created.</p>
    <p>Please wait for your account to be approved by the admin as it currently under review. This may take up to 24 hours.</p>
    <p>Once approved, you will receive an email with full access to your vendor account.</p>
    <a href="${process.env.FRONTEND_URL}/vendor/login" style="text-decoration: none; padding: 10px; border-radius: 5px; background-color: #007bff; display: inline-block; margin-top: 10px; color: white;">Login to your vendor account</a>
    <p>Thank you for joining us!</p>
    <p>Best regards,</p>
    <p>Ajani Team</p>
  `;
};

export { userRegistrationEmailTemplate, vendorRegistrationEmailTemplate };
