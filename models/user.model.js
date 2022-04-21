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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Calendar",
      required: datasUser.calendrier.required,
    },
    role: {
      type: String,
      enum: datasUser.role.roles,
      default: datasUser.role.default,
    },
  },
  // Add automaticattly a field 'CreatedAt' and 'updatedAt' in mongoDB
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  //Middlware qui est lancer quand on insert un item à la db via 'create' (pas avec 'insertMany')
  //par exemple pour hash un mdp d'un nouvel utilisateur.
  if (!this.isModified("password")) return next();
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(this.password, salt);
  this.password = hashedPassword;
});

userSchema.method("verifyPassword", async function (passToCheck) {
  // Return true if passToCheck is the good password
  return await bcrypt.compare(passToCheck, this.password);
});

// il y a d'autre type de middleware de ce genre 'remove' par exemple.

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
