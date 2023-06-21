const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')

const User = require('../models/userModel')
const Note = require('../models/noteModel')

//@desc get all notes
//@route GET /notes
//@access private
const getAllNotes = asyncHandler(async(req, res) => {
    const notes = await Note.find()

    //if no notes
    if(!notes?.length){
        return res.status(400).json({message: 'No notes found'})
    }
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user)
        return { note, createdBy: user.username }
    }))
    res.json(notesWithUser)
})

//@desc create new note
//@route POST /notes
//@access private
const createNote = asyncHandler(async(req, res) => {
    const {user, title, text} = req.body
    //confirm date
    if(!user || !title || !text){
        return res.status(400).json({message: 'Please add all fields'})
    }

    //check for duplicate title
    const duplicate = await Note.findOne({title})

    if(duplicate){
        return res.status(409).json({message: 'Title already exists'})
    }
    //create and store new note
    const newNote = {user, title, text}
    const note = await Note.create(newNote)
    if(note)
    {       
        res.status(201).json({message: `Note created: ${note.title}`})
    }
    else{
        res.status(400).json({message: 'Invalid data'})
    }
})

//@desc update note
//@route PATCH /notes
//@access private
const updateNote = asyncHandler(async(req, res) => {
    const {id, user, title, text, completed} = req.body

    //confirm data
    if(!id || !user || !title || !text || typeof(completed) !== 'boolean'){
        return res.status(400).json({message: 'please add all fields'})
    }
    const note = await Note.findById(id).exec()

    if(!note){
        return res.status(400).json({message: "Note not found"})
    }

    //check for duplicate title
    const duplicate = await User.findOne({title})
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate title'})
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.status(200).json({message: `Note ${updatedNote.title} updated`})
})

//@desc delete note
//@route DELETE /notes
//@access private
const deleteNote = asyncHandler(async(req, res) => {
    const {id} = req.body
    if (!id){
        return res.status(400).json({message: 'Note ID required'})
    }

    
    const note = await Note.findById(id)
    if(!note){
        return res.status(400).json({message: 'Note not found'})
    }
    const result = await note.deleteOne()
    res.json(`Note ${result.title} with ID ${result.id} deleted`) 
})

module.exports = {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
}