const nodemailer = require("nodemailer");
const mailSender = async (email, title, body) => {
  try {
    //transporter //
    let transporter = nodemailer.createTransport({
      host: process.env.MAIl_HOST,
      auth: {
        user: process.env.MAIl_USER,
        pass: process.env.MAIl_PASS,
      },
    });
    //send mail//
    let info = await transporter.sendMail({
      from: "StudyNotion - by Sadiq Khan",
      to: `${email}`,
      subject: title,
      html: body,
    });
    console.log("info: ", info);
    return info;
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = mailSender;
