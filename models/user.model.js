const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const datasUser = require("../config/datas.json").models.users;

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: datasUser.username.unique,
      minlength: datasUser.username.minlength,
      maxlength: datasUser.username.maxlength,
      required: datasUser.username.required,
    },
    password: {
      type: String,
      required: datasUser.password.required,
    },
    calendrier: {
      type: {},
      default: {},
      required: true,
    },
    role: {
      type: String,
      enum: datasUser.role.roles,
      default: datasUser.role.default,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  /*Middleware qui est lancer quand on insert un item à la db via 'create' (pas avec 'insertMany')
  par exemple pour hash un mdp d'un nouvel utilisateur.*/
  if (!this.isModified("password")) return next();
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(this.password, salt);
  this.password = hashedPassword;
});

userSchema.method("verifyPassword", async function (password) {
  // Return true if password is the good password
  return await bcrypt.compare(password, this.password);
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;