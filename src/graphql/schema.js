// src/graphql/schema.js

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
} = require("graphql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Blog = require("../models/Blog");
const authMiddleware = require("../middleware/auth");
require("dotenv").config();

// User Type
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
  }),
});

// Blog Type
const BlogType = new GraphQLObjectType({
  name: "Blog",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    author: {
      type: UserType,
      resolve(parent) {
        return User.findById(parent.author);
      },
    },
  }),
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    me: {
      type: UserType,
      resolve(parent, args, context) {
        const user = authMiddleware(context);
        if (!user) throw new Error("Unauthorized");
        return User.findById(user.id);
      },
    },
    blogs: {
      type: new GraphQLList(BlogType),
      resolve() {
        return Blog.find();
      },
    },
    blog: {
      type: BlogType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return Blog.findById(args.id);
      },
    },
  },
});

// Mutations
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    register: {
      type: UserType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        // Check if the user exists
        const existingUser = await User.findOne({ email: args.email });
        if (existingUser) throw new Error("User already exists");

        // Hash password
        const hashedPassword = await bcrypt.hash(args.password, 10);

        // Create and save user
        const user = new User({
          username: args.username,
          email: args.email,
          password: hashedPassword,
        });

        return user.save();
      },
    },
    login: {
      type: GraphQLString,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const user = await User.findOne({ email: args.email });
        if (!user) throw new Error("User not found");

        const validPassword = await bcrypt.compare(args.password, user.password);
        if (!validPassword) throw new Error("Invalid credentials");

        return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      },
    },
    createBlog: {
      type: BlogType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
      },
    async  resolve(parent, args, context) {
        const user = authMiddleware(context);
        if (!user) throw new Error("Unauthorized");

         // Prevent duplicate blog titles
         const existingBlog = await Blog.findOne({ title: args.title });
         if (existingBlog) throw new Error("Blog with this title already exists");

        const blog = new Blog({
          title: args.title,
          content: args.content,
          author: user.id,
        });

        return blog.save();
      },
    },
    updateBlog: {
      type: BlogType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
      },
      async resolve(parent, args, context) {
        const user = authMiddleware(context);
        if (!user) throw new Error("Unauthorized");

        return Blog.findOneAndUpdate(
          { _id: args.id, author: user.id },
          { title: args.title, content: args.content },
          { new: true }
        );
      },
    },
    deleteBlog: {
      type: BlogType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args, context) {
        const user = authMiddleware(context);
        if (!user) throw new Error("Unauthorized");

        return Blog.findOneAndDelete({ _id: args.id, author: user.id });
      },
    },
  },
});

module.exports = new GraphQLSchema({ query: RootQuery, mutation: Mutation });
