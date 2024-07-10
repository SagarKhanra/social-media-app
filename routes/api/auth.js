const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const config = require('config');

const User = require('../../models/User');

// @Route GET api/v1/auth
// @desc Test route
// @acess Public
router.get('/', auth, async(req, res) => {
  try{
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
} );

// @Route POST  api/v1/user
// @desc Authenticate user & get token
// @acess Public
router.post(
  '/',
  [
    
    check('email','Please include a valid email').isEmail(),
    check(
      'password',
      'please enter a password 6 or more characters',
    ).exists()
  ],
  async(req, res) => { 
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password} = req.body;

    try{

      let user = await User.findOne({ email });
      if(!user) {
        return res.status(400).json({errors: [{ msg : 'Invalid credentials' }] });
      }
      
      const ismatch = await bcrypt.compare(password, user.password);

      if(!ismatch) {
          return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
          
      }
      
        
    

      
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