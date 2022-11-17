const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require('express-validator');
const router = require("express").Router();
const verifyUser = require("../middlewear/verify")

const jwt_key = process.env.JWT


// create new user 
router.post("/newuser", [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let user = await User.findOne({ email: req.body.email })

        if (user) return res.status(400).json({ error: "Sorry a user with this email already exists" });

        const salt = await bcrypt.genSalt(10)
        const securepass = await bcrypt.hash(req.body.password, salt);

        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securepass
        });

        const data = {
            user: {
                id: user.id
            }
        }

        const auth = jwt.sign(data,jwt_key);
        res.json({authToke:auth});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");

    }

});

// Login

router.post("/login",[
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async(req,res)=>{

    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email,password} = req.body;
    try {
        const user = await User.findOne({email});
        if (!user) {
            success = false
            return res.status(400).json({ error: "Please try to login with correct credentials" });
          }
         const  comparePassword = bcrypt.compare(password,user.password);

         if (!comparePassword) {
            success = false
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
          }
          const data = {
            user: {
              id: user.id
            }
          }
          const auth = jwt.sign(data, jwt_key);
          success = true;
          res.json({ success, auth })
      
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");        
    }

});

router.post('/getuser',verifyUser, async (req, res) => {

    try {
      userId = req.user.id;
      const user = await User.findById(userId).select("-password")
      res.send(user)
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  })

module.exports = router;
