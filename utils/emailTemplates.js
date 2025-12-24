// REGISTRATION EMAIL TEMPLATES

export const userRegistrationEmailTemplate = firstName => {
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

export const vendorRegistrationEmailTemplate = firstName => {
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

export const userConfirmOtpEmailTemplate = (firstName, otp, expiryMinutes) => {
  return `
   <p>Hi ${firstName || "there"},</p>
   <p> Thank you for signing up. Please use the OTP below to confirm your email address and activate your account.</p> <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center;"> ${otp} </p> 
   <p> This code will expire in ${expiryMinutes} minutes. </p> 
   <p> If you did not create this account, you can safely ignore this email.</p> 
   <p>Regards,<br /> <strong>Ajani Team</strong> </p>
  `;
};

export const vendorConfirmOtpEmailTemplate = (firstName, otp, expiryMinutes) => {
  return `
    <p>Hi ${firstName || "there"},</p>
    <p> Thank you for registering as a vendor. Please confirm your email address using the OTP below. </p> <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center;"> ${otp} </p> <p> <strong>Important:</strong> After email confirmation, your vendor account will be reviewed and approved by our admin before you can start using all features. </p> <p> This code will expire in ${expiryMinutes} minutes. </p> <p style="margin-top: 30px;"> Regards,<br /> <strong>Ajani Team</strong> </p>
  `;
};


