import express from 'express';
import cors from 'cors';
import Login from './models/login.js'
import Todos from './models/todoStore.js'
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';


const app = express();
const port = process.env.PORT ;
app.use(cors());            // Allow requests from frontend
app.use(express.json());
await mongoose.connect('mongodb://127.0.0.1:27017/loginData');

app.post('/signIn', async (req, res) => {
  try {
    const { username, email, password, re_password } = req.body.credentials || {};

    if (!username || !email || !password || !re_password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== re_password) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    //await Login.deleteMany({}); // Clear existing users for testing purposes
    const exists = await Login.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const data = new Login({ username, email, password });
    await data.save();

    return res.json({ message: `User ${username} registered successfully!` });
  } catch (err) {
    console.error("Sign-in error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post('/login', async (req, res) => {
  const response = await req.body.credentials;
  const { email, password } = response;
  console.log(response);
  let data = await Login.findOne({
    $or: [
      { email },
      { password }
    ]
  })
  if (!data) return res.json('Account Not Exists')
  else if (password !== data.password) return res.json('password not matched')
  else if (email !== data.email) return res.json('username doesnt matched')
  res.json(['Login successfuly', data.username])
})


app.post('/add', async (req, res) => {
  const { username, todos } = req.body;
  if (!username || !todos) return
  let exist = await Todos.findOne({ username: username });
  if (exist) {
    await Todos.updateOne({ username: username }, { $set: { todos: todos } });
    return res.json({ message: 'todo added successfully' ,todos});
  }

  const newTodo = new Todos({ username: username, todos: todos });
  await newTodo.save();
  return res.json({ message: 'todo added successfully', todos});

})

app.post('/todos',async(req,res)=>{
  const {username} = req.body;
  let exists = await Todos.findOne({username:username})
  if(!exists) return
  Todos.findOne({username:username}).then((data)=>{
    res.json({todos:data.todos})
  })
})

app.post('/checked',async(req,res)=>{
let {username,todos} = req.body;
let exist = await Todos.findOne({ username: username });
  if (exist) {
    await Todos.updateOne({ username: username }, { $set: { todos: todos } });
    return res.json({ message: 'todo completed' ,todos});
  }
})

app.post('/delete',async(req,res)=>{
let {checkId,newTodos,username} = req.body;
let exist = await Todos.findOne({username:username});
  if (exist) {
    await Todos.updateOne({ username: username }, { $set: { todos: newTodos } });
    return res.json({ message: 'todo deleted' ,newTodos,checkId});
  }
})

app.post('/changePassword',async(req,res)=>{
  const {email,newPassword} = req.body;
  const exists = await Login.findOne({email:email});
  if(!exists) return res.status(400).json({error:"User does not exist"});
  await Login.updateOne({email:email},{$set:{password:newPassword}});
  return  res.json({message:"Password changed successfully"});
})

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
