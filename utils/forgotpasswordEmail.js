const sgMail = require("@sendgrid/mail");

const forgotPasswordEmail = async (name, email, passwordToken) => {
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   const forgotPassword = `${process.env.ORIGIN}/forgotPassword.html?token=${passwordToken}&email=${email}`;
   const msg = {
      to: email,
      from: process.env.HOST_EMAIL,
      subject: "Forgot Password",
      html: `<h1>Hello, ${name}!</h1>
      <p> thank you for using SHOPEASE Store </p>
      <p> Please do not share your email with others !!!!</p>
       <p> forgot your password by clicking the link below:</p>
      <a href="${forgotPassword}"><strong> forgot Password </strong> </a>
      `,
   };
   sgMail
      .send(msg)
      .then(() => {
         return console.log('success  !!!!');
      })
      .catch((error) => {
         return console.error("Error sending email:", error);
      });
};

module.exports = forgotPasswordEmail;
