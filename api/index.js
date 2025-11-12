import express from 'express';
import cors from 'cors';
import Login from './models/login.js'
import Todos from './models/todoStore.js'
import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();
//dotenv.config({ path: '../.env' });
import serverless from 'serverless-http';


const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;
console.log("Loaded Mongo URI:", process.env.MONGO_URI);

console.log(port);


app.use(cors());
app.use(express.json());

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(mongoURI);
  isConnected = true;
  console.log('✅ MongoDB connected');
}

app.get('/', (req, res) => {
  res.send('Backend working fine ✅');
});


app.post('/signIn', async (req, res) => {
  await connectDB();
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
  await connectDB();
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
  await connectDB();
  const { username, todos } = req.body;
  if (!username || !todos) return
  let exist = await Todos.findOne({ username: username });
  if (exist) {
    await Todos.updateOne({ username: username }, { $set: { todos: todos } });
    return res.json({ message: 'todo added successfully', todos });
  }

  const newTodo = new Todos({ username: username, todos: todos });
  await newTodo.save();
  return res.json({ message: 'todo added successfully', todos });

})

app.post('/todos', async (req, res) => {
  await connectDB();
  const { username } = req.body;
  let exists = await Todos.findOne({ username: username })
  if (!exists) return
  Todos.findOne({ username: username }).then((data) => {
    res.json({ todos: data.todos })
  })
})

app.post('/checked', async (req, res) => {
  await connectDB();
  let { username, todos } = req.body;
  let exist = await Todos.findOne({ username: username });
  if (exist) {
    await Todos.updateOne({ username: username }, { $set: { todos: todos } });
    return res.json({ message: 'todo completed', todos });
  }
})

app.post('/delete', async (req, res) => {
  await connectDB();
  let { checkId, newTodos, username } = req.body;
  let exist = await Todos.findOne({ username: username });
  if (exist) {
    await Todos.updateOne({ username: username }, { $set: { todos: newTodos } });
    return res.json({ message: 'todo deleted', newTodos, checkId });
  }
})

app.post('/changePassword', async (req, res) => {
  await connectDB();
  const { email, newPassword } = req.body;
  const exists = await Login.findOne({ email: email });
  if (!exists) return res.status(400).json({ error: "User does not exist" });
  await Login.updateOne({ email: email }, { $set: { password: newPassword } });
  return res.json({ message: "Password changed successfully" });
})



// ✅ Local mode only
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`🚀 Server running locally on port ${port}`));
}

// ✅ Required for Vercel
export const handler = serverless(app);

