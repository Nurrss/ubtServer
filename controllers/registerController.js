const bcrypt = require('bcrypt');

const { hashConstance, ROLES } = require('../enums');
const Users = require('../models/Users');
const Teachers = require('../models/Teachers')
const Students = require('../models/Students')

const handleNewUser = async (req, res) => {
  const { email, firstName, lastName, password, role } = req.body;
  if (!email)
    return res
      .status(400)
      .json({ message: 'Email is required.', success: false });

  if (!password)
    return res
      .status(400)
      .json({ message: 'Password is required.', success: false });

  try {
    // Get user from database with the same email if any
    const validateEmail = async email => {
      let user = await Users.findOne({ email });
      return user ? false : true;
    };

    // validate the email
    let emailNotRegistered = await validateEmail(email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email is already registered.`,
        success: false,
      });
    }

    //encrypt the password
    const hashedPwd = await bcrypt.hash(password, hashConstance);
    const newUser = new Users({
      email,
      password: hashedPwd,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      role,
    });
    const user = await newUser.save();

    //create Teacher entity
    if (role === ROLES.TEACHER) {
      const newTeacher = new Teachers({
        email,
        firstName,
        lastName,          
        userId: user._id,
      })
      await newTeacher.save()
    }
    //or by default create Student entity
    else {
      const newStudent = new Students({
        email,
        firstName,
        lastName,
        userId: user._id,
      })
      await newStudent.save()
    }

    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: `${err.message}` });
  }
};

module.exports = handleNewUser;
