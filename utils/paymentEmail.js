

const sgMail = require("@sendgrid/mail");

const paymentEmail = async (name, email, paymentIntent) => {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
       const msg = {
          to: email,
          from: process.env.HOST_EMAIL,
          subject: "Payment Receipt",
          html: `
             <h2> Hello ${name} </h2>
             <p style="color: blue"> <b> Thank you for your payment!  </b></p>
             <p><strong>Amount:</strong> ${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}</p>
             <p><strong>Payment ID:</strong> ${paymentIntent.id}</p>
             <p><strong>Status:</strong> ${paymentIntent.status}</p>
             <p>If you have any questions, please contact our support.</p>
          `,
       };
 
       await sgMail.send(msg);
    } catch (error) {
      console.error("Failed to send payment email:", error.message);
    }
 };


 module.exports = paymentEmail