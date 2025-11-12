import mongoose from "mongoose";
const loginSchema = new mongoose.Schema({
  username:String,
  email:String,
  password:String
});
export const Login = mongoose.model('login', loginSchema);
export default Login;