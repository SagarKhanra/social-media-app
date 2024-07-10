const express = require('express');
const router = express.Router();
const gravator = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const config = require('config');


// @Route post  api/v1/user
// @desc register user
// @acess public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email','please include a valid email').isEmail(),
    check(
      'password',
      'please enter a password 6 or more characters',
    ).isLength({ min: 6 })
  ],
  async(req, res) => { 
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {name, email, password} = req.body;

    try{

      let user = await User.findOne({ email });
      if(user) {
        return res.status(400).json({errors: [{ msg : 'user already exists' }] });
      }
      
      const avatar = gravator.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });
        
      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      
      const payload = {
        user: {
          id: user.id
        }
      };

      
      jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 3600000}, (err, token) => {
        if(err){
          throw err;
        }

        return res.status(200).send({ token });
      });
    } catch(err) {
      console.error(err.message);
      res.status(500).send('server error');
    }
  }
);

module.exports = router;