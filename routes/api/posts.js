const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');

// @Route POST api/v1/posts
// @desc Create a post
// @acess public
router.post('/', 
[
  auth,
  [
    check('text', 'Text is required')
    .not()
    .isEmpty()
  ]
],
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select('-password');
  const  newPost = new Post({
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id
  });

  const post = await newPost.save();
  res.json(post);
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
}
);

// @Route GET api/v1/posts
// @desc Get all posts
// @acess Private
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }

});

// @Route GET api/v1/posts
// @desc Get a post
// @acess Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(404).json({ msg: 'Post not found' })
    }
    res.json(post);
  } catch (error) {
    
    console.error(error.message);
    if(err.kind === 'ObjectId'){
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error'); 
  }
});

// @Route DELETE api/v1/posts/:id
// @desc Delete a post
// @acess Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
     
    if(!post){
      return res.status(404).json({ msg: 'Post not found' });
    }
    //Check user
    if(post.user.toString() !== req.user.id){
      return res.status(401).json({ msg: 'User not authorized'});
    }

    await post.deleteOne();

    res.json({ msg: 'Post removed' });
  } catch (error) {
    console.error(error.message);
    if(err.kind === 'ObjectId'){
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    res.status(500).send('Server Error');
  }

});

// @Route PUT api/v1/posts/like/:id
// @desc Like a post
// @acess Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //Check if  the post has already been liked
    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
      return res.status(400).json({ msg: 'Post already  liked'});
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);

  } catch (error) {
    
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @Route PUT api/v1/posts/unlike/:id
// @desc  Unlike a post
// @acess Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Check if  the post has already been liked
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
      return res.status(400).json({ msg: 'Post has yet not been liked'});
    }
    //Get remove index
    const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);

  } catch (error) {
    
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @Route POST api/v1/posts/comment
// @desc Comment on  a post
// @acess Private
router.post(
  '/comment/:id', 
  [
    auth,
    [
      check('text', 'Text is required')
      .not()
      .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const  newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments);
      
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @Route DELETE api/v1/posts/comment/:id/:comment_id
// @desc Delete comment
// @acess Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) =>{
  try {
    const post = await Post.findById(req.params.id);

    //Pull out comment
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);
    
    //Make sure comment exists
    if(!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    //Check user
    if(comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    //Get remove index
    const removeIndex = post.comments.map(comments => comments.user.toString()).indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
 
    await post.save();
    
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
      res.status(500).send('Server Error');
  }
});

module.exports = router;