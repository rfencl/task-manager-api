const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail
    .send({
      to: email,
      from: 'rick.fencl@gmail.com',
      subject: 'Welcome to Task Manager',
      text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
    })
    .catch((e) => {
      console.log(e);
    });
};

const sendCancelationEmail = (email, name) => {
  sgMail
    .send({
      to: email,
      from: 'rick.fencl@gmail.com',
      subject: "We're sorry you're leaving",
      text: `${name}, Please help us improve by telling us why you're canceling your account.`,
    })
    .catch((e) => {
      console.log(e);
    });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
