const { instance } = require("../config/razorpayy");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");
const { courseEnrolementEmail } = require("../mail/courseEnrolementEmail");
const { default: mongoose } = require("mongoose");
// const mongoose = require("mongoose");
const { paymentSuccessEmail } = require("../mail/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");
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
// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body;
  const userId = req.user.id;
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" });
  }

  let total_amount = 0;

  for (const course_id of courses) {
    let course;
    try {
      // Find the course by its ID
      course = await Course.findById(course_id);

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" });
      }

      // Check if the user is already enrolled in the course
      const uid = new mongoose.Types.ObjectId(userId);
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" });
      }

      // Add the price of the course to the total amount
      total_amount += course.price;
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: generateRandomString(12),
  };

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    res.json({
      success: true,
      data: paymentResponse,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." });
  }
};

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id;
  const razorpay_payment_id = req.body?.razorpay_payment_id;
  const razorpay_signature = req.body?.razorpay_signature;
  const courses = req.body?.courses;

  const userId = req.user.id;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" });
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    await enrollStudents(courses, userId, res);
    return res.status(200).json({ success: true, message: "Payment Verified" });
  }

  return res.status(200).json({ success: false, message: "Payment Failed" });
};

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body;

  const userId = req.user.id;

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" });
  }

  try {
    const enrolledStudent = await User.findById(userId);

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    );
  } catch (error) {
    console.log("error in sending mail", error);
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" });
  }
};

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res.status(400).json({
      success: false,
      message: "Please Provide Course ID and User ID",
    });
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnrolled: userId } },
        { new: true }
      );

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" });
      }
      console.log("Updated course: ", enrolledCourse);

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      });
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      );

      console.log("Enrolled student: ", enrolledStudent);
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrolementEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      );

      console.log("Email sent successfully: ", emailResponse.response);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ success: false, error: error.message });
    }
  }
};

//new code for multiple orders //

//capture payment and initiate the razorpay order

// exports.capturePayment = async (req, res) => {
//   //get courseId and userId //
//   const { courseId } = req.body;
//   const userId = req.user.id;
//   //validations
//   //vaalid course hai ya nahi
//   if (!courseId) {
//     return res.json({
//       success: false,
//       message: "Please provide valid course Id",
//     });
//   }
//   //valid courseDetails hai ya nhoi
//   let course;
//   try {
//     course = await Course.find({ _id: courseId });
//     if (!course) {
//       return res.json({
//         success: false,
//         message: "Couldn't find the course",
//       });
//     }
//     // user already payed for this course or not
//     const uid = new mongoose.Types.ObjectId(userId);
//     if (course.studentsEnrolled.includes(uid)) {
//       return res.json({
//         success: false,
//         message: "Student already enrolled",
//       });
//     }
//   } catch (error) {
//     console.log("Error :", error.message);
//     return res.json({
//       success: false,
//       message: error.message,
//     });
//   }
//   //order create karo //
//   const amount = course.price;
//   const currency = "INR";
//   const options = {
//     amount: amount * 100,
//     currency,
//     reciept: generateRandomString(12),
//     notes: {
//       courseId,
//       userId,
//     },
//   };
//   try {
//     //initate payment
//     const paymentResponse = instance.orders.create(options);
//     console.log("payment response: ", paymentResponse);
//     //return response//

//     return res.status(200).json({
//       success: true,
//       courseName: course.courseName,
//       courseDescription: course.courseDescription,
//       thumbnail: course.thumbnail,
//       orderId: paymentResponse.id,
//       currency: paymentResponse.currency,
//       amount: (await paymentResponse).amount,
//     });
//   } catch (error) {
//     console.log("Error :", error.message);
//     return res.json({
//       success: false,
//       error: error.message,
//       messsage: "Could not initiate order",
//     });
//   }
// };

// //verify signature of razorpay and server
// exports.verifySignature = async (req, res) => {
//   const webhookSecret = "12345678";
//   const signature = req.headers("x-razorpay-signature"); //hashed karke aai hai
//   //so webhook ko hash karke match karwale ///
//   const shaSum = crypto.createHmac("sha256", webhookSecret);
//   shaSum.update(JSON.stringify(req.body));
//   const digest = shaSum.digest("hex");

//   if (signature === digest) {
//     console.log("payment is authorized");
//     const { courseId, userId } = req.body.payload.payment.entity.notes;
//     try {
//       //fulffill action \
//       //find the course and enrol the student //
//       const enrolledCourse = await Course.findByIdAndUpdate(
//         { _id: courseId },
//         {
//           $push: {
//             studentsEnrolled: userId,
//           },
//         },
//         { new: true }
//       );
//       if (!enrolledCourse) {
//         return res.status(500).json({
//           success: false,
//           message: "Course not found",
//         });
//       }
//       console.log(enrolledCourse);
//       //find student and update the user model
//       const enrolledStudent = await User.findByIdAndUpdate(
//         { _id: userId },
//         {
//           $push: {
//             courses: courseId,
//           },
//         },
//         { new: true }
//       );

//       console.log(enrolledStudent);
//       //mail send karde confirmation ka //
//       const mailResponse = await mailSender(
//         enrolledStudent.email,
//         "Congratulations for enrolement",
//         "Welcome onboard with studynotion for your journey "
//       );
//       console.log(mailResponse);
//       return res.status(200).json({
//         success: true,
//         message: "Signature verifyed and course added",
//       });
//     } catch (error) {
//       return res.status(500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   } else {
//     return res.status(400).json({
//       success: false,
//       message: "Signature veryfication failed ",
//     });
//   }
// };
