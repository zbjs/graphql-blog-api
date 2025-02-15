// src/modules/user/user.graphql.ts

export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    username: String!
    firstName: String
    lastName: String
    role: UserRole!
    createdAt: String!
    updatedAt: String!
  }

  enum UserRole {
    USER
    ADMIN
  }

  input CreateUserInput {
    email: String!
    password: String!
    username: String!
    firstName: String
    lastName: String
  }

  input UpdateUserInput {
    email: String
    password: String
    username: String
    firstName: String
    lastName: String
  }

  type Query {
    getUser(id: ID!): User
    getUserByEmail(email: String!): User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }
`;