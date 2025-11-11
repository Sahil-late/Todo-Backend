import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
  username:String,
  todos: [
    {
      id:String,todo:String,done:Boolean,
    },
  ],
});

export const Todos = mongoose.model('todostore', todoSchema);
export default Todos;
