import { asyncHandler } from "./../../utils/asyncHandler.js";
import { User } from "./../../../DB/models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "./../../utils/sendEmails.js";
import { resetPassTemp, signUpTemp } from "./../../utils/htmlTemplates.js";
import { Token } from "./../../../DB/models/token.model.js";
import Randomstring from "randomstring";
import { Cart } from "../../../DB/models/cart.model.js";

export const register = asyncHandler(async (req, res, next) => {
  // data from request
  const { userName, email, password } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (user) return next(new Error("User already existed!", { cause: 409 }));
  // // hash password
  // const hashPassword = bcryptjs.hashSync(
  //   password,
  //   parseInt(process.env.SALT_ROUND)
  // );
  // generate token
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET);
  // create user
  await User.create({ ...req.body });
  // create confirmationLink
  const link = `http://localhost:3000/auth/activate_account/${token}`;
  // send email
  const messageSent = await sendEmail({
    to: email,
    subject: "Activate Account",
    html: signUpTemp(link),
  });

  if (!messageSent) return next(new Error("Something went wrong!"));

  // send response
  return res.json({ success: true, message: "Please review tour email!" });
});

export const activateAccount = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { email } = jwt.verify(token, process.env.TOKEN_SECRET);
  // find user , update isConfirmed
  const user = await User.findOneAndUpdate({ email }, { isConfirmed: true });

  // check if the user doesn't exist
  if (!user) return next(new Error("User not found!", { cause: 404 }));

  // create a cart // TODO
  await Cart.create({ user: user._id });
  // send response
  return res.json({ success: true, message: "Try to login!" });
});

export const login = asyncHandler(async (req, res, next) => {
  // data from request
  const { email, password } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid Email!", { cause: 404 }));
  // check isConfirmed
  if (!user.isConfirmed)
    return next(new Error("You should activate your account first!"));
  // check password
  const match = bcryptjs.compareSync(password, user.password);
  if (!match) return next(new Error("Invalid Password!"));
  // generate token
  const token = jwt.sign({ email, id: user._id }, process.env.TOKEN_SECRET);
  // save token in token model
  await Token.create({ token, user: user._id });
  // send response
  return res.json({ success: true, results: { token } });
});

export const forgetCode = asyncHandler(async (req, res, next) => {
  // data from request
  const { email } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid Email!", { cause: 404 }));
  // generate forgetCode
  const code = Randomstring.generate({ charset: "numeric", length: 5 });
  // save forgetCode to user
  user.forgetCode = code;
  await user.save();
  // send email
  const emailSent = await sendEmail({
    to: email,
    subject: "Reset Password",
    html: resetPassTemp(code),
  });
  if (!emailSent) return next(new Error("Something went worng!"));
  // send response
  return res.json({ success: true, message: "Open your email!" });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  // data from request
  const { email, password, forgetCode } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid Email!", { cause: 404 }));
  // check the forgetCode
  if (user.forgetCode !== forgetCode) return next(new Error("Invalid code!"));
  // hash password and save user
  const hashPassword = bcryptjs.hashSync(
    password,
    parseInt(process.env.SALT_ROUND)
  );
  user.password = hashPassword;
  await user.save();
  // find all token of the user
  const tokens = await Token.find({ user: user._id });
  // invalidate all tokens
  tokens.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });
  // send response
  return res.json({ success: true, message: "try to login now!" });
});
