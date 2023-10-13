const razorpay = require("razorpay");
const { instance } = require("../config/razorpayy");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrolementEmail } = require("../mail/courseEnrolementEmail");
const { default: mongoose } = require("mongoose");

//capture payment and initiate the razorpay order
function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}
exports.capturePayment = async (req, res) => {
  //get courseId and userId //
  const { courseId } = req.body;
  const userId = req.user.id;
  //validations
  //vaalid course hai ya nahi
  if (!courseId) {
    return res.json({
      success: false,
      message: "Please provide valid course Id",
    });
  }
  //valid courseDetails hai ya nhoi
  let course;
  try {
    course = await Course.find({ _id: courseId });
    if (!course) {
      return res.json({
        success: false,
        message: "Couldn't find the course",
      });
    }
    // user already payed for this course or not
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)) {
      return res.json({
        success: false,
        message: "Student already enrolled",
      });
    }
  } catch (error) {
    console.log("Error :", error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
  //order create karo //
  const amount = course.price;
  const currency = "INR";
  const options = {
    amount: amount * 100,
    currency,
    reciept: generateRandomString(12),
    notes: {
      courseId,
      userId,
    },
  };
  try {
    //initate payment
    const paymentResponse = instance.orders.create(options);
    console.log("payment response: ", paymentResponse);
    //return response//

    return res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderId: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: (await paymentResponse).amount,
    });
  } catch (error) {
    console.log("Error :", error.message);
    return res.json({
      success: false,
      error: error.message,
      messsage: "Could not initiate order",
    });
  }
};

//verify signature of razorpay and server
exports.verifySignature = async (req, res) => {
  const webhookSecret = "12345678";
  const signature = req.headers("x-razorpay-signature"); //hashed karke aai hai
  //so webhook ko hash karke match karwale ///
  const shaSum = crypto.createHmac("sha256", webhookSecret);
  shaSum.update(JSON.stringify(req.body));
  const digest = shaSum.digest("hex");

  if (signature === digest) {
    console.log("payment is authorized");
    const { courseId, userId } = req.body.payload.payment.entity.notes;
    try {
      //fulffill action \
      //find the course and enrol the student //
      const enrolledCourse = await Course.findByIdAndUpdate(
        { _id: courseId },
        {
          $push: {
            studentsEnrolled: userId,
          },
        },
        { new: true }
      );
      if (!enrolledCourse) {
        return res.status(500).json({
          success: false,
          message: "Course not found",
        });
      }
      console.log(enrolledCourse);
      //find student and update the user model
      const enrolledStudent = await User.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            courses: courseId,
          },
        },
        { new: true }
      );

      console.log(enrolledStudent);
      //mail send karde confirmation ka //
      const mailResponse = await mailSender(
        enrolledStudent.email,
        "Congratulations for enrolement",
        "Welcome onboard with studynotion for your journey "
      );
      console.log(mailResponse);
      return res.status(200).json({
        success: true,
        message: "Signature verifyed and course added",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  } else {
    return res.status(400).json({
      success: false,
      message: "Signature veryfication failed ",
    });
  }
};
