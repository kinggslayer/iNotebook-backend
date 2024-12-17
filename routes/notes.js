const express = require("express");
const router= express.Router();
const { query, validationResult } = require('express-validator');
var fetchuser = require("../middleware/fetchuser");
var Notes=require("../models/Notes");



router.get("/fetchallnotes",fetchuser, async (req, res)=>{
    // res.json([])
    const notes= await Notes.find({user:req.user.id});
    res.json(notes);
})

router.post("/addnote",fetchuser,[
    query('title').isLength({min:3}),
    query('description').isLength({min:5}),
], async (req, res)=>{
    try {
        const {title, description,tag} = req.body;
        const errors=validationResult(req);
        if(errors.isEmpty()){
        return res.status(400).json({errors:errors.array});
    }
        const note = new Notes({
            title,description,tag,user:req.user.id,
        })
        const savednote = await note.save();
        res.json(savednote);
    }catch(error){
        console.error(error.message);
        res.status(500).send("some error occured");
    }
})

router.put("/updatenote/:id",fetchuser, async (req, res)=>{
    // res.json([])
    const {title,description,tag} = req.body;
    try {
    const newnote={    };
    if(title){newnote.title=title}
    if(description){newnote.description=description}
    if(tag){newnote.tag=tag}

    let note= await Notes.findById(req.params.id);
    if(note.user.toString()!==req.user.id){
        res.status(401).send("not allowed");
    }
    note=await Notes.findByIdAndUpdate(req.params.id, {$set:newnote},{new:true})
    res.json(note);
}catch(error){
    console.error(error.message);
    res.status(500).send("some error occured");
}
})


router.delete("/deletenote/:id",fetchuser, async (req, res)=>{
    try {
    let note= await Notes.findById(req.params.id);
    if(!note){
        return res.status(404).send("not found")
    }
    if(note.user.toString()!==req.user.id){
        res.status(401).send("not allowed");
    }
    note=await Notes.findByIdAndDelete(req.params.id)
    res.json({"sucess":"NOte deleted", note:note});
}catch(error){
    console.error(error.message);
    res.status(500).send("some error occured");
}
})
module.exports = router;