const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

const User = require('../models/userModel')
const Note = require('../models/noteModel')
const { ro } = require('date-fns/locale')

//@desc get user list
//@route GET /users
//@access private
const getUsers = asyncHandler(async(req, res) => {
    const users = await User.find().select('-password').exec()
    if(!users)
    {
        return res.status(400).json({message: 'No users found'})
    }
    res.status(200).json(users)
})

//@desc create new user
//@route POST /users
//@access public
const createUser = asyncHandler(async(req, res) => {
    const {username, password, roles} = req.body

    //check if all fields are added
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({message: 'Please add all fields'})

    }

    //check for duplicate
    const duplicate = await User.findOne({username}).exec()
    if (duplicate)
    {
        return res.status(400).json({message: 'Username already exists'})
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10) // 10 salt rounds
    const userObject = {username, 'password': hashedPassword, roles}

    //create new user
    const user = await User.create(userObject)

    if(user){
        res.status(200).json({message: `User ${username} created`})
    }
    else{
        res.status(400).json({message: `Invalid data`})
    }
})

//@desc update user info
//@route PATCH /users
//@access private
const updateUser = asyncHandler(async(req, res) => {
    const {id, username, roles, active, password} = req.body

    //confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof(active) !== 'boolean'){
        return res.status(400).json({message: 'please add all fields'})
    }
    const user = await User.findById(id).exec()

    if(!user){
        return res.status(400).json({message: "User not found"})
    }

    //check for duplicate
    const duplicate = await User.findOne({username}).exec()
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate username'})
    }

    user.username = username
    user.roles = roles
    user.active = active

    if(password){
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.status(200).json({message: `User ${updatedUser.username} updated`})
})

//@desc delete user
//@route DELETE /users
//@access private
const deleteUser = asyncHandler(async(req, res) => {
    const {id} = req.body
    if (!id){
        return res.status(400).json({message: 'User ID required'})
    }

    const note = await Note.findOne({user: id}).exec()
    if (note){
        return res.status(400).json({message: 'User has assigned notes'})
    }
    
    const user = await User.findById(id).exec()
    if(!user){
        return res.status(400).json({message: 'User not found'})
    }
    const result = await user.deleteOne()
    const reply = `User ${result.username} with ID ${result.id} deleted`
    res.json(reply) 
})

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser
}