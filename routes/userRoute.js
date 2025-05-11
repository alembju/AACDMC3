const express = require('express');
const user = express();
const bodyParser = require('body-parser');

user.use(bodyParser.json());
user.use(bodyParser.urlencoded({ extended:true }));

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null,path.join(__dirname,'../public/documents'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});

const upload = multer({ storage:storage });

const userController = require('../controllers/userController');

user.post('/Esend', upload.single('document'), userController.sendMail);

module.exports = user;