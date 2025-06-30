const sgMail = require("@sendgrid/mail");

const refundEmail = async (name, email, paymentIntent, amount) => {
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);

   const msg = {
      to: email,
      from: process.env.HOST_EMAIL,
      subject: "Payment Refund Confirmation",
      html: `<h1>Hello, ${name}!</h1>
      <p>Thank you for using SHOPEASE Store.</p>
      <p>We have successfully processed your refund.</p>
      <p><strong>Refund Details:</strong></p>
      <ul>
         <li><strong>Payment Intent ID:</strong> ${paymentIntent}</li>
         <li> <b> Amount: ${amount/100} </b> </li>
         <li><strong>Status:</strong> Refunded</li>
      </ul>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,</p>
      <p><strong>SHOPEASE Support Team</strong></p>
      `,
   };

   sgMail
      .send(msg)
      .then(() => {
         console.log("Refund email sent successfully!");
      })
      .catch((error) => {
         console.error("Error sending refund email:", error);
      });
};

module.exports = refundEmail;
