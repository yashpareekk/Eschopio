const ErrorHander=require("../utils/errorhandler")
const catchAsyncErrors =require("../middleware/catchAsyncErrors"); 
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail.js")
const crypto = require("crypto")
const cloudinary=require("cloudinary")

//Register a user
exports.registerUser = catchAsyncErrors(async(req,res,next)=>{
    
  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });
  
  const {name,email,password} = req.body;
    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    });

    sendToken(user,201,res);
})


//LOGIN USER
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    //Checking if User has given Both Password and Email
    if (!email || !password){
        return next(new ErrorHander("Please Enter Email & Password", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHander("Invalid email or password", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHander("Invalid email or password", 401));
    }

  sendToken(user,200,res);
})

//LOGOUT USER
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//reset password 
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User not found", 404));
  }

  //Get reset token 
 const resetToken = user.getResetPasswordToken()
 console.log(resetToken,'resetTOken')
 await user.save({ validateBeforeSave: false });



 const resetPasswordUrl= `${req.protocol}://${req.get(
  "host"
)}/password/reset/${resetToken}`;

 const message = `Your password reset token is:- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

 try {
  await sendEmail({
    email: user.email,
    subject: `Ecshopio Password Recovery`,
    message, 
  });

  res.status(200).json({
    success: true,
    message: `Email sent to ${user.email} successfully`,
  });
} catch (error) {
  console.log(error,'err')
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save({ validateBeforeSave: false });

  return next(new ErrorHander(error.message, 500));
}
  
})


//Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  
  //Creating Token Hash
  const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt: Date.now()}
  })

  if (!user) {
    return next(new ErrorHander("Reset password token is invalid or has been expired", 404));
  }

  if(req.body.password !== req.body.confirmPassword){
    return next(new ErrorHander("Password does not match", 404));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save()
  sendToken(user,200,res)
})

//get user deatils 
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
}); 

//update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("Password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();
  sendToken(user, 200, res);
});

//Update user Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

    const imageId = user.avatar.public_id;

    await cloudinary.v2.uploader.destroy(imageId);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    newUserData.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }


  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//Get all Users (admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role (Admin)
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete User (Admin)
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }
  
  const imageId = user.avatar.public_id;
  await cloudinary.v2.uploader.destroy(imageId);

  User.findByIdAndDelete(req.params.id)
  .then(res=>{
     console.log(res)
  })
  .catch(err => {
     console.log(err)
  })

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
})
