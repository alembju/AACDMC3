const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const connectDB = require("./db/connect");
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken')

const { logger } = require('./middleware/logEvents');

const ImagesDescriptionMondel = require('./model/ImageDescription')
const HealthFacilityMondel =require('./model/HealthFacilityinfo')
//const User = require('./model/LoginModel')
const session = require('express-session')
//const imageModel = require('./model/Image.model')
//const RegisterMondel = require('./model/Register')
//const MeaselesMondel = require('./model/Measeles')
const NewsFeedMondel = require('./model/NewsFeedMondel')
//const ResearchMondel = require('./model/Research')
//const IRBMondel = require('./model/IRBUpload')
//const ImagesTMondel = require('./model/imageDetails')
const EVENTSMondel = require('./model/Events')
const RepDeseaseMondel = require('./model/RepDesease')
const MongoDBStore = require('connect-mongodb-session')(session);
const emailRoutes = require("./routes/emailRoutes");
const dotenv = require("dotenv");
//require('dotenv').config()
//const image = require('./model/Images')
const CoRegistrationMondel = require('./model/CoRegistration')
const multer = require('multer')
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const port = process.env.PORT || 3000;

const path= require('path');
const { connect } = require('node:http2');
const SECRET_KEY = 'super-secret-key'
dotenv.config();

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

const app = express();
app.use(cors())
app.use(logger);
app.use(express.json({limit:'500mb'}));
//app.use(bodyParser.urlencoded({limit:'50mb', extended: true}))
const server = createServer(app);
const io = new Server(server);



app.use("/files", express.static("files"));
app.use("/image",express.static("image"));
app.use("/CardBottum",express.static("CardBottum"));
app.use("/Cards",express.static("Cards"));
app.use("/Images", express.static("Images"));
app.use("/ReserchPaper", express.static("ReserchPaper"));
app.use("/ReserchProposal", express.static("ReserchProposal"));
app.use("/EmailDoc", express.static("EmailDoc"));
app.use("/MalariaStor", express.static("MalariaStor"));
app.use("/Polio", express.static("Polio"));
app.use("/Rabies", express.static("Rabies"));
app.use("/Meningits", express.static("Meningits"));
app.use("/FinalReserchPaper", express.static("FinalReserchPaper"));
app.use("/RiskA", express.static("RiskA"));
app.use("/Bulletin", express.static("Bulletin"));
app.use("/OutbreakInvestigation", express.static("OutbreakInvestigation"));

app.use("/ActiveSearch", express.static("ActiveSearch"));
app.use("/NOPV", express.static("NOPV"));
app.use("/VRAM", express.static("VRAM"));
app.use("/EPRP", express.static("EPRP"));
app.use("/IAR", express.static("IAR"));
app.use("/Publication", express.static("Publication"));
app.use("/ETraining", express.static("ETraining"));
app.use("/Suppervision", express.static("Suppervision"));
app.use("/RiskComm", express.static("RiskComm"));
app.use("/Guidlines", express.static("Guidlines"));
app.use("/IRBPolicy", express.static("IRBPolicy"));
app.use("/capacityB", express.static("capacityB"));

//app.use(express.json())
//app.use(express.urlencoded({extended:true}))
app.use(bodyParser.json())

//const URI = ("mongodb+srv://AACDMC:Alem%400913629813;@cluster0.en5lj.mongodb.net//image?retryWrites=true&w=majority&appName=Cluster0")
// console.log(process.env.MONGO_URL)
  //const MONGO_URL = process.env.MONGO_URL ;
 mongoose.connect(process.env.MONGO_URL)
//mongoose.connect("")
// async function Connect() {
//   try{
//    await mongoose.connect('URI')
//    console.log(process.env.MONGO_URL)
//   }catch (error){
//     console.log(`error -> ${error}`)
//   }
// }
// connect()


////////////////////////////------------Authontication ------//////////////////
const JWT_SECRET =process.env.JWT_SECRET;


  require("./model/userDetails");
  const User_Login = mongoose.model("UserInfo");

  app.post("/register", async (req, res) => {
    const { fname, lname, email, password, userType } = req.body;
  
    const encryptedPassword = await bcrypt.hash(password, 10);
    try {
      const oldUser = await User_Login.findOne({ email });
  
      if (oldUser) {
        return res.json({ error: "User Exists" });
      }
      await User_Login.create({
        fname,
        lname,
        email,
        password: encryptedPassword,
        userType,
      });
      res.send({ status: "ok" });
    } catch (error) {
      res.send({ status: "error" });
    }
  }); 


  app.post("/login-user", async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User_Login.findOne({ email });
    if (!user) {
      return res.json({ error: "User Not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET, {
        expiresIn: "15m",
      });
  
      if (res.status(201)) {
        return res.json({ status: "ok", data: token });
      } else {
        return res.json({ error: "error" });
      }
    }
    res.json({ status: "error", error: "InvAlid Password" });
  });
  
  app.post("/userData", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET, (err, res) => {
        if (err) {
          return "token expired";
        }
        return res;
      });
      console.log(user);
      if (user == "token expired") {
        return res.send({ status: "error", data: "token expired" });
      }
  
      const useremail = user.email;
      User_Login.findOne({ email: useremail })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });
  app.get("/getAllUser", async (req, res) => {
    let query = {};
    const searchData = req.query.search;
    if (searchData) {
      query = {
        $or: [
          { fname: { $regex: searchData, $options: "i" } },
          { email: { $regex: searchData, $options: "i" } },
        ],
      };
    }
  
    try {
      const allUser = await User_Login.find(query);
      res.send({ status: "ok", data: allUser });
    } catch (error) {
      console.log(error);
    }
  });
  app.post("/deleteUser", async (req, res) => {
    const { userid } = req.body;
    try {
      User_Login.deleteOne({ _id: userid }, function (err, res) {
        console.log(err);
      });
      res.send({ status: "Ok", data: "Deleted" });
    } catch (error) {
      console.log(error);
    }
  });
  
//  Student login and sighen up given by IRB//////////////////////////////////////////////

  require("./model/StudentLogin");
  const StudentLogin = mongoose.model("StudentInfo");

  app.post("/Studentregister", async (req, res) => {
    const {name,Lname,email,username, password ,roles } = req.body;
  
    const encryptedPassword = await bcrypt.hash(password, 10);
    try {
      const oldUser = await StudentLogin.findOne({ email });
  
      if (oldUser) {
        return res.json({ error: "User Exists" });
      }
      await StudentLogin.create({
        name,
        Lname,
        username,
        email,
        password: encryptedPassword,
        roles,
      });
      res.send({ status: "ok" });
    } catch (error) {
      res.send({ status: "error" });
    }
  }); 


  app.post("/GetStudent", async (req, res) => {
    const { email, password } = req.body;
  
    const user = await StudentLogin.findOne({ email });
    if (!user) {
      return res.json({ error: "User Not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET, {
        expiresIn: "15m",
      });
  
      if (res.status(201)) {
        return res.json({ status: "ok", data: token });
      } else {
        return res.json({ error: "error" });
      }
    }
    res.json({ status: "error", error: "InvAlid Password" });
  });
  
  app.post("/userData", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, JWT_SECRET, (err, res) => {
        if (err) {
          return "token expired";
        }
        return res;
      });
      console.log(user);
      if (user == "token expired") {
        return res.send({ status: "error", data: "token expired" });
      }
  
      const useremail = user.email;
      StudentLogin.findOne({ email: useremail })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });
  app.get("/getAllUser", async (req, res) => {
    let query = {};
    const searchData = req.query.search;
    if (searchData) {
      query = {
        $or: [
          { name: { $regex: searchData, $options: "i" } },
          { email: { $regex: searchData, $options: "i" } },
        ],
      };
    }
  
    try {
      const allUser = await StudentLogin.find(query);
      res.send({ status: "ok", data: allUser });
    } catch (error) {
      console.log(error);
    }
  });
  app.post("/deleteUser", async (req, res) => {
    const { userid } = req.body;
    try {
      StudentLogin.deleteOne({ _id: userid }, function (err, res) {
        console.log(err);
      });
      res.send({ status: "Ok", data: "Deleted" });
    } catch (error) {
      console.log(error);
    }
  });
  
 




///const mongoURI = "mongodb://127.0.0.1:27017/image "

//mongoose.connect(mongoURI,{
 // useNewUrlParser:true,
  ///useCreateIndex:true,
  //useUnifiedTopology:true,
//})
//.then((res) => {
 // console.log("mongodb connected")
///});
//const store = new MongoDBStore({
 //uri:mongoURI,
 // collection:"musession"
//});

app.use(session({
  secret: 'key that will sighn cookies',
  resave: false,
  saveUninitialized: false,
  
}))

app.get("/", (req,res) => {
  req.session.isAuth=true;
  console.log(req.session);
  console.log(req.session.id);
  res.send("hellow session tut")
} )

///fetching from register collection---------------
app.get('/fetching',(req, res) =>{
    
    RegisterMondel.find()
    .then(users => res.json(users))
    .catch(err => console.log(err))  
    })
    ///////////////fetchin newsheadline////////////
    app.get('/NewsHeadline',(req, res) =>{
      NewsFeedMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })
      ///////////////fetchin filter////////////
    app.get('/Filter',(req, res) =>{
      const { q } = req.query;
      const Measeles = MeaselesMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })
      ///////////////delet newsheadline///////////

      /////////////////////////////////////////////////////
    app.delete('/deletNewes/:id',(req, res) =>{
      const id = req.params.id;
      NewsFeedMondel.findByIdAndDelete({_id: id})
      .then(res => res.json(res))
      .catch(err => res.json(err))
      })

      ///////////////delet EVENTS///////////

      /////////////////////////////////////////////////////
    app.delete('/deletEvent/:id',(req, res) =>{
      const id = req.params.id;
      EVENTSMondel.findByIdAndDelete({_id: id})
      .then(res => res.json(res))
      .catch(err => res.json(err))
      })
 ////////////////////////Delet Banner/////////////////////////////
 app.delete('/deletBaner/:id',(req, res) =>{
  const id = req.params.id;
  ImagesMondel.findByIdAndDelete({_id: id})
  .then(res => res.json(res))
  .catch(err => res.json(err))
  })
///////////////////////Delet Health Facility//////////////////////////////
app.delete('/deletHF/:id',(req, res) =>{
  const id = req.params.id;
  HealthFacilityMondel.findByIdAndDelete({_id: id})
  .then(res => res.json(res))
  .catch(err => res.json(err))
  })


      ////////////////////// dowenload file///////////
    //multer------------------------------------------------------------
//const multer = require("multer");

/*const storageDowen = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");
const uploadDowen = multer({ storage: storageDowen });

app.post("/upload-files", uploadDowen.single("file"), async (req, res) => {
  console.log(req.file);
  //const title = req.body.title;
  const NUniversity = req.body.NUniversity;
  const Name = req.body.Name;
  const email = req.body.email;
  const phone = req.body.phone;
  const fileName = req.file.filename;
  try {
    await PdfSchema.create({title: title, NUniversity: NUniversity,Name:Name,email:email,phone:phone, pdf: fileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-files", async (req, res) => {
  try {
    PdfSchema.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});*/

      ////////////////////news feed///////////////////////

app.post("/NewsFeed" ,(req, res) => {
  const{News1,News2,News3} = req.body
  NewsFeedMondel.findOne({News1: News1})
  .then(user => {
      if(user){
      res.json("Already have an account")}
      else{
        NewsFeedMondel.create({News1:News1,News2:News2,News3:News3})
          .then(result => res.json("Account created"))
          .catch(err => res.json("error"))
      }
  
}).catch(err => res.json(err))

})


      ////////////////////////delet////////////////////
      app.post("/deleteUser", async (req, res) => {
        const { userid } = req.body;
        try {
          NewsFeedMondel.deleteOne({ _id: userid }, function (err, res) {
            console.log(err);
          });
          res.send({ status: "Ok", data: "Deleted" });
        } catch (error) {
          console.log(error);
        }
      });
      /////////delet geting all news//////////////////
      app.get("/getAllUser", async (req, res) => {
        try {
          const allUser = await NewsFeedMondel.find({});
          res.send({ status: "ok", data: allUser });
        } catch (error) {
          console.log(error);
        }
      });
      ////////////////////news feed///////////////////////

app.post("/NewsFeed" ,(req, res) => {
  const{News} = req.body
  NewsFeedMondel.findOne({News: News})
  .then(user => {
      if(user){
      res.json("Already have an account")}
      else{
        NewsFeedMondel.create({News})
          .then(result => res.json("Account created"))
          .catch(err => res.json("error"))
      }
  
}).catch(err => res.json(err))

})

/////////////////////////////////////////////review student proposal////////////////////////////////////////
app.get('/get/:id', (req, res) => {
  const id = req.params.id
  ResearchMondel.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})

app.put('/update/:id', (req, res) => {
  const id = req.params.id;
  ResearchMondel.findByIdAndUpdate({_id: id}, {
      name: req.body.name,
      email: req.body.email,
      age: req.body.age
  }).then(user => res.json(user))
  .catch(err => res.json(err))
})

//////////////////////////////////////////review Dowenload metadata////////////////////////////////////////HFUpdate
app.get('/Acces/:id', (req, res) => {
  const id = req.params.id
  RegisterMondel.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})

app.put('/updateDowenload/:id', (req, res) => {
  const id = req.params.id;
  RegisterMondel.findByIdAndUpdate({_id: id}, {
      name: req.body.name,
      email: req.body.email,
      age: req.body.age
  }).then(user => res.json(user))
  .catch(err => res.json(err))
})

//////////////////////////////////////////Update Health Facility Name////////////////////////////////////////HFUpdate
app.get('/HFUpdate/:id', (req, res) => {
  const id = req.params.id
  HealthFacilityMondel.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})

app.put('/HFUpdate/:id', (req, res) => {
  const id = req.params.id;
  HealthFacilityMondel.findByIdAndUpdate({_id: id}, {
    HFName: req.body.HFName,
  }).then(user => res.json(user))
  .catch(err => res.json(err))
})

////////////// fetching with selection option /////////////

app.get('/Facility-info',(req, res) =>{
    
  HealthFacilityMondel.find()
  .then(users => res.json(users))
  .catch(err => console.log(err))  
  })
  ////////////// fetching Vram with selection option /////////////

app.get('/Fetch-VRAM',(req, res) =>{
    
  VRAMMondel.find()
  .then(users => res.json(users))
  .catch(err => console.log(err))  
  })
//////////////////////////////////////EVENT UPLOAD///////////////////
app.post("/Add-Facility" ,(req, res) => {
  const{HRegion,HSubCity,HWoreda,HFName} = req.body
  HealthFacilityMondel.findOne({HFName: HFName})
  .then(user => {
      if(user){
      alert("Already have an account")}
      else{
        HealthFacilityMondel.create({HRegion:HRegion,HSubCity:HSubCity,HWoreda:HWoreda,HFName:HFName})
          .then(result => res.json("Account created"))
          .catch(err => res.json("error"))
      }
  
}).catch(err => res.json(err))

})

///////////////fetchin Events////////////
app.get('/EventHeadline',(req, res) =>{
  EVENTSMondel.find()
  .then(users => res.json(users))
  .catch(err => console.log(err))  
  })


    ////////////// fetching with selection option /////////////

    app.get('/fetching-option',(req, res) =>{
    
        ResearchMondel.find()
        .then(users => res.json(users))
        .catch(err => console.log(err))  
        })


        ////////////////////////////fetchinf measeles for Admin dashbored////////////
        app.get("/getAllUserH", async (req, res) => {
          let query = {};
          const searchData = req.query.search;
          if (searchData) {
            query = {
              $or: [
                { pname: { $regex: searchData, $options: "i" } },
                { EPIWeek: { $regex: searchData, $options: "i" } },
              ],
            };
          }
        
          try {
            const allUser = await MeaselesMondel.find(query);
            res.send({ status: "ok", data: allUser });
          } catch (error) {
            console.log(error);
          }
        });
        ////////////////////////////fetchinf Prenatal for Admin dashbored////////////
        app.get("/getAllUsePr", async (req, res) => {
          let query = {};
          const searchData = req.query.search;
          if (searchData) {
            query = {
              $or: [
                { pname: { $regex: searchData, $options: "i" } },
                { EPIWeek: { $regex: searchData, $options: "i" } },
              ],
            };
          }
        
          try {
            const allUser = await PrenatalDeathMMondel.find(query);
            res.send({ status: "ok", data: allUser });
          } catch (error) {
            console.log(error);
          }
        });
        
        
        ////////////////////////////fetchinf login Users for Admin dashbored////////////
        app.get("/USERS", async (req, res) => {
          let query = {};
          const searchData = req.query.search;
          if (searchData) {
            query = {
              $or: [
                { Lname: { $regex: searchData, $options: "i" } },
                { email: { $regex: searchData, $options: "i" } },
              ],
            };
          }
        
          try {
            const allUser = await User_Login.find(query);
            res.send({ status: "ok", data: allUser });
          } catch (error) {
            console.log(error);
          }
        });
        ////////////////////////////fetchinf Number of reserch document for Admin dashbored////////////
    
        app.get("/Masters", async (req, res) => {
          let query = {};
          const searchData = req.query.search;
          if (searchData) {
            query = {
              $or: [
                { Department: { $regex: searchData, $options: "i" } },
                { NCollege: { $regex: searchData, $options: "i" } },
              ],
            };
          }
        
          try {
            const allUser = await ResearchMondel.find(query);
            res.send({ status: "ok", data: allUser });
          } catch (error) {
            console.log(error);
          }
        });
         ////////////////////////////fetchinf login Users for Admin dashbored////////////
         app.get("/DatatRequest", async (req, res) => {
          let query = {};
          const searchData = req.query.search;
          if (searchData) {
            query = {
              $or: [
                { Lname: { $regex: searchData, $options: "i" } },
                { email: { $regex: searchData, $options: "i" } },
              ],
            };
          }
        
          try {
            const allUser = await RequestMondel.find(query);
            res.send({ status: "ok", data: allUser });
          } catch (error) {
            console.log(error);
          }
        });

        //////////////////////////////////////// UseType ///////////////////////////////////

app.get("/Gete-User", async (req, res) => {
  try {
    const singleMeasel= User_Login.find().or([{userType:"User"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-Admin", async (req, res) => {
  try {
    const singleMeasel= User_Login.find().or([{userType:"Admin"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-HFPhem", async (req, res) => {
  try {
    const singleMeasel= User_Login.find().or([{userType:"HFPhem"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-RegionalPhem", async (req, res) => {
  try {
    const singleMeasel= User_Login.find().or([{userType:"RegionalPhem"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-Reserch", async (req, res) => {
  try {
    const singleMeasel= User_Login.find().or([{userType:"Reserch"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SubCityPhem", async (req, res) => {
  try {
    const singleMeasel= User_Login.find().or([{userType:"SubCityPhem"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-Student", async (req, res) => {
  try {
    const singleMeasel= User_Login.find().or([{userType:"Student"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-IRB", async (req, res) => {
  try {
    const singleMeasel= User_Login.find().or([{userType:"IRB"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
/////////////////////////////////////end of UserType///////////////////////////////

        
        ////////////// fetching repdesease with selection option /////////////

    app.get('/RepDesease',(req, res) =>{
    
      MeaselesMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })

       ////////////// fetching Cholera with selection option /////////////

    app.get('/CholeraDesease',(req, res) =>{
    
      CholerasMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })
      ////////////// fetching AEFI with selection option /////////////

    app.get('/AEFIDesease',(req, res) =>{
    
      AEFIMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })
      

      ////////////// fetching AEFI with selection option /////////////

    app.get('/FacilityList',(req, res) =>{
    
      AEFIMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })

       ////////////// fetching YellowFever with selection option /////////////

    app.get('/GetYellowFever',(req, res) =>{
    
      YellowFeverMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })

      ////////////// fetching  RelapsingFever with selection option /////////////

    app.get('/GetRelapsingFever',(req, res) =>{
    
      RelapsingFeverMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })

      ////////////// fetching  Rabies with selection option /////////////

    app.get('/GeteRabies',(req, res) =>{
    
      RabiesMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })

        ////////////// fetching maternal with selection option /////////////

    app.get('/GeteMaternal',(req, res) =>{
    
      MaternalDeathMMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })


     /* app.get("/GeteMaternal", async (req, res) => {
        const { id, token } = req.params;
        console.log(req.params);
        const oldUser = await MaternalDeathMMondel.findOne({ _id: id });
        try {
          const verify = jwt.verify(token, secret);
          res.render("index", { email: verify.email, status: "Not Verified" });
        } catch (error) {
          console.log(error);
          res.send("Not Verified");
        }
      });*/
       ////////////// fetching Malaria with selection option /////////////

    app.get('/GeteMalaria',(req, res) =>{
    
      MalariaMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })

       ////////////// fetching  PrenatalDeath with selection option /////////////

    app.get('/GetePrenatalDeath',(req, res) =>{
    
      PrenatalDeathMMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })


      ////////////// fetching Menengites with selection option /////////////

    app.get('/Meningits',(req, res) =>{
    
      MeningitsMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })
      ////////////// fetching Fistula with selection option /////////////FistulaMondel

    app.get('/GeteFistula',(req, res) =>{
    
      FistulaMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })

       ////////////// fetching Polio with selection option /////////////FistulaMondel

    app.get('/GetePolio',(req, res) =>{
    
      PolioMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })

       ////////////// fetching request list with selection option /////////////

    app.get('/get-requistlist',(req, res) =>{
    
      RequestMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })

      ///fetching file from reserch----------

app.get('/fetching-RepD', async(req, res) =>{
    
  //ResearchMondel.find()
  const allUser = await MeaselesMondel.find({});
const page = parseInt(req.query.page)
const limit = parseInt(req.query.limit)

const startIndex = (page - 1) * limit
const lastIndex = (page) * limit

const results = {}
results.totalUser=allUser.length;
results.pageCount=Math.ceil(allUser.length/limit);

if (lastIndex < allUser.length) {
  results.next = {
    page: page + 1,
  }
}
if (startIndex > 0) {
  results.prev = {
    page: page - 1,
  }
}
results.result = allUser.slice(startIndex, lastIndex);
res.json(results)
  //.then(user => res.json(user))
  //.catch(err => console.log(err))  
  ///passswpred---------invg pgzi yrbs qntc----
  })



        //////////////////image upload////////////////
        //importing schema
//require("./model/imageDetails");
//const Images = mongoose.model("ImageDetails");

app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});
//////////////////////////////////////////////////////////////
//const multer = require("multer");

// const Image = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./BanerImage");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     cb(null, uniqueSuffix + file.originalname);
//   },
// });

// require("./model/imageDetails");

// const ImagesMondel  = mongoose.model("ImageDetails" )
// const uploadImag = multer({ storage: Image });

// app.post("/upload-image", uploadImag.single("file"), async (req, res) => {
//   console.log(req.file);
//   const Title = req.body.Title;
//   const Description = req.body.Description;
//   const ImageDetailsfileName = req.file.filename;
//   try {
//     await ImagesMondel.create({Title:Title,Description:Description,pdf: ImageDetailsfileName});
//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });
/////////////////////////////////////////////////////////64 bit image////////////////
/*require("./model/Testimage");
const Images = mongoose.model("Testimage");
app.post("/upload-images", async (req, res) => {
  const { base64 } = req.body;
  try {
    await Images.create({ image: base64 });
    res.send({ Status: "ok" });
  } catch (error) {
    res.send({ Status: "error", data: error });
  }
});

app.get("/get-imaged", async (req, res) => {
  try {
    await Images.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});*/

///////////////////////////////////////////////////////////64 bit image end//////////////////

///////////////////////////////////image from back end folder//////////////////////////////

/*const ImageT = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../AARDMC/Client/src/images");
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now();
    cb(null,  Date.now()+"-" + file.originalname);
  },
});

 require("./model/Image.model");

 const ImagesTMondel  = mongoose.model("ImageTest" )
const uploadImagT = multer({ ImageT });

app.post("/upload-image", uploadImagT.single("file"), async (req, res) => {
  // const path = req.body.path;
  // const filename = req.body.filename;
try{
  // await ImagesTMondel.create({path:path,filename:filename});
  const {path,filename}=req.file
  const img = ImagesTMondel.create({path:path,filename:filename});
  await img.save()
  res.send({"msg":"image uploadede"})
}catch(eror){
  res.send({"mesg":"unable to uppload image"})
}
})*/


const Image = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./BanerImage");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/imageDetails");

const ImagesMondel  = mongoose.model("ImageDetails" )
const uploadImag = multer({ storage: Image });

app.post("/upload-image", uploadImag.single("file"), async (req, res) => {
  console.log(req.file);
  const Title = req.body.Title;
  const Description = req.body.Description;
  const fileName = req.file.filename;
  try {
    await ImagesMondel.create({Title:Title,Description:Description,pdf: fileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

//////////////////////////////////////end of back end folder///////////////////
/*const Image = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../Client/src/images");
  },
  filename: function (req, file, cb) {
    //const uniqueSuffix = Date.now();
    //cb(null, uniqueSuffix + file.originalname);
    cb(null, `${Date.now()}_${file.originalname}`)
  },
});

const uploadImag = multer({ storage: Image });

app.post("/upload-image", uploadImag.single("Image"), (req, res) => {
  //console.log(req.body);
 // const imageName = req.file.filename;
 ImagesMondel.create({file: req.file.filename})
 .then(result => res.json(result))
 .catch(err => console.log(err))
 // try {
   // await Images.create({ image: imageName });
   // res.json({ status: "ok" });
  //} catch (error) {
   // res.json({ status: error });
  //}
});*/
///////////////get image for insert image/////////
app.get("/get-image", async (req, res) => {
  try {
    ImagesMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});
///////////////get image for Photo slide/////////
app.get("/get-imageID", async (req, res) => {
  try {
    ImagesMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});
///////////////get User name for nav bar/////////
app.get('/get-UserName/:id', (req, res) => {
  const id = req.params.id
  User_Login.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})



////////////////////upload description///////////////////////

app.post("/IMG-Description" ,(req, res) => {
  const{Title,Description} = req.body
  ImagesDescriptionMondel.findOne({Title: Title})
  .then(user => {
      if(user){
      res.json("Already have an account")}
      else{
        ImagesDescriptionMondel.create({Title:Title,Description:Description})
          .then(result => res.json("Account created"))
          .catch(err => res.json("error"))
      }
  
}).catch(err => res.json(err))

})

    
    
///fetching file from reserch----------

app.get('/fetching-Rech', async(req, res) =>{
    
    //ResearchMondel.find()
    const allUser = await ResearchMondel.find({});
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)

  const startIndex = (page - 1) * limit
  const lastIndex = (page) * limit

  const results = {}
  results.totalUser=allUser.length;
  results.pageCount=Math.ceil(allUser.length/limit);

  if (lastIndex < allUser.length) {
    results.next = {
      page: page + 1,
    }
  }
  if (startIndex > 0) {
    results.prev = {
      page: page - 1,
    }
  }
  results.result = allUser.slice(startIndex, lastIndex);
  res.json(results)
    //.then(user => res.json(user))
    //.catch(err => console.log(err))  
    ///passswpred---------invg pgzi yrbs qntc----
    })
/////////////////////////////////e-mail///////////////////////
//app.use(cors());
//app.use(express.json({ limit: "25mb" }));
//app.use(express.urlencoded({ limit: "25mb" }));
/*app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

//var myemail = process.env.SENDER_EMAIL;
//var mypassword = process.env.APPLICATION_PASSWORD;

function sendEmail({Title,recipient_email,message}) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "alem845070@gmail.com",
        pass: "cegl xrue tvrr dgia",
      },
    });

    const mail_configs = {
      from: "alem845070@gmail.com",
      to: recipient_email,
      subject: Title,
      Text:message,
       
       };
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        return reject({ message: `An error has occured` });
      }
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}*/
//Signup and login
app.use("/email", emailRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
///////////////////////////multer attached file for email/////////////
const Emailstorage = multer.diskStorage({
  destination:function(req, file, cb){
      cb(null,('./image'));
  },
  Attachedfilename:function(req,file,cb){
      const name = Date.now()+'-'+file.originalname;
      cb(null,name);
  }
});

const attached = multer({storage: Emailstorage });
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_MAIL, // generated ethereal user
    pass: process.env.SMTP_PASSWORD, // generated ethereal password
  },
})
app.post("/Esend", attached.single("file"), async(req, res) =>{
  const { Title,email,messages} = req.body;
  //const fileName = req.file.filename;
  const file= req.file;
  console.log(Title,email, messages,file);

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: Title,
    text: messages,
    html: `<p>email:${email}</p><p>Subject:${Title}</p><p>messages: ${messages}</p>`,
    attachement: [
      {   // utf-8 string as an attachment
        filename: file,
        path: './image',
      },]
    
  };
  await transporter.sendMail(mailOptions)
}); 
    


///////////////////////////contact us  email/////////////
const Emailstorages = multer.diskStorage({
  destination:function(req, file, cb){
      cb(null,('./EmailDoc'));
  },
  filename:function(req,file,cb){
      const name = Date.now()+'-'+file.originalname;
      cb(null,name);
  }
});

const attacheds = multer({ Emailstorage:Emailstorages });
const transporters = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  // logger:true,
  // debug:true,
  // secureConnection:false,
  auth: {
    user: process.env.SMTP_MAIL, // generated ethereal user
    pass: process.env.SMTP_PASSWORD, // generated ethereal password
  },
})
app.post("/ContactUs", attacheds.single("documents"), async(req, res) =>{
  const { Title,email,messages,} = req.body;
  const file= req.file;
  console.log(Title,email, messages,file);

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to:  "alem845070@gmail.com",
    subject: Title,
    text: messages,
    html: `<p>email:${email}</p><p>Subject:${Title}</p><p>messages: ${messages}</p>`,
    attachement:  [
      {   
       filename: file,
       
      }
  ]
  };
  await transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }
    else{
        console.log('Mail sent successfully:- ', info.reponse);
    }
}); 
    
}); 


////////////////////////////email attached file//////////////////////
/*app.get("/", (req, res) => {
  sendEmail()
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});*/
/*app.post("/sendEmail", async (req, res) => {
  try {
    const { Title,recipient_email,message} = req.body
    sendEmail({Title,recipient_email,message})
    res.json({ msg: "Your message sent successfully" });
  } catch (error) {
    res.status(404).json({ msg: "Error ❌" });
  }
});
*/
app.get("/sendEmail", (req, res) => {
  const { Title,recipient_email,message} = req.body
  sendEmail({Title,recipient_email,message})
      .then((response) => res.send(response.message))
      .catch((error) => res.status(500).send(error.message));
  });

  
/*app.post("/send_recovery_email", (req, res) => {
  console.log("Somebody just hit me");
  sendEmail(req.body)
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});
*/

    

// REGISTER////////////////////////////////////////////////////////////////////////
//POST REGISTER
app.post('/register', async (req, res) => {
    try {
        const { name,Lname,email,  username, password ,roles} = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({ name,Lname, email, username,roles, password: hashedPassword })
        await newUser.save()
        res.status(201).json({ message: 'User created successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Error signing up' })
    }
})

//GET Registered Users
app.get('/register', async (req, res) => {
    try {
        const users = await User.find()
        res.status(201).json(users)
        
    } catch (error) {
        res.status(500).json({ error: 'Unable to get users' })
    }
})

//LOGIN

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials'})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1hr' })
        res.json({ message: 'Login successful' })
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' })
    }
})

//ReportAble Deses LOGIN///////////////////////////////////////////////
require("./model/LoginRepDModel");
  const LoginRepD = mongoose.model("RepDUsers");

app.post('/LoginRepD', async (req, res) => {
  try {
      const { username, password } = req.body
      const user = await LoginRepD .findOne({ username })
      if (!user) {
          return res.status(401).json({ error: 'Invalid credentials'})
      }
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if(!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid credentials' })
      }
      const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1hr' })
      res.json({ message: 'Login successful' })
  } catch (error) {
      res.status(500).json({ error: 'Error logging in' })
  }
})

/////////////////////////////////////////Reportable deases Sighen up/registration back end///////////
app.post("/SighenupRepD", async (req, res) => {
  const { name,Lname,email,username,password,roles } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await LoginRepD.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    await LoginRepD.create({
      name,
      Lname,
      email,
      username,
      password: encryptedPassword,
      roles,
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error" });
  }
}); 

///////////////////////////////////IRB Login back end/////////////////////////////////////////////

require("./model/LoginIRB");
  const LoginIRB = mongoose.model("IRBUsers");

app.post('/LoginIRB', async (req, res) => {
  try {
      const { username, password } = req.body
      const user = await LoginIRB .findOne({ username })
      if (!user) {
          return res.status(401).json({ error: 'Invalid credentials'})
      }
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if(!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid credentials' })
      }
      const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1hr' })
      res.json({ message: 'Login successful' })
  } catch (error) {
      res.status(500).json({ error: 'Error logging in' })
  }
})

/////////////////////////////////////////IRB Sighen up/registration back end///////////
app.post("/SighnupIRB", async (req, res) => {
  const { name,Lname,email,username,password,roles } = req.body;

  const encryptedPassword = await bcrypt.hash(password, 10);
  try {
    const oldUser = await LoginIRB.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    await LoginIRB.create({
      name,
      Lname,
      email,
      username,
      password: encryptedPassword,
      roles,
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error" });
  }
}); 


//multer------------------------------------------------------------
//const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/Register");

const RegisterMondel  = mongoose.model("register" )
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const orgname = req.body.orgname;
  const title = req.body.Latitude;
  const principal = req.body.principal;
  const phone = req.body.phone;
  const dsharing = req.body.dsharing;
  const availability = req.body.availability;
  const coverage = req.body.coverage;
  const BGDate = req.body.BGDate;
  const LDate = req.body.LDate;
  const gender = req.body.gender;
  const type = req.body.type;
  const raw = req.body.raw;
  const cleaned = req.body.cleaned;
  const url = req.body.url;
  const comments = req.body.comments;
  const email = req.body.email;
  const Title = req.body.Title;
  const registerfileName = req.file.filename;
  try {
    await RegisterMondel.create({orgname:orgname,title:title,principal:principal,phone:phone,dsharing:dsharing,availability:availability,raw:raw,coverage:coverage,BGDate:BGDate,LDate:LDate,gender:gender,type:type,cleaned:cleaned,url:url,comments:comments,email:email,Title:Title, pdf: registerfileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});
//multer------------------------------------------------------------
//const multer = require("multer");

const DataCollectionP = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Images");
  },
  registerfilename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/DataCollectionP");

const DataCollectionPMondel  = mongoose.model("DataCollectionP" )
const DataCollectionPupload = multer({ storage: DataCollectionP });

app.post("/DataCollectionP", DataCollectionPupload.single("file"), async (req, res) => {
  console.log(req.file);
  const Name = req.body.Name;
  const PhonePI = req.body.PhonePI;
  const email = req.body.email;
  const title = req.body.title;
  const NUniversity = req.body.NUniversity;
  const DataC = req.body.DataC;
  const StudyA1 = req.body.StudyA1;
  const NameContactP1 = req.body.NameContactP1;
  const CPhone1 = req.body.CPhone1;
  const AdditionalDC = req.body.AdditionalDC;
  const StudyA2 = req.body.StudyA2;
  const NameContactP2 = req.body.NameContactP2;
  const CPhone2 = req.body.CPhone2;
  const DStart = req.body.DStart;
  const DTermination = req.body.DTermination;
  
  try {
    await DataCollectionPMondel.create({Name:Name,PhonePI:PhonePI,email:email,title:title,NUniversity:NUniversity,DataC:DataC,StudyA1:StudyA1,NameContactP1:NameContactP1,CPhone1:CPhone1,AdditionalDC:AdditionalDC,StudyA2:StudyA2,NameContactP2:NameContactP2,CPhone2:CPhone2,DStart:DStart,DTermination:DTermination});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

/*app.get("/get-files", async (req, res) => {
  try {
    RegisterMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});*/

//multer------------------------------------------------------------
//const multer = require("multer");

const Request = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/RequestList");

const RequestMondel  = mongoose.model("Requests" )
const REQupload = multer({ storage: Request });

app.post("/file-Request", REQupload.single("file"), async (req, res) => {
  console.log(req.file);
  const Name = req.body.Name;
  const phone = req.body.phone;
  const emaill = req.body.emaill;
  const Title = req.body.Title;
  const Reaseon = req.body.Reaseon;
  const Affiliation = req.body.Affiliation;
  const email = req.body.email;
  const messages = req.body.messages;
  const isCheked = req.body.isCheked;
  
  try {
    await RequestMondel.create({Name:Name,phone:phone,emaill:emaill,Title:Title,Reaseon:Reaseon,Affiliation:Affiliation,email:email,messages:messages,isCheked:isCheked});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

/*app.get("/get-files", async (req, res) => {
  try {
    RegisterMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});*/

//multer-----------------------------------------------------------------------------------------------
/*const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null,'./Images')
    },
    filename: (req, file, cb) =>{
      // cb(null, `${Date.now()}_${file.originalname}`)
      cb(null, file.fieldname + "_" + Date.now()+ path.extname(file.originalname))
    }
})

const upload = multer({ storage:storage})

app.post("/upload" ,upload.single('file'), (req, res) => {
    //console.log(req.body)
   //console.log(req.file)
   // const fileName = req.file.filename;
    
   RegisterMondel.create({file: req.file.filename})
   .then(result => res.json(result))
   .catch(err => console.log(err))
    //try{
       // await RegisterMondel.create({file:fileName})
       // res.json({status: "ok"})
    //}catch(error){
       //res.json({status: error})

    //}
})*/
//get file--------------------------
app.get('/get-files',(req, res) =>{
    
    RegisterMondel.find()
    .then(users => res.json(users))
    .catch(err => console.log(err))
    })

///get file from reserch collection---------------
app.get('/get-Rechfiles',(req, res) =>{
    
    ResearchMondel.find()
    .then(users => res.json(users))
    .catch(err => console.log(err))
    })

     //multer------------------------------------------------------------
//const multer = require("multer");

const MeaslesM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/Measeles");

const MeaselesMondel = mongoose.model("Measeles" )
const MeaslesStor = multer({ storage: MeaslesM });

app.post("/MeaslesFile", MeaslesStor.single("file"), async (req, res) => {
  console.log(req.file);
  const startDate = req.body.startDate;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const CurrLocationJs = req.body.CurrLocationJs;
  const visible = req.body.visible;
  const Sex = req.body.Sex;
  const Age = req.body.Age;
  const HNumber = req.body.HNumber;
  const PWoreda = req.body.PWoreda;
  const pTWoreda = req.body.pTWoreda;
  const PSubCity = req.body.PSubCity;
  const PRegion = req.body.PRegion;
  const WRegion = req.body.WRegion;
  const BDate = req.body.BDate;
  const pname = req.body.pname;
  const visit = req.body.visit;
  const SName = req.body.SName;
  const Eschool = req.body.Eschool;
  const Hfacility = req.body.Hfacility;
  const visite = req.body.visite;
  const PType = req.body.PType;
  const Weight = req.body.Weight;
  const Hight = req.body.Hight;
  const BMI = req.body.BMI;
  const MUAC = req.body.MUAC;
  const PPhone = req.body.PPhone;
  const HRegion = req.body.HRegion;
  const HTRegion = req.body.HTRegion;
  const HSubCity = req.body.HSubCity;
  const THSubCity = req.body.THSubCity
  const HWoreda = req.body.HWoreda;
  const HFTworeda = req.body.HFTworeda;
  const HFName = req.body.HFName;
  const HFTName = req.body.HFTName;
  const NotifiedDate = req.body.NotifiedDate;
  const OnsetDate = req.body.OnsetDate;
  const Orash = req.body.Orash;
  const MNumber = req.body.MNumber;
  const Vdate = req.body.Vdate;
  const Aepidemics = req.body.Aepidemics;
  const visited = req.body.visited;
  const Treatment = req.body.Treatment;
  const TTreatment = req.body.TTreatment;
  const visiblee = req.body.visiblee;
  const SamColl = req.body.SamColl;
  const Dspeciemen = req.body.Dspeciemen;
  const DspeciemenS = req.body.DspeciemenS;
  const Tspecimen = req.body.Tspecimen;
  const TTspecimen = req.body.TTspecimen;
  const sample = req.body.sample;
  const TypeC = req.body.TypeC;
  const Labresults = req.body.Labresults;
  const SMeasles = req.body.SMeasles;
  const Nmeasles = req.body.Nmeasles;
  const TNmeasles = req.body.TNmeasles;
  const visibleIso = req.body.visibleIso;
  const Isolated = req.body.Isolated;
  const visibles = req.body.visibles;
  const vitaminA = req.body.vitaminA;
  const visiting = req.body.visiting;
  const Complication = req.body.Complication;
  const AdmitedHF = req.body.AdmitedHF;
  const Tcomplications = req.body.Tcomplications;
  const TTcomplications = req.body.TTcomplications;
  const Pfactors = req.body.Pfactors;
  const WPfactors = req.body.WPfactors;
  const DateSR = req.body.DateSR;
  const FCName = req.body.FCName;
  const Phone = req.body.Phone;
  const PNeonat = req.body.PNeonat;
  const Outcome = req.body.Outcome;
  const email = req.body.email;
  const EPIWeek = req.body.EPIWeek;
  const MeaselesfileName = req.file.filename;
  try {
    await MeaselesMondel.create({startDate:startDate,latitude:latitude,longitude:longitude,CurrLocationJs:CurrLocationJs,visible:visible,Sex:Sex,Age:Age,HNumber:HNumber,PWoreda:PWoreda,pTWoreda:pTWoreda,PSubCity:PSubCity,PRegion:PRegion,WRegion:WRegion,BDate:BDate,pname:pname,visit:visit,SName:SName,Eschool:Eschool,Hfacility:Hfacility,visite:visite,PType:PType,Weight:Weight,Hight:Hight,BMI:BMI,MUAC:MUAC,PPhone:PPhone,HRegion:HRegion,HTRegion:HTRegion,HSubCity:HSubCity,THSubCity:THSubCity,HWoreda:HWoreda,HFTworeda:HFTworeda,HFName:HFName,HFTName:HFTName,NotifiedDate:NotifiedDate,OnsetDate:OnsetDate,Orash:Orash,MNumber:MNumber,Vdate:Vdate,Aepidemics:Aepidemics,visited:visited,Treatment:Treatment,TTreatment:TTreatment,visiblee:visiblee,SamColl:SamColl,Dspeciemen:Dspeciemen,DspeciemenS:DspeciemenS,Tspecimen:Tspecimen,TTspecimen:TTspecimen,sample:sample,TypeC:TypeC,Labresults:Labresults,SMeasles:SMeasles,Nmeasles:Nmeasles,TNmeasles:TNmeasles,visibleIso:visibleIso,Isolated:Isolated,visibles:visibles,vitaminA:vitaminA,visiting:visiting,Complication:Complication,AdmitedHF:AdmitedHF,Tcomplications:Tcomplications,TTcomplications:TTcomplications,Pfactors:Pfactors,WPfactors:WPfactors,DateSR:DateSR,FCName:FCName,Phone:Phone,PNeonat:PNeonat,Outcome:Outcome,email:email,EPIWeek:EPIWeek, pdf:MeaselesfileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Measel", async (req, res) => {
  try {
    MeaselesMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SingleMeselesAkaki", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesArada", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesBole", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesGulele", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesKirkos", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeseleskolife", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesLemi_Kura", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesLideta", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesYeka", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesFemale", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Sex:"Female"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesMale", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Sex:"Male"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeselesHfacility", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or({Hfacility: {$lte: new Date(), $gte: new Date(new Date().getTime() - (24*60*60-1000))}}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SingleMeselesWeek1", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesaWeek2", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek3", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek4", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek5", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek6", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeselesWeek7", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek8", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek9", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek10", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek11", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-11"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek12", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find({EPIWeek:"Week-12"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek13", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find({EPIWeek:"Week-13" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeselesWeek14", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or({EPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeselesWeek15", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesaWeek16", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek17", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek18", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek19", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek20", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeselesWeek21", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek22", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek23", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek24", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek25", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek26", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find({EPIWeek:"Week-26"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek27", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find({EPIWeek:"Week-27" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeselesWeek28", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or({EPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeselesWeek29", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesaWeek30", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek31", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek32", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek33", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek34", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeselesWeek35", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek36", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek37", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek38", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek39", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek40", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find({EPIWeek:"Week-40"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek41", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find({EPIWeek:"Week-41" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeselesWeek42", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or({EPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeselesWeek43", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesaWeek44", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek45", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek46", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek47", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek48", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeselesWeek49", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek50", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek51", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesWeek52", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{EPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////
app.get("/Gete-SingleMeselesLessFive", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Age: {$lte: 5}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesBetweb5To14", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Age: {$gte: 5, $lte: 14}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesBetweb15To29", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Age: {$gte: 15, $lte: 29}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesBetweb30To49", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Age: {$gte: 30, $lte: 49}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeselesBetweb50To59", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Age: {$gte: 50, $lte: 59}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesBetweb60To69", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Age: {$gte: 60, $lte: 69}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesAbove70", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Age: {$gte: 70}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

/////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////TT Number of Vacination//////////////////
app.get("/Gete-SingleMeselesFirstDose", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{MNumber:'First Dose'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesSecondDose", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{MNumber: 'Second Dose'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeselesThirdDose", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{MNumber: 'Third Dose / Fist Dose + Second Dose'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesUnknown", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{MNumber: 'Unknown vaccination status'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeselesNotVaccinated", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{MNumber:'Not Vaccinated'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////end//////////////////////////////////

////////////////////////////////////////////////////////Measeles by patient type///////////////
app.get("/Gete-SingleMeaslesInpatient", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PType: 'Inpatient (I)'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesOutPatient", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PType:'outpatient(O)'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

////////////////////////////////////////////////////////end of patient type//////////////////
//////////////////////////////////////////////////////Patient by Region//////////////////////
app.get("/Gete-SingleMeaslesAddisAbaba", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion:"Addis Ababa"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion: 'Oromya'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesDireDawa", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion: 'Dire Dawa'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesAfar", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion: 'Afar Region'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesAmhara", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion: 'Amhara Region'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeaslesBenishangul", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion: 'Benishangul-Gumuz Region'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesGambela", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion: 'Gambela Region'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesHarari", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion: 'Harari Region'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesSidama", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion:'Sidama Region'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesSomali", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion: 'Somali Region'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeaslesSouth_Ethiopia", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion: 'South Ethiopia Regional State'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesSouth_West_Ethiopia", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion: 'South West Ethiopia Peoples'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesTigray", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{PRegion:'Tigray Region'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

////////////////////////////////////////////////////End of region//////////////////////////////////////
//////////////////////////////////////////////////////Lab Result//////////////////////////////////////
app.get("/Gete-SingleMeaslesPositive", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Labresults: 'Positive for measele'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeaslesP_rubella", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Labresults: 'positive for rubella'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslesNegative", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Labresults: 'Negative for both'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeaslespending", async (req, res) => {
  try {
    const singleMeasel= MeaselesMondel.find().or([{Labresults:'pending'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

////////////////////////////////////////////////////End of Lab result//////////////////////////////////////
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});


//multer------------------------------------------------------------
//const multer = require("multer");

const MalariaM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./MalariaStor");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/Malaria");

const MalariaMondel = mongoose.model("Malaria" )
const MalariaStor = multer({ storage: MalariaM });

app.post("/Malaria", MalariaStor.single("file"), async (req, res) => {
  console.log(req.file);
  const MMRN = req.body.MMRN;
  const MName = req.body.MName;
  const MAge = req.body.MAge;
  const MSex = req.body.MSex;
  const MPOccupation = req.body.MPOccupation;
  const TMPOccupation = req.body.TMPOccupation;
  const MMarital = req.body.MMarital;
  const MFsize = req.body.MFsize;
  const MIncome = req.body.MIncome;
  const MPRegion = req.body.MPRegion;
  const MTRegion = req.body.MTRegion;
  const MPSubCity = req.body.MPSubCity;
  const MPWoreda = req.body.MPWoreda;
  const MpTWoreda = req.body.MpTWoreda;
  const MResidency = req.body.MResidency;
  const MPhone = req.body.MPhone;
  const MFacilityT = req.body.MFacilityT;
  const MTFacilityT = req.body.MTFacilityT;
  const HFName = req.body.HFName;
  const HFTName = req.body.HFTName;
  const HRegion = req.body.HRegion;
  const HTRegion = req.body.HTRegion;
  const HSubCity = req.body.HSubCity;
  const THSubCity = req.body.THSubCity;
  const HWoreda = req.body.HWoreda;
  const HFTworeda = req.body.HFTworeda;
  const MDCollection = req.body.MDCollection;
  const latitude = req.body.MLatitude;
  const longitude = req.body.MLongitude;
  const MCfeatures = req.body.MCfeatures;
  const TMCfeatures = req.body.TMCfeatures;
 

  const MOnsetDate = req.body.MOnsetDate;
  const MDHospital = req.body.MDHospital;
  const MAdmitted = req.body.MAdmitted;
  const MSampleT = req.body.MSampleT;
  const MDSampleT = req.body.MDSampleT;
  const MType = req.body.MType;
  const MResult = req.body.MResult;
  const Mhistory = req.body.Mhistory;
  const TMhistory = req.body.TMhistory;
  const MProphylaxis = req.body.MProphylaxis;
  const MPinfection = req.body.MPinfection;
  const TMPinfection = req.body.TMPinfection;
  const MComorbidity = req.body.MComorbidity;
  const TMComorbidity = req.body.TMComorbidity;
  const MComplications = req.body.MComplications;
  const TMComplications = req.body.TMComplications;
  const Msuffering = req.body.Msuffering;
  const MBednets = req.body.MBednets;
  const TMBednets = req.body.TMBednets;
  const MRiskFactors = req.body.MRiskFactors;
  const TMRiskFactors = req.body.TMRiskFactors;
  const MPregnant = req.body.MPregnant;
  const MOutCome = req.body.MOutCome;
  const MOutbreak = req.body.MOutbreak;
  const MFCName = req.body.MFCName;
  const OMPhone = req.body.OMPhone;
  const EPIWeek= req.body.EPIWeek;
  const MalariafileName = req.file.filename;
  try {
    await MalariaMondel.create({MMRN:MMRN,MName:MName,MAge:MAge,MSex:MSex,MPOccupation:MPOccupation,TMPOccupation:TMPOccupation,MMarital:MMarital,MFsize:MFsize,MIncome:MIncome,MPRegion:MPRegion,MTRegion:MTRegion,MPSubCity:MPSubCity,MPWoreda:MPWoreda,MpTWoreda:MpTWoreda,MResidency:MResidency,MPhone:MPhone,MFacilityT:MFacilityT,MTFacilityT:MTFacilityT,HFName:HFName,HFTName:HFTName,HRegion:HRegion,HTRegion:HTRegion,HSubCity:HSubCity,THSubCity:THSubCity,HWoreda:HWoreda,HFTworeda:HFTworeda,MDCollection:MDCollection,latitude:latitude,longitude:longitude,MCfeatures:MCfeatures,TMCfeatures:TMCfeatures,MOnsetDate:MOnsetDate,MDHospital:MDHospital,MAdmitted:MAdmitted,MSampleT:MSampleT,MDSampleT:MDSampleT,MType:MType,MResult:MResult,Mhistory:Mhistory,TMhistory:TMhistory,MProphylaxis:MProphylaxis,MPinfection:MPinfection,TMPinfection:TMPinfection,MComorbidity:MComorbidity,TMComorbidity:TMComorbidity,MComplications:MComplications,TMComplications:TMComplications,Msuffering:Msuffering,MBednets:MBednets,TMBednets:TMBednets,MRiskFactors:MRiskFactors,TMRiskFactors:TMRiskFactors,MPregnant:MPregnant,MOutCome:MOutCome,MOutbreak:MOutbreak,MFCName:MFCName,OMPhone:OMPhone,EPIWeek:EPIWeek,pdf:MalariafileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Malaria", async (req, res) => {
  try {
    MalariaMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SingleMalariaAkaki", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaArada", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaBole", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaGulele", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaKirkos", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMalariakolife", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaLemi_Kura", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaLideta", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaYeka", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MPSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaFemale", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find({MSex:"Female"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaMale", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find({MSex:"Male" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SingleMalariaWeek1", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaaWeek2", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek3", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek4", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek5", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek6", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMalariaWeek7", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek8", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek9", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek10", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek11", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-11"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek12", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or({EPIWeek:"Week-12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek13", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or({EPIWeek:"Week-13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMalariaWeek14", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or({EPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMalariaWeek15", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaaWeek16", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek17", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek18", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek19", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek20", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMalariaWeek21", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek22", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek23", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek24", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek25", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek26", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or({EPIWeek:"Week-26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek27", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or({EPIWeek:"Week-27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMalariaWeek28", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or({EPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMalariaWeek29", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaaWeek30", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek31", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek32", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek33", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek34", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMalariaWeek35", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek36", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek37", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek38", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek39", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek40", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or({EPIWeek:"Week-40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek41", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or({EPIWeek:"Week-41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMalariaWeek42", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or({EPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMalariaWeek43", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaaWeek44", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek45", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek46", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek47", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek48", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMalariaWeek49", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek50", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek51", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWeek52", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{EPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////
//////////////////////////////////////////back end age///////////////////////////////////////////////
app.get("/Gete-SingleMalariaLessFive", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MAge: {$lte: 5}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaBetweb5To14", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MAge: {$gte: 5, $lte: 14}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaBetweb15To29", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MAge: {$gte: 15, $lte: 29}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaBetweb30To49", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MAge: {$gte: 30, $lte: 49}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMalariaBetweb50To59", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MAge: {$gte: 50, $lte: 59}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaBetweb60To69", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MAge: {$gte: 60, $lte: 69}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaAbove70", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MAge: {$gte: 70}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////income back end////////////////////////////////////////////////////
app.get("/Gete-SingleMalariaZero", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MIncome:{$gte:0,$lt:600}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaTen", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MIncome:{$gte:601,$lt:1650}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaFiften", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MIncome:{$gte:1651,$lt:3200}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaTewenten", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MIncome:{$gte:3201,$lt:5250}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaTewenteFive", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MIncome:{$gte:5251,$lt:7800}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaTherten", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MIncome:{$gte:7801,$lt:10900}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMalariaTherteFive", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MIncome:{$gte:10901}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////////end////////////////////////////
///////////////////////////////////////////Marital back end////////////////////////////////////////////////////
app.get("/Gete-SingleMalariaNotMarried", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MMarital:"Not married"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaMarried", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MMarital:"Married"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaDivorced", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MMarital:"Divorced"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaWidowed", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MMarital:"Widowed"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaUnderage", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MMarital:"NA (Underage Children)"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});


//////////////////////////////////////////////end////////////////////////////
/////////////////////////////////////////////////prophylaxis/////////////
app.get("/Gete-SingleMalariaNo", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MProphylaxis:"NO"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaYes", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find().or([{MProphylaxis:"Yes"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////
/////////////////////////////////////////////////case/////////////
app.get("/Gete-SingleMalariaoutbreak", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find({MOutbreak:"outbreak"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaroutine", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find({MOutbreak:"routine" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////case back end////////////////////////////////////////////////////
/////////////////////////////////////////////////Reporting Health Facility Type/////////////
app.get("/Gete-SingleMalariaHospital", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find({MFacilityT:"Hospital"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariaHealthCenter", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find({MFacilityT:"Health Center" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMalariaPrivateClinic", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find({MFacilityT:"Private Clinic"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMalariarOther", async (req, res) => {
  try {
    const singleMeasel= MalariaMondel.find({MFacilityT:"Other" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////Type back end////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

//multer------------------------------------------------------------
//const multer = require("multer");

const RelapsingFeverM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/RelapsingFever");

const RelapsingFeverMondel = mongoose.model("RelapsingFever" )
const RelapsingFeverStor = multer({ storage: RelapsingFeverM });

app.post("/RelapsingFever", RelapsingFeverStor.single("file"), async (req, res) => {
  console.log(req.file);
  const MRN = req.body.MRN;
  const Test = req.body.Test;
  const PRegion = req.body.PRegion;
  const TRegion = req.body.TRegion;
  const PSubCity = req.body.PSubCity;
  const PWoreda = req.body.PWoreda;
  const pTWoreda = req.body.pTWoreda;
  const Kebele = req.body.Kebele;
  const HNumber = req.body.HNumber;
  const HRegion = req.body.HRegion;
  const HTRegion = req.body.HTRegion;
  const HSubCity = req.body.HSubCity;
  const THSubCity = req.body.THSubCity;
  const HWoreda = req.body.HWoreda;
  const HFTworeda = req.body.HFTworeda;
  const HFName = req.body.HFName;
  const HFTName = req.body.HFTName;
  const PPatient = req.body.PPatient;
  const Sex = req.body.Sex;
  const Age = req.body.Age;
  const POccupation = req.body.POccupation;
  const TPOccupation = req.body.TPOccupation;
  const Phone = req.body.Phone;
  const OnsetDate = req.body.OnsetDate;
  const SeenHF = req.body.SeenHF;
  const Admission = req.body.Admission;
  const Discharge = req.body.Discharge;
  const LabBorrelia = req.body.LabBorrelia;
  const Outcome = req.body.Outcome;
  const RFCase = req.body.RFCase;
  const Delousing = req.body.Delousing;
  const Insecticide = req.body.Insecticide;
  const RiskFactors = req.body.RiskFactors;
  const TRiskFactors = req.body.TRiskFactors;
  const Feature = req.body.Feature;
  const TFeature = req.body.TFeature;
  const Transferred = req.body.Transferred;
  const TTransferred = req.body.TTransferred;
  const TransferredIn = req.body.TransferredIn;
  const TTransferredIn = req.body.TTransferredIn;
  const FCName = req.body.FCName;
  const CPhone = req.body.CPhone;
  const EPIWeek = req.body.EPIWeek;
 
  
  try {
    await RelapsingFeverMondel.create({MRN:MRN,Test:Test,PRegion:PRegion,TRegion:TRegion,PSubCity:PSubCity,PWoreda:PWoreda,pTWoreda:pTWoreda,Kebele:Kebele,HNumber:HNumber,HRegion:HRegion,HTRegion:HTRegion,HSubCity:HSubCity,THSubCity:THSubCity,HWoreda:HWoreda,HFTworeda:HFTworeda,HFName:HFName,HFTName:HFTName,PPatient:PPatient,Sex:Sex,Age:Age,POccupation:POccupation,TPOccupation:TPOccupation,Phone:Phone,OnsetDate:OnsetDate,SeenHF:SeenHF,Admission:Admission,Discharge:Discharge,LabBorrelia:LabBorrelia,Outcome:Outcome,RFCase:RFCase,Delousing:Delousing,Insecticide:Insecticide,RiskFactors:RiskFactors,TRiskFactors:TRiskFactors,Feature:Feature,TFeature:TFeature,Transferred:Transferred,TTransferred:TTransferred,TransferredIn:TransferredIn,TTransferredIn:TTransferredIn,FCName:FCName,CPhone:CPhone,EPIWeek:EPIWeek});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Measel", async (req, res) => {
  try {
    RelapsingFeverMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SingleRelapsingAkaki", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingArada", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingBole", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingGulele", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingKirkos", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRelapsingkolife", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingLemi_Kura", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingLideta", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingYeka", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{PSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingFemale", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find({Sex:"Female"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingMale", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find({Sex:"Male" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
////////////////////////////////////////////////////////relapsing  Major Possible Risk Factors //////////////////
app.get("/Gete-SingleRelapsingOvercrowding", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{RiskFactors:"Overcrowding"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingPoorPersonalHygiene", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{RiskFactors:"Poor personal hygiene"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingHomeless", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{RiskFactors:"Homeless | Street Child"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingMassSleeping", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{RiskFactors:"Mass sleeping"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingShelter", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{RiskFactors:"Shelter"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingOther", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find({TRiskFactors}) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////
app.get("/Gete-SingleRelapsingLessFive", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{Age: {$lte: 5}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingBetweb5To14", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{Age: {$gte: 5, $lte: 14}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingBetweb15To29", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{Age: {$gte: 15, $lte: 29}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingBetweb30To49", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{Age: {$gte: 30, $lte: 49}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRelapsingBetweb50To59", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{Age: {$gte: 50, $lte: 59}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingBetweb60To69", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{Age: {$gte: 60, $lte: 69}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingAbove70", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{Age: {$gte: 70}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

/////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////end of relapsing Major Possible Risk Factors////////////
///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SingleRelapsingWeek1", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingaWeek2", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek3", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek4", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek5", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek6", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRelapsingWeek7", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek8", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek9", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek10", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek11", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:Week-11}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek12", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or({EPIWeek:"Week-12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek13", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or({EPIWeek:"Week-13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRelapsingWeek14", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or({EPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRelapsingWeek15", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek16", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek17", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek18", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek19", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek20", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRelapsingWeek21", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek22", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek23", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek24", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek25", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek26", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or({EPIWeek:"Week-26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek27", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or({EPIWeek:"Week-27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRelapsingWeek28", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or({EPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRelapsingWeek29", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek30", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek31", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek32", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek33", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek34", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRelapsingWeek35", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek36", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek37", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek38", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek39", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek40", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or({EPIWeek:"Week-40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek41", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or({EPIWeek:"Week-41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRelapsingWeek42", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or({EPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRelapsingWeek43", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek44", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek45", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek46", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek47", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek48", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRelapsingWeek49", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek50", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek51", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRelapsingWeek52", async (req, res) => {
  try {
    const singleMeasel= RelapsingFeverMondel.find().or([{EPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

//multer------------------------------------------------------------
//const multer = require("multer");

const AEFIM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./files");
  },
  RelapsingFeverfilename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/AEFI");

const AEFIMondel = mongoose.model("AEFI" )
const AEFIStor = multer({ storage: AEFIM });

app.post("/AEFI", AEFIStor.single("file"), async (req, res) => {
  console.log(req.file);
  const DReporting = req.body.DReporting;
  const PHFName = req.body.PHFName;
  const PHFTName = req.body.PHFTName;
  const Campaign = req.body.Campaign;
  const RImmunization = req.body.RImmunization;
  const ReportingID = req.body.ReportingID;
  const PRegion = req.body.PRegion;
  const TRegion = req.body.TRegion;
  const Zone = req.body.Zone;
  const PWoreda = req.body.PWoreda;
  const pTWoreda = req.body.pTWoreda;
  const Kebele = req.body.Kebele;
  const Age = req.body.Age;
  const Sex = req.body.Sex;
  const Pregnant = req.body.Pregnant;
  const Lactating = req.body.Lactating;
  const Phone = req.body.Phone;
  const FacilityT = req.body.FacilityT;
  const TFacilityT = req.body.TFacilityT;
  
  
  const HFName = req.body.HFName;
  const HFTName = req.body.HFTName;
 
  const SpecifyF = req.body.SpecifyF;
  const HRegion = req.body.HRegion;
  const HTRegion = req.body.HTRegion;
  const HSubCity = req.body.HSubCity;
  const THSubCity = req.body.THSubCity;
  const HWoreda = req.body.HWoreda;
  const HFTworeda = req.body.HFTworeda;
  const Vaccine = req.body.Vaccine;
  const NManufacture = req.body.NManufacture;
  const Dose = req.body.Dose;
  const BVaccine = req.body.BVaccine;
  const DBatch = req.body.DBatch;
  const RAdministration = req.body.RAdministration;
  const DExpiry = req.body.DExpiry;
  const COVaccine = req.body.COVaccine;
  const PVaccination = req.body.PVaccination;
  const DVaccination = req.body.DVaccination;
  const Donset = req.body.Donset;
  const DNotification = req.body.DNotification;
  const VDReporting = req.body.VDReporting;
  const Serious = req.body.Serious;
  const TextAReason = req.body.TextAReason;
  const Outcome = req.body.Outcome;
  const Investigation = req.body.Investigation;
  const RRegion = req.body.RRegion;
  const RTRegion = req.body.RTRegion;
  const RHSubCity = req.body.RHSubCity;
  const RTHSubCity = req.body.RTHSubCity;
  const RHWoreda = req.body.RHWoreda;
  const RHFTworeda = req.body.RHFTworeda;
  const RKebele = req.body.RKebele;
  const DNational = req.body.DNational;
  const NReporter = req.body.NReporter;
  const Profession = req.body.Profession;
  const OfficerPhone = req.body.OfficerPhone;
  const EPIWeek = req.body.EPIWeek;
  
  try {
    await AEFIMondel.create({DReporting:DReporting,PHFName:PHFName,PHFTName:PHFTName,Campaign:Campaign,RImmunization:RImmunization,ReportingID:ReportingID,PRegion:PRegion,TRegion:TRegion,Zone:Zone,PWoreda:PWoreda,pTWoreda:pTWoreda,Kebele:Kebele,Age:Age,Sex:Sex,Pregnant:Pregnant,Lactating:Lactating,Phone:Phone,FacilityT:FacilityT,TFacilityT:TFacilityT,HFName:HFName,HFTName:HFTName,SpecifyF:SpecifyF,HRegion:HRegion,HTRegion:HTRegion,HSubCity:HSubCity,THSubCity:THSubCity,HWoreda:HWoreda,HFTworeda:HFTworeda,Vaccine:Vaccine,NManufacture:NManufacture,Dose:Dose,BVaccine:BVaccine,DBatch:DBatch,RAdministration:RAdministration,DExpiry:DExpiry,COVaccine:COVaccine,PVaccination:PVaccination,DVaccination:DVaccination,Donset:Donset,DNotification:DNotification,VDReporting:VDReporting,Serious:Serious,TextAReason:TextAReason,Outcome:Outcome,Investigation:Investigation,RRegion:RRegion,RTRegion:RTRegion,RHSubCity:RHSubCity,RTHSubCity:RTHSubCity,RHWoreda:RHWoreda,RHFTworeda:RHFTworeda,RKebele:RKebele,DNational:DNational,NReporter:NReporter,Profession:Profession,OfficerPhone:OfficerPhone,EPIWeek:EPIWeek});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Measel", async (req, res) => {
  try {
    AEFIMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SingleAEFIAkaki", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIArada", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIBole", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIGulele", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIKirkos", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleAEFIkolife", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFINifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFILemi_Kura", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFILideta", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIYeka", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{HSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
/////////////////////////////////////////////////////////AEFI Gender.///////////////////
app.get("/Gete-SingleAEFIFemale", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find({PChistory:"Female"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIMale", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find({PChistory:"Male" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SingleAEFIWeek1", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIaWeek2", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek3", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek4", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek5", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek6", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleAEFIWeek7", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek8", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek9", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek10", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek11", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-11"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek12", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or({EPIWeek:"Week-12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek13", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or({EPIWeek:"Week-13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleAEFIWeek14", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or({EPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleAEFIWeek15", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIaWeek16", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek17", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek18", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek19", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek20", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleAEFIWeek21", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek22", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek23", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek24", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek25", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek26", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or({EPIWeek:"Week-26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek27", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or({EPIWeek:"Week-27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleAEFIWeek28", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or({EPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleAEFIWeek29", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIaWeek30", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek31", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek32", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek33", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek34", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleAEFIWeek35", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek36", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek37", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek38", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek39", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek40", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or({EPIWeek:"Week-40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek41", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or({EPIWeek:"Week-41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleAEFIWeek42", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or({EPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleAEFIWeek43", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIaWeek44", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek45", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek46", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek47", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek48", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleAEFIWeek49", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek50", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek51", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleAEFIWeek52", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{EPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////
////////////////////////////////////////////////Place of Vaccination/////////////////////
app.get("/Gete-SingleHealthFacility", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{PVaccination:"Health facility"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePharmacies", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{PVaccination:"Pharmacies"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleSchool", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{PVaccination:"School"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCommunityCenter", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{PVaccination:"Community Center"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMobileClinics", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{PVaccination:"Mobile clinics"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleHome", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{PVaccination:"Home"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleOther", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{PVaccination:"Other"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////

////////////////////////////////////////////////Place of Vaccination/////////////////////
app.get("/Gete-SingleRecovered", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{Outcome:"Recovered"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRecoveredwithSequelae", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{Outcome:"Recovered with sequelae"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRecovering", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{Outcome:"Recovering"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleFatal", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{Outcome:"Fatal"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleDied", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{Outcome:"Died"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleUnknown", async (req, res) => {
  try {
    const singleMeasel= AEFIMondel.find().or([{Outcome:"Unknown"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});


//multer------------------------------------------------------------
//const multer = require("multer");

const PrenatalDeathM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/PrenatalDeath");

const PrenatalDeathMMondel = mongoose.model("PrenatalDeath" )
const PrenatalDeathMStor = multer({ storage: PrenatalDeathM });

app.post("/PrenatalDeath", PrenatalDeathMStor.single("file"), async (req, res) => {
  console.log(req.file);
  const ID = req.body.ID;
  const Age = req.body.Age;
  const Residence = req.body.PRegion;
  const PRegion = req.body.visible;
  const TRegion = req.body.TRegion;
  const PSubCity = req.body.PSubCity;
  const Zone = req.body.Zone;
  const PWoreda = req.body.PWoreda;
  const pTWoreda = req.body.pTWoreda;
  const Kebele = req.body.Kebele;
  const BDate = req.body.BDate;
  const DN = req.body.DN;
  const Time = req.body.Time;

  const PrinataDDate = req.body.PrinataDDate;
  const PDN = req.body.PDN;
  const TDTime = req.body.TDTime;
  const Sex = req.body.Sex;
  const gestationalAge = req.body.gestationalAge;
  const Pdeath = req.body.Pdeath;
  const Malive = req.body.Malive;
  const MAge = req.body.MAge;
  const TParity = req.body.TParity;
  const AliveChildren = req.body.AliveChildren;
  const Religion = req.body.Religion;
  const TReligion = req.body.TReligion;
  const Educational = req.body.Educational;
  const POccupation = req.body.POccupation;
  const TPOccupation = req.body.TPOccupation;
  const FacilityT = req.body.FacilityT;
  const TFacilityT = req.body.TFacilityT;
  const FacilityN = req.body.FacilityN;
  const HFTName = req.body.HFTName;
  const SpecifyF = req.body.SpecifyF;

  const HRegion = req.body.HRegion;
  const HTRegion = req.body.HTRegion;
  const HSubCity = req.body.HSubCity;
  const HWoreda = req.body.HWoreda;
  const HFTworeda = req.body.HFTworeda;
  const DReporting = req.body.DReporting;
  const PDRF = req.body.PDRF;
  const OnsetDate = req.body.OnsetDate;
  const Orash = req.body.Orash;
  const ANC = req.body.ANC;
  const TTVaccine = req.body.TTVaccine;
  const Mode = req.body.Mode;
  const Status = req.body.Status;
  const TAliveAPGAR = req.body.TAliveAPGAR;
  const BabyBorn = req.body.BabyBorn;
  const Maternal = req.body.Maternal;
  const Neonatal = req.body.Neonatal;
  const TNeonatal = req.body.TNeonatal;
  const CMaternal = req.body.CMaternal;
  const TCMaternal = req.body.TCMaternal;
  const TimingD = req.body.TimingD;
  const preventable = req.body.preventable;
  const Ccause = req.body.Ccause;
  const Delay1 = req.body.Delay1;
  const Delay2 = req.body.Delay2;
  const Delay3 = req.body.Delay3;
  const Supplies = req.body.Supplies;
  const FCName = req.body.FCName;
  const Phone = req.body.Phone;
  const EPIWeek = req.body.EPIWeek;
  const PrenatalDeathfileName = req.file.filename;
  try {
    await PrenatalDeathMMondel.create({ID:ID,Age:Age,Residence:Residence,PRegion:PRegion,TRegion:TRegion,PSubCity:PSubCity,Zone:Zone,PWoreda:PWoreda,pTWoreda:pTWoreda,Kebele:Kebele,BDate:BDate,DN:DN,Time:Time,PrinataDDate:PrinataDDate,PDN:PDN,TDTime:TDTime,Sex:Sex,gestationalAge:gestationalAge,Pdeath:Pdeath,Malive:Malive,MAge:MAge,TParity:TParity,AliveChildren:AliveChildren,Religion:Religion,TReligion:TReligion,Educational:Educational,POccupation:POccupation,TPOccupation:TPOccupation,FacilityT:FacilityT,TFacilityT:TFacilityT,FacilityN:FacilityN,HFTName:HFTName,SpecifyF:SpecifyF,HRegion:HRegion,HTRegion:HTRegion,HSubCity:HSubCity,HWoreda:HWoreda,HFTworeda:HFTworeda,DReporting:DReporting,PDRF:PDRF,OnsetDate:OnsetDate,Orash:Orash,ANC:ANC,TTVaccine:TTVaccine,Mode:Mode,Status:Status,TAliveAPGAR:TAliveAPGAR,BabyBorn:BabyBorn,Maternal:Maternal,Neonatal:Neonatal,TNeonatal:TNeonatal,CMaternal:CMaternal,TCMaternal:TCMaternal,TimingD:TimingD,preventable:preventable,Ccause:Ccause,Delay1:Delay1,Delay2:Delay2,Delay3:Delay3,Supplies:Supplies,FCName:FCName,Phone:Phone,EPIWeek:EPIWeek, pdf:PrenatalDeathfileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Prenatal", async (req, res) => {
  try {
    PrenatalDeathMMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SinglePrenatalDeathAkaki", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathArada", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathBole", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathGulele", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathKirkos", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePrenatalDeathkolife", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathLemi_Kura", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathLideta", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathYeka", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{PSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathFemale", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find({Sex:"Female"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathMale", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find({Sex:"Male" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
/////////////////////////////////////////////////////////////////Status////////////////
app.get("/Gete-SinglePrenatalDeathAlive", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find({Status:"Alive (live birth)"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathDead", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find({Status:"Dead (Still birth)" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
////////////////////////////////////////////////////facility////////////////////////////////////
/////////////////////////////////////////////////////////////////preventable////////////////
app.get("/Gete-SinglePrenatalDeathYes", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find({preventable:"Yes"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathNo", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find({preventable:"No" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePrenatalDeathUnknown", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find({preventable:"Unknown" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
////////////////////////////////////////////////////facility////////////////////////////////////
app.get("/Gete-SinglePrenatalDeathHealthCenter", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{FacilityT:"Health center"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathclinic", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find({FacilityT:"Privat clinic or hospital"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathHospital", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find({FacilityT:"Hospital" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SinglePrenatalDeathWeek1", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathaWeek2", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek3", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek4", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek5", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek6", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePrenatalDeathWeek7", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek8", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek9", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek10", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek11", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-11"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek12", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or({EPIWeek:"Week-12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek13", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or({EPIWeek:"Week-13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePrenatalDeathWeek14", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or({EPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePrenatalDeathWeek15", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathaWeek16", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek17", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek18", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek19", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek20", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePrenatalDeathWeek21", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek22", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek23", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek24", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek25", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek26", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or({EPIWeek:"Week-26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek27", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or({EPIWeek:"Week-27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePrenatalDeathWeek28", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or({EPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePrenatalDeathWeek29", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathaWeek30", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek31", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek32", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek33", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek34", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePrenatalDeathWeek35", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek36", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek37", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek38", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek39", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek40", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or({EPIWeek:"Week-40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek41", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or({EPIWeek:"Week-41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePrenatalDeathWeek42", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or({EPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePrenatalDeathWeek43", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathaWeek44", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek45", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek46", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek47", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek48", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePrenatalDeathWeek49", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek50", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek51", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathWeek52", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{EPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////

///////////////////////////////////////////////neonatal cause of death//////////////////////////////
app.get("/Gete-SinglePrenatalDeathAsphyxia", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Neonatal:"Asphyxia"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathComplications", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Neonatal:"Complications"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathcongenitalAnomaly", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Neonatal:"Lethal congenital anomaly"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePrenatalDeathNeonatalTetanus", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Neonatal:"Neonatal Tetanus"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathSPM", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Neonatal:"Sepsis/pneumonia /meningitis"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathNeonatalOther", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{TNeonatal:{TNeonatal}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});


//////////////////////////////////////////back end Death///////////////////////////////////////////////
////////////////////////////////////Delay Facility////////////////////////////////
app.get("/Gete-SingleprenataldeathDelay1", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find( { $or: [ { Delay1: "Family poverty"  }, { Delay1: "Did not recognize the danger signs of newborn infants" },{ Delay1: "Unaware of the warning signs of problems during pregnancy" } ,{ Delay1: "Did not know wher to go" } ,{ Delay1: "Had no one to take care of other children" },{ Delay1: "Reliant to traditional practice / medicine" },{ Delay1: "Lack of decision to go to the health facilityl" }  ] } ) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleprenataldeathDelay2", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find( { $or: [ { Delay2: "Transport was not available"  }, { Delay2: "Transport was too expensive" },{ Delay2: "No facility within reasonable distance" } ,{ Delay2: "lack of road access" } ,{ Delay2: "Other" }  ] } ) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleprenataldeathDelay3", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find( { $or: [ { Delay3: "Delayed arrival to the next health facility from another facility on referral"  }, { Delay3: "Delayed management after admission" },{ Delay3: "Human error or miss management" } ,{ Delay3: "Delayed or lacking supplies and equipment"  }  ] } ) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////delay end///////////////////////////////////////////////////
////////////////////////////////////Mode of delivery////////////////////////////////
app.get("/Gete-SinglePrenatalDeathSVD", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Mode:"SVD"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathvaginal", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Mode:"Operative vaginal delivery"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathVacuum", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Mode:"Vacuum"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathForceps", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Mode:"Forceps"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathCS", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Mode:"C/S"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePrenatalDeathNotKnown", async (req, res) => {
  try {
    const singleMeasel= PrenatalDeathMMondel.find().or([{Mode:"Not Known or Still Birth"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////Mode of delivery end///////////////////////////////////////////////////

//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});


//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});
//multer------------------------------------------------------------
//const multer = require("multer");

const FistulaM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/Fistula");

const FistulaMondel = mongoose.model("Fistula" )
const FistulaStor = multer({ storage: FistulaM });

app.post("/Fistula", FistulaStor.single("file"), async (req, res) => {
  console.log(req.file);
  const ID = req.body.ID;
  const OnsetDate = req.body.OnsetDate;
  const Age = req.body.Age;
  const Residence = req.body.Residence;
  const PRegion = req.body.PRegion;
  const TRegion = req.body.TRegion;
  const PSubCity = req.body.PSubCity;
  const PWoreda = req.body.PWoreda;
  const pTWoreda = req.body.pTWoreda;
  const Kebele = req.body.Kebele;
  const PMarital = req.body.PMarital;
  const Religion = req.body.Religion;
  const TReligion = req.body.TReligion;
  const Educational = req.body.Educational;
  const HFName = req.body.HFName;
  const HFTName = req.body.HFTName;
  const FacilityT = req.body.FacilityT;
  const TFacilityT = req.body.TFacilityT;
  const HWoreda = req.body.HWoreda;
  const HFTworeda = req.body.HFTworeda;
  const HSubCity = req.body.HSubCity;
  const THSubCity = req.body.THSubCity;
  const HRegion = req.body.HRegion;
  const HTRegion = req.body.HTRegion;
  const DReporting = req.body.DReporting;
  const Gravidity = req.body.Gravidity;
  const TParity = req.body.TParity;
  const NLivingC = req.body.NLivingC;
  const BabyBorn = req.body.BabyBorn;
  const Mode = req.body.Mode;
  const TypeF = req.body.TypeF;
  const Outcome = req.body.Outcome;
  const TimingOF = req.body.TimingOF;
  const ANC = req.body.ANC;
  const ANCK = req.body.ANCK;
  const WANC = req.body.WANC;
  const TWANC = req.body.TWANC;
  const TANC = req.body.TANC;
  const Cause = req.body.Cause;
  const Delay1 = req.body.Delay1;
  const Delay2 = req.body.Delay2;
  const Delay3 = req.body.Delay3;
  const Supplies = req.body.Supplies;
  const FCName = req.body.FCName;
  const Phone = req.body.Phone;
  const EPIWeek = req.body.EPIWeek;
  const FistulafileName = req.file.filename;
 
  
  
  try {
    await FistulaMondel.create({ID:ID,OnsetDate:OnsetDate,Age:Age,Residence:Residence,PRegion:PRegion,TRegion:TRegion,PSubCity:PSubCity,PWoreda:PWoreda,pTWoreda:pTWoreda,Kebele:Kebele,PMarital:PMarital,Religion:Religion,TReligion:TReligion,Educational:Educational,HFName:HFName,HFTName:HFTName,FacilityT:FacilityT,TFacilityT:TFacilityT,HWoreda:HWoreda,HFTworeda:HFTworeda,HSubCity:HSubCity,THSubCity:THSubCity,HRegion:HRegion,HTRegion:HTRegion,DReporting:DReporting,Gravidity:Gravidity,TParity:TParity,NLivingC:NLivingC,BabyBorn:BabyBorn,Mode:Mode,TypeF:TypeF,Outcome:Outcome,TimingOF:TimingOF,ANC:ANC,ANCK:ANCK,WANC:WANC,TWANC:TWANC,TANC:TANC,Cause:Cause,Delay1:Delay1,Delay2:Delay2,Delay3:Delay3,Supplies:Supplies,FCName:FCName,Phone:Phone,EPIWeek:EPIWeek, pdf:FistulafileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Fistula", async (req, res) => {
  try {
    FistulaMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SingleFistulaAkaki", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaArada", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaBole", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaGulele", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaKirkos", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleFistulakolife", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaLemi_Kura", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaLideta", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaYeka", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaFemale", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find({PChistory:"Female"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaMale", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find({PChistory:"Male" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SingleFistulaWeek1", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaaWeek2", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek3", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek4", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek5", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek6", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleFistulaWeek7", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek8", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek9", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek10", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek11", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-11"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek12", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or({EPIWeek:"Week-12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek13", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or({EPIWeek:"Week-13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleFistulaWeek14", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or({EPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleFistulaWeek15", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaaWeek16", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek17", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek18", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek19", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek20", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleFistulaWeek21", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek22", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek23", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek24", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek25", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek26", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or({EPIWeek:"Week-26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek27", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or({EPIWeek:"Week-27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleFistulaWeek28", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or({EPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleFistulaWeek29", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaaWeek30", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek31", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek32", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek33", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek34", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleFistulaWeek35", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek36", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek37", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek38", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek39", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek40", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or({EPIWeek:"Week-40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek41", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or({EPIWeek:"Week-41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleFistulaWeek42", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or({EPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleFistulaWeek43", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaaWeek44", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek45", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek46", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek47", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek48", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleFistulaWeek49", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek50", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek51", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWeek52", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{EPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////

///////////////////////////////////////////Marital back end////////////////////////////////////////////////////
app.get("/Gete-SingleFistulaNotMarried", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PMarital:"Single"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaMarried", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PMarital:"Married"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaDivorced", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PMarital:"Divorced"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaWidowed", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PMarital:"Wodowed"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaUnderage", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{PMarital:"Underage"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});


//////////////////////////////////////////////end////////////////////////////

///////////////////////////////////////////Educational status back end////////////////////////////////////////////////////
app.get("/Gete-SingleFistulaNoFormalEducation", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{Educational:"No Formal education"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaReadandwrite", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{Educational:"No formal education but can read and write"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaElementary", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{Educational:"Elementary school"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaHighSchool", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{Educational:"High school"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaCollege", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{Educational:"College and above"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaHigherEDucation", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find().or([{Educational:"Higher level (above grade 12)"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
////////////////////////////////////Delay Facility////////////////////////////////
app.get("/Gete-SingleFistulaDelay1", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find( { $or: [ { Delay1: "Traditional Practices"  }, { Delay1: "Lack of decision to go to health facility" },{ Delay1: "Family poverty" } ,{ Delay1: "Delayed referral from home" } ,{ Delay1: "Failure of recognition of the problem" }  ] } ) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaDelay2", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find( { $or: [ { Delay2: "Delayed arrival to referred health facility"  }, { Delay2: "Lack of transportation" },{ Delay2: "Lack of roads" } ,{ Delay2: "No facility within reasonable distance"}]}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleFistulaDelay3", async (req, res) => {
  try {
    const singleMeasel= FistulaMondel.find( { $or: [ { Delay3: "Delayed arrival to the next health facility from another facility on referral"}, { Delay3: "delayed management after admission" },{ Delay3: "Human error or miss management" } ,{ Delay3: "Delayed or lacking supplies and equipment"}]}) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////

//////////////////////////////////////////////end////////////////////////////

//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});
///////////////////////////////////////backend Rabis//////////////////////////////////////////////////////
//multer------------------------------------------------------------
//const multer = require("multer");

const RabiesM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./Rabies");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/Rabies");

const RabiesMondel = mongoose.model("Rabies" )
const RabiesStor = multer({ storage: RabiesM });

app.post("/Rabies", RabiesStor.single("file"), async (req, res) => {
  console.log(req.file);
  const RpName = req.body.RpName;
  const RPMRN = req.body.RPMRN;
  const RPAge = req.body.RPAge;
  const RPSex = req.body.RPSex;
  const RPPhone = req.body.RPPhone;
  const RPMarital = req.body.RPMarital;
  const RPOccupation = req.body.RPOccupation;
  const TRPOccupation = req.body.PWoreda;
  const RPRegion = req.body.RPRegion;
  const TRRegion = req.body.TRRegion;
  const RPSubCity = req.body.RPSubCity;
  const RPWoreda = req.body.RPWoreda;
  const RpTWoreda = req.body.RpTWoreda;
  const RPKebele = req.body.RPKebele;
  const RPZone = req.body.RPZone;
  const HRegion = req.body.RHRegion;
  const RHTRegion = req.body.RHTRegion;
  const HSubCity = req.body.RHSubCity;
  const TRHSubCity = req.body.TRHSubCity;
  const HWoreda = req.body.RHWoreda;
  const RHFTworeda = req.body.RHFTworeda;
  const HFName = req.body.RHFName;
  const RHFTName = req.body.RHFTName;
  const latitude = req.body.RLatitude;
  const longitude = req.body.RLongitude;
  const RExposureD = req.body.RExposureD;
  const RFacility = req.body.RFacility;
  const RSite = req.body.RSite;
  const RStatus = req.body.RStatus;
  const RwoundM = req.body.RwoundM;
  const RwoundMD = req.body.RwoundMD;
  const RPEPV = req.body.RPEPV;
  const TRPEPV = req.body.TRPEPV;
  const RNVaccination = req.body.RNVaccination;
  const TRNVaccination = req.body.TRNVaccination;
  const RTypes = req.body.RTypes;
  const TRTypes = req.body.TRTypes;
  const ROwner = req.body.ROwner;
  const RAnimals = req.body.RAnimals;
  const RAfollowup = req.body.RAfollowup;
  const TRAfollowup = req.body.TRAfollowup;
  const RTypeE = req.body.RTypeE;
  const RReason = req.body.RReason;
  const Rdevelop = req.body.Rdevelop;
  const TRdevelop = req.body.TRdevelop;
  const ROutcome = req.body.ROutcome;
  const RFCName = req.body.RFCName;
  const RPhone = req.body.RPhone;
  const REPIWeek = req.body.REPIWeek;
  const RabiesfileName = req.file.filename;
 
  
  
  try {
    await RabiesMondel.create({RpName:RpName,RPMRN:RPMRN,RPAge:RPAge,RPSex:RPSex,RPPhone:RPPhone,RPMarital:RPMarital,RPOccupation:RPOccupation,TRPOccupation:TRPOccupation,RPRegion:RPRegion,TRRegion:TRRegion,RPSubCity:RPSubCity,RPWoreda:RPWoreda,RpTWoreda:RpTWoreda,RPKebele:RPKebele,RPZone:RPZone,HRegion:HRegion,RHTRegion:RHTRegion,HSubCity:HSubCity,TRHSubCity:TRHSubCity,HWoreda:HWoreda,RHFTworeda:RHFTworeda,HFName:HFName,RHFTName:RHFTName,latitude:latitude,longitude:longitude,RExposureD:RExposureD,RFacility:RFacility,RSite:RSite,RStatus:RStatus,RwoundM:RwoundM,RwoundMD:RwoundMD,RPEPV:RPEPV,TRPEPV:TRPEPV,RNVaccination:RNVaccination,TRNVaccination:TRNVaccination,RTypes:RTypes,TRTypes:TRTypes,ROwner:ROwner,RAnimals:RAnimals,RAfollowup:RAfollowup,TRAfollowup:TRAfollowup,RTypeE:RTypeE,RReason:RReason,Rdevelop:Rdevelop,TRdevelop:TRdevelop,ROutcome:ROutcome,RFCName:RFCName,RPhone:RPhone,REPIWeek:REPIWeek, pdf:RabiesfileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Rabies", async (req, res) => {
  try {
    RabiesMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SingleRabiesAkaki", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesArada", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesBole", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesGulele", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesKirkos", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRabieskolife", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesLemi_Kura", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesLideta", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesYeka", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/Gete-SingleRabiesFemale", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find({RPSex:"Female"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesMale", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find({RPSex:"Male" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SingleRabiesWeek1", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesaWeek2", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek3", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek4", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek5", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek6", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRabiesWeek7", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek8", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek9", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek10", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek11", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-11"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek12", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or({REPIWeek:"Week-12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek13", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or({REPIWeek:"Week-13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRabiesWeek14", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or({REPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRabiesWeek15", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesaWeek16", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek17", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek18", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek19", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek20", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRabiesWeek21", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek22", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek23", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek24", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek25", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek26", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or({REPIWeek:"Week-26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek27", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or({REPIWeek:"Week-27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRabiesWeek28", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or({REPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRabiesWeek29", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesaWeek30", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek31", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek32", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek33", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek34", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRabiesWeek35", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek36", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek37", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek38", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek39", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek40", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or({REPIWeek:"Week-40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek41", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or({REPIWeek:"Week-41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRabiesWeek42", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or({REPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRabiesWeek43", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesaWeek44", async (req, res) => {
  try {REPIWeek
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek45", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek46", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek47", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek48", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRabiesWeek49", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek50", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek51", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesWeek52", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{REPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////
/////////////////////////////////////////////////////Occupation/////////////////////////////////
app.get("/Gete-SingleRabiesEmployed", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPOccupation:"Employed"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesNotEmployed", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPOccupation:"Not employed"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesStudent", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPOccupation:"Student"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRabiesDailyLaborer", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPOccupation:"Daily Laborer"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesHouseWife", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPOccupation:"House wife"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesOther", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPOccupation:"Other"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
////////////////////////////////////////////////////Age Group//////////////////////////////////////////////
//////////////////////////////////////////back end age///////////////////////////////////////////////
app.get("/Gete-SingleRabiesLessFive", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPAge: {$lte: 5}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesBetweb5To14", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPAge: {$gte: 5, $lte: 14}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesBetweb15To29", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPAge: {$gte: 15, $lte: 29}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesBetweb30To49", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPAge: {$gte: 30, $lte: 49}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleRabiesBetweb50To59", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPAge: {$gte: 50, $lte: 59}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesBetweb60To69", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPAge: {$gte: 60, $lte: 69}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesAbove70", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPAge: {$gte: 70}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////// PEP Vaccination/////////////
app.get("/Gete-SingleRabiesNo", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find().or([{RPEPV:"No"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesYes", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find({RPEPV:"Yes" }).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////
///////////////////////////////////////////////// Type of Exposure/////////////
app.get("/Gete-SingleRabiesLick", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find({RTypeE:"Lick"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesScratch", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find({RTypeE:"Scratch" }).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRabiesBite", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find({RTypeE:"Bite" }).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////Exposure back end////////////////////////////////////////////////////
/////////////////////////////////////////////////  Did exposing Dog / Animals vaccinate/////////////
app.get("/Gete-SingleRabiesVaccinateYes", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find({RAnimals:"Yes"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleRabiesVaccinateNo", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find({RAnimals:"No" }).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleRabiesVaccinateUnknown", async (req, res) => {
  try {
    const singleMeasel= RabiesMondel.find({RAnimals:"Unknown" }).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////Animals vaccinate back end////////////////////////////////////////////////////
app.get("/Gete-Rabies", async (req, res) => {
  try {
    RabiesMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
///////////////////////////////////////////back end////////////////////////////////////////////////////
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});



/////////////////////////////////////////////////////////end/////////////////////////////////////////////

//multer------------------------------------------------------------
//const multer = require("multer");

const YellowFeverM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/YellowFever");

const YellowFeverMondel = mongoose.model("YellowFever" )
const YellowFeverMStor = multer({ storage: YellowFeverM });

app.post("/YellowFever", YellowFeverMStor.single("file"), async (req, res) => {
  console.log(req.file);
  const YMRN = req.body.YMRN;
  const YPatient = req.body.YPatient;
  const YName = req.body.YName;
  const YPRegion = req.body.YPRegion;
  const YTRegion = req.body.YTRegion;
  const YPSubCity = req.body.YPSubCity;
  const YPWoreda = req.body.YPWoreda;
  const YpTWoreda = req.body.YpTWoreda;
  const YHouse = req.body.YHouse;
  const YKebele = req.body.YKebele;
  const YAge = req.body.YAge;
  const YSex = req.body.YSex;
  const YPPhone = req.body.YPPhone;
  const HFName = req.body.HFName;
  const YHFTName = req.body.YHFTName;
  const YSpecifyF = req.body.YSpecifyF;
  const YHRegion = req.body.YHRegion;
  const YHTRegion = req.body.YHTRegion;
  const YHSubCity = req.body.YHSubCity;
  const YTHSubCity = req.body.YTHSubCity;
  const YHWoreda = req.body.YHWoreda;
  const YHFTworeda = req.body.YHFTworeda;
  const YDReceived = req.body.YDReceived;
  const YCondition = req.body.YCondition;
  
  const YDSeen = req.body.YDSeen;
  const YDOnset = req.body.YDOnset;
  const Ysymptoms = req.body.Ysymptoms;
  const YSpecimen = req.body.YSpecimen;
  const YTSpecimen = req.body.YTSpecimen;
  const YResult = req.body.YResult;
  const YOutcome = req.body.YOutcome;
  const YComments = req.body.YComments;
  const YFCName = req.body.YFCName;
  const EPIWeek = req.body.EPIWeek;
  const YellowFeverfileName = req.file.filename;
  try {
    await YellowFeverMondel.create({YMRN:YMRN,YPatient:YPatient,YName:YName,YPRegion:YPRegion,YTRegion:YTRegion,YPSubCity:YPSubCity,YPWoreda:YPWoreda,YpTWoreda:YpTWoreda,YHouse:YHouse,YKebele:YKebele,YAge:YAge,YSex:YSex,YPPhone:YPPhone,HFName:HFName,YHFTName:YHFTName,YSpecifyF:YSpecifyF,YHRegion:YHRegion,YHTRegion:YHTRegion,YHSubCity:YHSubCity,YTHSubCity:YTHSubCity,YHWoreda:YHWoreda,YHFTworeda:YHFTworeda,YDReceived:YDReceived,YCondition:YCondition,YDSeen:YDSeen,YDOnset:YDOnset,Ysymptoms:Ysymptoms,YSpecimen:YSpecimen,YTSpecimen:YTSpecimen,YResult:YResult,YOutcome:YOutcome,YComments:YComments,YFCName:YFCName,EPIWeek:EPIWeek, pdf:YellowFeverfileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Measel", async (req, res) => {
  try {
    YellowFeverMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SingleYellowFeverAkaki", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeveraAddisKetema", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverArada", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverBole", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverGulele", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverKirkos", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleYellowFeverkolife", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverLemi_Kura", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverLideta", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverYeka", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YPSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverFemale", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find({YSex:"Female"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverMale", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find({YSex:"Male" }).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SingleYellowFeverWeek1", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek2", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek3", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek4", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek5", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek6", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleYellowFeverWeek7", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek8", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek9", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek10", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek11", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-11"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek12", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or({EPIWeek:"Week-12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek13", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or({EPIWeek:"Week-13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleYellowFeverWeek14", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or({EPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleYellowFeverWeek15", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeveraWeek16", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek17", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek18", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek19", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek20", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleYellowFeverWeek21", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek22", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek23", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek24", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek25", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek26", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or({EPIWeek:"Week-26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek27", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or({EPIWeek:"Week-27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleYellowFeverWeek28", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or({EPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleYellowFeverWeek29", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeveraWeek30", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek31", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek32", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek33", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek34", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleYellowFeverWeek35", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek36", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek37", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek38", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek39", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek40", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or({EPIWeek:"Week-40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek41", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or({EPIWeek:"Week-41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleYellowFeverWeek42", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or({EPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleYellowFeverWeek43", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeveraWeek44", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek45", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek46", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek47", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek48", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleYellowFeverWeek49", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek50", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek51", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverWeek52", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{EPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////
app.get("/Gete-SingleYellowFeverLessFive", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YAge: {$lte: 5}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverBetweb5To14", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YAge: {$gte: 5, $lte: 14}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverBetweb15To29", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YAge: {$gte: 15, $lte: 29}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverBetweb30To49", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YAge: {$gte: 30, $lte: 49}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleYellowFeverBetweb50To59", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YAge: {$gte: 50, $lte: 59}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverBetweb60To69", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YAge: {$gte: 60, $lte: 69}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverAbove70", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YAge: {$gte: 70}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

/////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Age Group//////////////////////////////////////////
//////////////////////////////////////////back end age///////////////////////////////////////////////
app.get("/Gete-SingleYellowFeverAlive", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YOutcome:"Alive"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverDead", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YOutcome:"Dead"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverOnFollowUp", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YOutcome:"On follow-up"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleYellowFeverReferred", async (req, res) => {
  try {
    const singleMeasel= YellowFeverMondel.find().or([{YOutcome:"Referred"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
////////////////////////////////////////////Age End///////////////////////////////////////////
//////////////////////////////////////////back end age///////////////////////////////////////////////
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});
//multer------------------------------------------------------------
//const multer = require("multer");

const MaternalDeathM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./files");
  },
 filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/MaternalDeath");

const MaternalDeathMMondel = mongoose.model("MaternalDeath" )
const MaternalDeathMStor = multer({ storage: MaternalDeathM });

app.post("/MaternalDeath", MaternalDeathMStor.single("file"), async (req, res) => {
  console.log(req.file);
  const ID = req.body.ID;
  const Time = req.body.Time;
  const PrinataDDate = req.body.PrinataDDate;
  const Age = req.body.Age;
  const Residence = req.body.PRegion;
  const PRegion = req.body.visible;
  const TRegion = req.body.TRegion;
  const PSubCity = req.body.PSubCity;
  const Zone = req.body.Zone;
  const PWoreda = req.body.PWoreda;
  const pTWoreda = req.body.pTWoreda;
  const Kebele = req.body.Kebele;
  const Pdeath = req.body.Pdeath;
  const PMarital = req.body.PMarital;
  const Religion = req.body.Religion;
  const TReligion = req.body.TReligion;
  const Ethnicity = req.body.Ethnicity;
  const TEthnicity = req.body.TEthnicity;
  const Educational = req.body.Educational;
  const TParity = req.body.TParity;
  const Gravidity = req.body.Gravidity;
  const TDTime = req.body.TDTime;
  const PostPartum = req.body.PostPartum;
  const FacilityT = req.body.FacilityT;
  const TFacilityT = req.body.TFacilityT;
  const HFName = req.body.HFName;
  const HFTName = req.body.HFTName;
  const SpecifyF = req.body.SpecifyF;
  const HRegion = req.body.HRegion;
  const HTRegion = req.body.HTRegion;
  const HSubCity = req.body.HSubCity;
  const THSubCity = req.body.THSubCity;
  const HWoreda = req.body.HWoreda;
  const HFTworeda = req.body.HFTworeda;
  const DReporting = req.body.DReporting;
  const PDRF = req.body.PDRF;
  const OnsetDate = req.body.OnsetDate;
  const ANC = req.body.ANC;
  const NWANC = req.body.NWANC;
  const WANC = req.body.WANC;
  const GAANC = req.body.GAANC;
  const Mode = req.body.Mode;
  const BabyBorn = req.body.BabyBorn;
  const DBabyBorn = req.body.DBabyBorn;
  const Assisted = req.body.Assisted;
  const PNC = req.body.PNC;
  const TPNC = req.body.TPNC;
  const DirectCauseD = req.body.DirectCauseD;
  const TDirectCauseD = req.body.TDirectCauseD;
  const IndirectCauseD = req.body.IndirectCauseD;
  const TIndirectCauseD = req.body.TIndirectCauseD;
  const Outcome = req.body.Outcome;
  const Status = req.body.Status;
  const TAliveAPGAR = req.body.TAliveAPGAR;
  const preventable = req.body.preventable;
  const Ccause = req.body.Ccause;
  const Delay1 = req.body.Delay1;
  const Delay2 = req.body.Delay2;
  const Delay3 = req.body.Delay3;
  const Supplies = req.body.Supplies;
  const FCName = req.body.FCName;
  const Phone = req.body.Phone;
  const EPIWeek = req.body.EPIWeek;
  const MaternalDeathfileName = req.file.filename;
  try {
    await MaternalDeathMMondel.create({ID:ID,Time:Time,PrinataDDate:PrinataDDate,Age:Age,Residence:Residence,PRegion:PRegion,TRegion:TRegion,PSubCity:PSubCity,Zone:Zone,PWoreda:PWoreda,pTWoreda:pTWoreda,Kebele:Kebele,Pdeath:Pdeath,PMarital:PMarital,Religion:Religion,TReligion:TReligion,Ethnicity:Ethnicity,TEthnicity:TEthnicity,Educational:Educational,TParity:TParity,Gravidity:Gravidity,TDTime:TDTime,PostPartum:PostPartum,FacilityT:FacilityT,TFacilityT:TFacilityT,HFName:HFName,HFTName:HFTName,SpecifyF:SpecifyF,HRegion:HRegion,HTRegion:HTRegion,HSubCity:HSubCity,THSubCity:THSubCity,HWoreda:HWoreda,HFTworeda:HFTworeda,DReporting:DReporting,PDRF:PDRF,OnsetDate:OnsetDate,ANC:ANC,NWANC:NWANC,WANC:WANC,GAANC:GAANC,Mode:Mode,BabyBorn:BabyBorn,DBabyBorn:DBabyBorn,Assisted:Assisted,PNC:PNC,TPNC:TPNC,DirectCauseD:DirectCauseD,TDirectCauseD:TDirectCauseD,IndirectCauseD:IndirectCauseD,TIndirectCauseD:TIndirectCauseD,Outcome:Outcome,Status:Status,TAliveAPGAR:TAliveAPGAR,preventable:preventable,Ccause:Ccause,Delay1:Delay1,Delay2:Delay2,Delay3:Delay3,Supplies:Supplies,FCName:FCName,Phone:Phone,EPIWeek:EPIWeek, pdf:MaternalDeathfileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Maternal", async (req, res) => {
  try {
    MaternalDeathMMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SingleMaternalDeathAkaki", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathArada", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathBole", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathGulele", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathKirkos", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMaternalDeathkolife", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathLemi_Kura", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathLideta", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathYeka", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathFemale", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find({PChistory:"Female"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathMale", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find({PChistory:"Male" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

///////////////////////////////////////////St_PeterGeneralHospital back end////////////////////////////////////////////////////
app.get("/Gete-SingleMaternalDeathSt_PeterGeneralHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"St. Peter General Hospital"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathaAlertGeneralHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"Alert General  Hospital"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathGandhiMemorialHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"Gandhi Memorial Hospital"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathSt_PauloHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"St. Paulo  Comprehensive Specialized Hospital"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathTikurAnbessaHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"Tikur Anbessa Comprehensive Specialized Hospital"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathTiruneshBejingHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"Tirunesh Bejing General Hospital"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMaternalDeathYekaKotebeHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"Yeka Kotebe General Hospital"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathZewdituHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"Zewditu Memorial General Hospital"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathAbebechGobenaHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"Abebech Gobena MCH Hospital"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathBetsegaMCCenter", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"Betsega Mother and Child Center"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathChurchillHC", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{HFName:"Churchill Health Center"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathDagmawiMinilikHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find({HFName:"Dagmawi Minilik Comprehensive Specialized Hospital"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathKadiscoHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find({HFName:"Kadisco General Hospital" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
////////////////////////////////////Reporting Facility////////////////////////////////
app.get("/Gete-SingleMaternalDeathHealthpost", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find({FacilityT:"Health post"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathHealthCenter", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find({FacilityT:"Health center" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMaternalDeathHospital", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find({FacilityT:"Hospital"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathPrivatclinic", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find({FacilityT:"Privat clinic or hospital" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////end///////////////////////////////////
////////////////////////////////////Preventability Facility////////////////////////////////
app.get("/Gete-SingleMaternalDeathNO", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find({preventable:"Yes"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathYes", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find({preventable:"No" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////end///////////////////////////////////
////////////////////////////////////Delay Facility////////////////////////////////
app.get("/Gete-SingleMaternalDeathDelay1", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find( { $or: [ { Delay1: "Traditional Practices"  }, { Delay1: "Lack of decision to go to health facility" },{ Delay1: "Family poverty" } ,{ Delay1: "Delayed referral from home" } ,{ Delay1: "Failure of recognition of the problem" }  ] } ) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathDelay2", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find( { $or: [ { Delay2: "Delayed arrival to referred health facility"  }, { Delay2: "Lack of transportation" },{ Delay2: "Lack of roads" } ,{ Delay2: "No facility within reasonable distance"}]}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathDelay3", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find( { $or: [ { Delay3: "Delayed arrival to the next health facility from another facility on referral"}, { Delay3: "delayed management after admission" },{ Delay3: "Human error or miss management" } ,{ Delay3: "Delayed or lacking supplies and equipment"}]}) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SingleMaternalDeathWeek1", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathaWeek2", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek3", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek4", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek5", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek6", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMaternalDeathWeek7", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek8", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek9", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek10", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek11", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:11}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek12", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or({EPIWeek:"12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek13", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or({EPIWeek:"13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMaternalDeathWeek14", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or({EPIWeek:"14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMaternalDeathWeek15", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathaWeek16", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek17", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek18", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek19", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek20", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMaternalDeathWeek21", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek22", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek23", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek24", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek25", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek26", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or({EPIWeek:"26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek27", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or({EPIWeek:"27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMaternalDeathWeek28", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or({EPIWeek:"28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMaternalDeathWeek29", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathaWeek30", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek31", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek32", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek33", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek34", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMaternalDeathWeek35", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek36", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek37", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek38", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek39", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek40", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or({EPIWeek:"40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek41", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or({EPIWeek:"41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMaternalDeathWeek42", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or({EPIWeek:"42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMaternalDeathWeek43", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathaWeek44", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek45", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek46", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek47", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek48", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMaternalDeathWeek49", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek50", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek51", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathWeek52", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{EPIWeek:"52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////

////////////////////////////////////////// ANC ///////////////////////////////////
app.get("/Gete-SingleMaternalDeathANCYes", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{ANC:"Yes"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathANCNo", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{ANC:"No"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathANCNotKnown", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{ANC:"Not Known"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end ANC///////////////////////////////////////////////
////////////////////////////////////////// PNC ///////////////////////////////////
app.get("/Gete-SingleMaternalDeathPNCYes", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PNC:"Yes"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathPNCNo", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PNC:"No"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
}); 

app.get("/Gete-SingleMaternalDeathPNCNotKnown", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PNC:"Not Known"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathPNCNotApplicable", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PNC:"Not Applicable"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end PNC///////////////////////////////////////////////

////////////////////////////////////////// PNC ///////////////////////////////////
app.get("/Gete-SingleMaternalDeathHemorrhage", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{DirectCauseD:"Hemorrhage"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathObstructedLabor", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{DirectCauseD:"Obstructed labor"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
}); 

app.get("/Gete-SingleMaternalDeathHDP", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{DirectCauseD:"HDP"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathAbortion", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{PDirectCauseDC:"Abortion"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
}); 

app.get("/Gete-SingleMaternalDeathSepsis", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{DirectCauseD:"Sepsis"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMaternalDeathOther", async (req, res) => {
  try {
    const singleMeasel= MaternalDeathMMondel.find().or([{TDirectCauseD:{ $type:"string"}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end PNC///////////////////////////////////////////////
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

//multer------------------------------------------------------------
//const multer = require("multer");

const CholerasM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./CholeraFile");
  },
  Cholerasfilename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/Choleras");

const CholerasMondel = mongoose.model("Choleras" )
const CholerasStor = multer({ storage: CholerasM });

app.post("/CholeraFile", CholerasStor.single("file"), async (req, res) => {
  console.log(req.file);
  const startDate = req.body.startDate;
  const pname = req.body.pname;
  const MRN = req.body.MRN;
  const Age = req.body.Age;
  const Sex = req.body.Sex;
  const Pregnancy = req.body.Pregnancy;
  const PPhone = req.body.PPhone;
  const PRegion = req.body.PRegion;
  const TRegion = req.body.TRegion;
  const PSubCity = req.body.PSubCity;
  const PWoreda = req.body.PWoreda;
  const SpecificA = req.body.SpecificA;
  const pTWoreda = req.body.pTWoreda;
  const Ketena = req.body.Ketena;
  const HNumber = req.body.HNumber;
  const POccupation = req.body.POccupation;
  const TPOccupation = req.body.TPOccupation;
  const AddPatientInfo = req.body.AddPatientInfo;
  const HRegion = req.body.HRegion;
  const HTRegion = req.body.HTRegion;
  const HSubCity = req.body.HSubCity;
  const THSubCity = req.body.THSubCity;
  const HWoreda = req.body.HWoreda;
  const HFTworeda = req.body.HFTworeda;
  const HFName = req.body.HFName;
  const HFTName = req.body.HFTName;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const DSHfacility = req.body.DSHfacility;
  const ODisease = req.body.ODisease;
  const PClinical = req.body.PClinical;
  const TPClinical = req.body.TPClinical;
  const Dehydration = req.body.Dehydration;
  const TDehydration = req.body.TDehydration;
  const Sample = req.body.Sample;
  const DSample = req.body.DSample;
  const DTSample = req.body.DTSample;

  const Ttest = req.body.Ttest;
  const RDTTtest = req.body.RDTTtest;
  const RTTtest = req.body.RTTtest;
  

  const Ccategory = req.body.Ccategory;
  const PHstatus = req.body.PHstatus;
  const TPHstatus = req.body.TPHstatus;
  const Travel = req.body.Travel;
  const TTravel = req.body.TTravel;
  const TTTravel = req.body.TTTravel;
  const Priskarea = req.body.Priskarea;
  const TPriskarea = req.body.TPriskarea;
  const PChistory = req.body.PChistory;
  const TPChistory = req.body.TPChistory;
  const TTPChistory = req.body.TTPChistory;
  const PCOhistory = req.body.PCOhistory;
  const Foodexposure = req.body.Foodexposure;
  const TFoodexposure = req.body.TFoodexposure;
  const WaterS = req.body.WaterS;
  const TWaterS = req.body.TWaterS;
  const PModeA = req.body.PModeA;
  const Referral = req.body.Referral;
  
  const Treatment = req.body.Treatment;
  const ACTC = req.body.ACTC;
  const TACTC = req.body.TACTC;
  const Adate = req.body.Adate;
  const Ddate = req.body.Ddate;
  const Outcome = req.body.Outcome;
  const TOutcome = req.body.TOutcome;
  const Rdate = req.body.Rdate;
  const CoMorbidity = req.body.CoMorbidity;
  const TCoMorbidity = req.body.TCoMorbidity;
  const TTCoMorbidity = req.body.TTCoMorbidity;
 
  const STTCoMorbidity = req.body.STTCoMorbidity;
  const LComplication = req.body.LComplication;
  const Complication = req.body.Complication;
 
  const Nutrition = req.body.Nutrition;
  const MUAC = req.body.MUAC;
  const Disinfection = req.body.Disinfection;
  const Vaccination = req.body.Vaccination;
  const DCName = req.body.DCName;
  const Phone = req.body.Phone;

  const Holywater = req.body.Holywater;
  const THolywater = req.body.THolywater;
  const FContainers = req.body.FContainers;
  const TFContainers = req.body.TFContainers;
  const LastFiveDaysF = req.body.LastFiveDaysF;
  const Cooking = req.body.Cooking;
  const LeftoverFood = req.body.LeftoverFood;
  const TLeftoverFood = req.body.TLeftoverFood;
  const OThome = req.body.OThome;
  const TOThome = req.body.TOThome;
  const ActualLocation = req.body.ActualLocation;
  const RawFood = req.body.RawFood;
  const TRawFood = req.body.TRawFood;
  const TRawFoodwater = req.body.TRawFoodwater;
  const TTRawFoodwater = req.body.TTRawFoodwater;
  const WaterConsumed = req.body.WaterConsumed;
  const TWaterConsumed = req.body.TWaterConsumed;
  const TTWaterConsumed = req.body.TTWaterConsumed;
  const WaterTreat = req.body.WaterTreat;
  const DContainers = req.body.DContainers;
  const TDContainers = req.body.TDContainers;

  const WStaying = req.body.WStaying;
  const Income = req.body.Income;
  const Religion = req.body.Religion;
  const TReligion = req.body.TReligion;
  const Educational = req.body.Educational;
  const FamilyS = req.body.FamilyS;
  const UnderF = req.body.UnderF;
  const Information = req.body.Information;
  const TInformation = req.body.TInformation;
  const TTInformation = req.body.TTInformation;
  const CoMorbidFM = req.body.CoMorbidFM;
  const TsetCoMorbidFM = req.body.TsetCoMorbidFM;
  const SimilarC = req.body.SimilarC;
  const TreatmentF = req.body.TreatmentF;
  const Latrine = req.body.Latrine;
  const TLatrine = req.body.TLatrine;
  const LatrineU = req.body.LatrineU;
  const Lenvironment = req.body.Lenvironment;
  const Odefecation = req.body.Odefecation;
  const WasteDisposal = req.body.WasteDisposal;
  const Flies = req.body.Flies;
  const Hygienic = req.body.Hygienic;
  const HandWashing = req.body.HandWashing;
  const Observations = req.body.Observations;
  const Recommendations = req.body.Recommendations;
  const AddContactInfo = req.body.AddContactInfo;


  const ppname = req.body.ppname;
  const Cname = req.body.Cname;
  const CSex = req.body.CSex;
  const CAge = req.body.CAge;
  const LContactDate = req.body.LContactDate;
  const EnrolmentDate = req.body.EnrolmentDate;
  const selected = req.body.selected;
  const CRegion = req.body.CRegion;
  const TCRegion = req.body.TCRegion;
  const CSubCity = req.body.CSubCity;
  const District = req.body.District;
  const CKebele = req.body.CKebele;
  const CHNumber = req.body.CHNumber;
  const CPhone = req.body.CPhone;
  const CLatitude = req.body.CLatitude;
  const CLongitude = req.body.CLongitude;
  const COccupation = req.body.COccupation;
  const TCOccupation = req.body.TCOccupation;
  const Pwork = req.body.Pwork;
  const Tcontact = req.body.Tcontact;
  const Syptomatic = req.body.Syptomatic;
  const ExpectedDate = req.body.ExpectedDate;
  const COutcome = req.body.COutcome;
  const AgeCategory = req.body.AgeCategory;
  const EpiWeek = req.body.EpiWeek;
  const TracerTeam = req.body.TracerTeam;
  const CRemark = req.body.CRemark;
  const CholerasfileName = req.file.Cholerasfilename;
  try {
    await CholerasMondel.create({startDate:startDate,pname:pname,MRN:MRN,Age:Age,Sex:Sex,Pregnancy:Pregnancy,PPhone:PPhone,PRegion:PRegion,TRegion:TRegion,PSubCity:PSubCity,PWoreda:PWoreda,SpecificA:SpecificA,pTWoreda:pTWoreda,Ketena:Ketena,HNumber:HNumber,POccupation:POccupation,TPOccupation:TPOccupation,AddPatientInfo:AddPatientInfo,HRegion:HRegion,HTRegion:HTRegion,HSubCity:HSubCity,THSubCity:THSubCity,HWoreda:HWoreda,HFTworeda:HFTworeda,HFName:HFName,HFTName:HFTName,latitude:latitude,longitude:longitude,DSHfacility:DSHfacility,ODisease:ODisease,PClinical:PClinical,TPClinical:TPClinical,Dehydration:Dehydration,TDehydration:TDehydration,Sample:Sample,DSample:DSample,DTSample:DTSample,Ttest:Ttest,RDTTtest:RDTTtest,RTTtest:RTTtest,Ccategory:Ccategory,PHstatus:PHstatus,TPHstatus:TPHstatus,Travel:Travel,TTravel:TTravel,TTTravel:TTTravel,Priskarea:Priskarea,TPriskarea:TPriskarea,PChistory:PChistory,TPChistory:TPChistory,TTPChistory:TTPChistory,PCOhistory:PCOhistory,Foodexposure:Foodexposure,TFoodexposure:TFoodexposure,WaterS:WaterS,TWaterS:TWaterS,PModeA:PModeA,Referral:Referral,Treatment:Treatment,ACTC:ACTC,TACTC:TACTC,Adate:Adate,Ddate:Ddate,Outcome:Outcome,TOutcome:TOutcome,Rdate:Rdate,CoMorbidity:CoMorbidity,TCoMorbidity:TCoMorbidity,TTCoMorbidity:TTCoMorbidity,STTCoMorbidity:STTCoMorbidity,LComplication:LComplication,Complication:Complication,Nutrition:Nutrition,MUAC:MUAC,Disinfection:Disinfection,Vaccination:Vaccination,DCName:DCName,Phone:Phone,Holywater:Holywater,THolywater:THolywater,FContainers:FContainers,TFContainers:TFContainers,LastFiveDaysF:LastFiveDaysF,Cooking:Cooking,LeftoverFood:LeftoverFood,TLeftoverFood:TLeftoverFood,OThome:OThome,TOThome:TOThome,ActualLocation:ActualLocation,RawFood:RawFood,TRawFood:TRawFood,TRawFoodwater:TRawFoodwater,TTRawFoodwater:TTRawFoodwater,WaterConsumed:WaterConsumed,TWaterConsumed:TWaterConsumed,TTWaterConsumed:TTWaterConsumed,WaterTreat:WaterTreat,DContainers:DContainers,TDContainers:TDContainers,
      WStaying:WStaying,Income:Income,Religion:Religion,TReligion:TReligion,Educational:Educational,FamilyS:FamilyS,UnderF:UnderF,Information:Information,TInformation:TInformation,TTInformation:TTInformation,CoMorbidFM:CoMorbidFM,TsetCoMorbidFM:TsetCoMorbidFM,SimilarC:SimilarC,TreatmentF:TreatmentF,Latrine:Latrine,TLatrine:TLatrine,LatrineU:LatrineU,Lenvironment:Lenvironment,Odefecation:Odefecation,WasteDisposal:WasteDisposal,Flies:Flies,Hygienic:Hygienic,HandWashing:HandWashing,Observations:Observations,Recommendations:Recommendations,AddContactInfo:AddContactInfo,ppname:ppname,Cname:Cname,CSex:CSex,CAge:CAge,LContactDate:LContactDate,EnrolmentDate:EnrolmentDate,selected:selected,CRegion:CRegion,TCRegion:TCRegion,CSubCity:CSubCity,District:District,CKebele:CKebele,CHNumber:CHNumber,CPhone:CPhone,CLatitude:CLatitude,CLongitude:CLongitude,COccupation:COccupation,TCOccupation:TCOccupation,Pwork:Pwork,Tcontact:Tcontact,Syptomatic:Syptomatic,ExpectedDate:ExpectedDate,COutcome:COutcome,AgeCategory:AgeCategory,EpiWeek:EpiWeek,TracerTeam:TracerTeam,CRemark:CRemark,pdf:CholerasfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Cholera", async (req, res) => {
  try {
    CholerasMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

app.get("/Gete-SinglecholeraAkaki", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});

app.get("/Gete-SinglecholeraaAddisKetema", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});


app.get("/Gete-SingleCholeraArada", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraBole", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"Bole Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraGulele", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraKirkos", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"Kirkos Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});
app.get("/Gete-Singlecholerakolife", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"Nifas_Silk_Lafto Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraLemi_Kura", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"Lemi_Kura Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraLideta", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"Lideta Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraYeka", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find().or([{PSubCity:"Yeka Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraFemale", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find({Sex:"Female"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraMale", async (req, res) => {
  try {
    const singleCholera= CholerasMondel.find({Sex:"Male" }).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleCholera)
    });
  } catch (error) {}
});
///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SingleCholeraWeek1", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraaWeek2", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek3", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek4", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek5", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek6", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCholeraWeek7", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek8", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek9", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek10", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek11", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-11"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek12", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or({EPIWeek:"Week-12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek13", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or({EPIWeek:"Week-13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleCholeraWeek14", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or({EPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleCholeraWeek15", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraaWeek16", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek17", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek18", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek19", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek20", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCholeraWeek21", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek22", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek23", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek24", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek25", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek26", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or({EPIWeek:"Week-26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek27", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or({EPIWeek:"Week-27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleCholeraWeek28", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or({EPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleCholeraWeek29", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraaWeek30", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek31", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek32", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek33", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek34", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCholeraWeek35", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek36", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek37", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek38", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek39", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek40", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or({EPIWeek:"Week-40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek41", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or({EPIWeek:"Week-41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleCholeraWeek42", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or({EPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleCholeraWeek43", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraaWeek44", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek45", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek46", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek47", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek48", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCholeraWeek49", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek50", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek51", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraWeek52", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{EPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////

////////////////////////////////////////Ocupation//////////////////////////////
app.get("/Gete-SingleCholeraDailylaborer", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{POccupation:"Daily laborer"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraDriver", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{POccupation:"Driver"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraEmployed", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{POccupation:"Employed (Private & Government)"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraNoJob", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{POccupation:"No Job"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraPrivate", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{POccupation:"Private (Self Employed)"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraStreetChildren", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{POccupation:"Street Children"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCholeraStudent", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{POccupation:"Student"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraHousewife", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{POccupation:"House wife"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraOther", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{POccupation:{TPOccupation}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
/////back end//////////////////////////////////pregnancy status////////////////////////////////
app.get("/Gete-SingleCholeraPregnant", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Pregnancy:"Pregnant"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCholeraLactating", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Pregnancy:"Lactating"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraNotpregnant", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Pregnancy:"Not pregnant"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraNA", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Pregnancy:"NA"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
/////////////////////////////////////end of pregnancy///////////////////////////////


////////////////////////////////////////ocupation end///////////////////////////////////


////////////////////////////////////////Risk Area dashbord end///////////////////////////////////

app.get("/Gete-SingleCholeraSlumArea", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Priskarea:"Slum Area"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraHollyWater", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Priskarea:"Holly Water"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleCholeraRefugeCamp", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Priskarea:"Refuge Camp"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCholeraRiverArea", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Priskarea:"River Area"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraStagnantWater", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Priskarea:"Stagnant Water"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraOther", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{TPriskarea:"Other"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
/////////////////////////////////////end of Risk Area///////////////////////////////

////////////////////////////////////////exposure dashbord end///////////////////////////////////

app.get("/Gete-SingleCholeraVegetable", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Vegetable products"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraFruit", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Fruit Products"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleCholeraMeat", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Meat & Fish Products"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCholeraDiary", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Diary Products"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraHotel", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Any Hotel | Café Foods"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraHome", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Home Made Foods"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleCholeraStreet", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Street Vendor Food (Fast Food)"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraRaw", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Raw Foods"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleCholeraLeft", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Left over Foods"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCholeraCeremonial", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Ceremonial Foods"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraPoultry", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Poultry Products"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraOthers", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Foodexposure:"Other"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
/////////////////////////////////////end of Risk Area///////////////////////////////
/////////////////////////////////////Vacination Statys////////////////////////////
app.get("/Gete-SingleCholeraZeroDose", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Vaccination:"Zero dose"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleCholeraOneDose", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Vaccination:"One dose"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraTwoDose", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Vaccination:"Two dose"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleCholeraNotEligible", async (req, res) => {
  try {
    const singleMeasel= CholerasMondel.find().or([{Vaccination:"Not eligible (﹤1yr)"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
////////////////////////////////////end of Vacination Status/////////////////////
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});
//multer------------------------------------------------------------
//const multer = require("multer");

const PolioM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./Polio");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/Polio");

const PolioMondel = mongoose.model("Polio" )
const PolioStor = multer({ storage: PolioM });

app.post("/PolioFile", PolioStor.single("file"), async (req, res) => {
  console.log(req.file);
  const PPRegion = req.body.PPRegion;
  const TPPRegion = req.body.TPPRegion;
  const PPSubCity = req.body.PPSubCity;
  const PYear = req.body.PYear;
  const PCNumber = req.body.PCNumber;
  const PPWoreda = req.body.PPWoreda;
  const PPTWoreda = req.body.PPTWoreda;
  const PKebele = req.body.PKebele;
  const PVillage = req.body.PVillage;
  const PPName = req.body.PPName;
  const PFather = req.body.PFather;
  const PGrandF = req.body.PGrandF;
  const PMother = req.body.PMother;
  const PLatitude = req.body.PLatitude;
  const PLongitude = req.body.PLongitude;
  const Pbirth = req.body.Pbirth;
  const PAge = req.body.PAge;
  const PPSex = req.body.PPSex;
  const PFacilityT = req.body.PFacilityT;
  const TPFacilityT = req.body.TPFacilityT;
  const HFName = req.body.HFName;
  const HFTName = req.body.HFTName;
  const HRegion = req.body.HRegion;
  const HTRegion = req.body.HTRegion;
  const HSubCity = req.body.HSubCity;
  const THSubCity = req.body.THSubCity;
  const HWoreda = req.body.HWoreda;
  const HFTworeda = req.body.HFTworeda;
  const DPReporting = req.body.DPReporting;
  const PNName = req.body.PNName;
  const PNotifier = req.body.PNotifier;
  const TPNotifier = req.body.TPNotifier;
  const PDistrictN = req.body.PDistrictN;
  const PInvestigated = req.body.PInvestigated;
  const PRecordN = req.body.PRecordN;
  const PFName = req.body.PFName;
  const PParalysis = req.body.PParalysis;
  const PFever = req.body.PFever;
  const Pprogressed = req.body.Pprogressed;
  const PFlaccid = req.body.PFlaccid;
  const PAsymmetrical = req.body.PAsymmetrical;
  const PSite = req.body.PSite;
  const PTentative = req.body.PTentative;
  const PTAFP = req.body.PTAFP;
  const POPV = req.body.POPV;
  const PNIDs = req.body.PNIDs;
  const POPV0D = req.body.POPV0D;
  const POPV1D = req.body.POPV1D;
  const POPV2D = req.body.POPV2D;
  const POPV3D = req.body.POPV3D;
  const POPV4D = req.body.POPV4D;
  const Plast = req.body.Plast;
  const PUnknown = req.body.PUnknown;
  const TPOPV = req.body.TPOPV;
  const POPVRI = req.body.POPVRI;
  const PTotalIPV = req.body.PTotalIPV;
  const PDIPV = req.body.PDIPV;
  const PScollected1 = req.body.PScollected1;
  const PScollected2 = req.body.PScollected2;
  const PSnational = req.body.PSnational;
  const PSnationalR = req.body.PSnationalR;
  const PCondition = req.body.PCondition;
  const DEPI = req.body.DEPI;
  const PPrimary = req.body.TACTC;
  const PNtoL = req.body.PNtoL;
  const PDdifferentiation = req.body.PDdifferentiation;
  const PDEPID = req.body.PDEPID;
  const PW = req.body.PW;
  const PDiscordant = req.body.PDiscordant;
  const PV = req.body.PV;
  const PNPENT = req.body.PNPENT;
  const PNEV = req.body.PNEV;
  const PFollowUp = req.body.PFollowUp;
  const PResidual = req.body.PResidual;
  const PFindings = req.body.PFindings;
  const PDiagnosis = req.body.PDiagnosis;
  const PImmunocompromised = req.body.PImmunocompromised;
  const Pclassification = req.body.Pclassification;
  const PSerotype = req.body.PSerotype;
  const PFCName = req.body.PFCName;
  const PTitle = req.body.PTitle;
  const PPhone = req.body.PPhone;
  const EPIWeek = req.body.EPIWeek;
  const PoliosfileName = req.file.filename;
  try {
    await PolioMondel.create({PPRegion:PPRegion,TPPRegion:TPPRegion,PPSubCity:PPSubCity,PYear:PYear,PCNumber:PCNumber,PCNumber:PCNumber,PPTWoreda:PPTWoreda,PKebele:PKebele,PVillage:PVillage,PPName:PPName,PFather:PFather,PGrandF:PGrandF,PMother:PMother,PLatitude:PLatitude,PLongitude:PLongitude,Pbirth:Pbirth,PAge:PAge,PPSex:PPSex,PFacilityT:PFacilityT,TPFacilityT:TPFacilityT,HFName:HFName,HFTName:HFTName,HRegion:HRegion,HTRegion:HTRegion,HSubCity:HSubCity,THSubCity:THSubCity,HWoreda:HWoreda,HFTworeda:HFTworeda,DPReporting:DPReporting,PNName:PNName,PNotifier:PNotifier,TPNotifier:TPNotifier,PDistrictN:PDistrictN,PInvestigated:PInvestigated,PRecordN:PRecordN,PFName:PFName,PParalysis:PParalysis,PFever:PFever,Pprogressed:Pprogressed,PFlaccid:PFlaccid,PAsymmetrical:PAsymmetrical,PSite:PSite,PTentative:PTentative,PTAFP:PTAFP,POPV:POPV,PNIDs:PNIDs,POPV0D:POPV0D,POPV1D:POPV1D,POPV2D:POPV2D,POPV3D:POPV3D,POPV4D:POPV4D,Plast:Plast,PUnknown:PUnknown,TPOPV:TPOPV,POPVRI:POPVRI,PTotalIPV:PTotalIPV,PDIPV:PDIPV,PScollected1:PScollected1,PScollected2:PScollected2,PSnational:PSnational,PSnationalR:PSnationalR,PCondition:PCondition,DEPI:DEPI,PPrimary:PPrimary,PNtoL:PNtoL,PDdifferentiation:PDdifferentiation,PDEPID:PDEPID,PW:PW,PDiscordant:PDiscordant,PV:PV,PNPENT:PNPENT,PNEV:PNEV,PFollowUp:PFollowUp,PResidual:PResidual,PFindings:PFindings,PDiagnosis:PDiagnosis,PImmunocompromised:PImmunocompromised,Pclassification:Pclassification,PSerotype:PSerotype,PFCName:PFCName,PTitle:PTitle,PPhone:PPhone,EPIWeek:EPIWeek,pdf:PoliosfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-Polio", async (req, res) => {
  try {
    PolioMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SinglePolioAkaki", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioArada", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioBole", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioGulele", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioKirkos", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePoliokolife", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioLemi_Kura", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioLideta", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioYeka", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PPSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioFemale", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find({PPSex:"Female"}).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioMale", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find({PPSex:"Male" }).count().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});


///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SinglePolioWeek1", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek2", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek3", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek4", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek5", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek6", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePolioWeek7", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek8", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek9", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek10", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek11", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-11"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek12", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or({EPIWeek:"Week-12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek13", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or({EPIWeek:"Week-13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePolioWeek14", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or({EPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePolioWeek15", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioaWeek16", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek17", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek18", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek19", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek20", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePolioWeek21", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek22", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek23", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek24", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek25", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek26", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or({EPIWeek:"Week-26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek27", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or({EPIWeek:"Week-27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePolioWeek28", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or({EPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePolioWeek29", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioaWeek30", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek31", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek32", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek33", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek34", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePolioWeek35", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek36", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek37", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek38", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek39", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek40", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or({EPIWeek:"Week-40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek41", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or({EPIWeek:"Week-41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePolioWeek42", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or({EPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SinglePolioWeek43", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioaWeek44", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek45", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek46", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek47", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek48", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePolioWeek49", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek50", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek51", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioWeek52", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{EPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/Gete-SinglePolioCV", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PNotifier:"Community Volunteer(CV)"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SinglePolioHEW", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PNotifier:"Health Extension Worker(HEW)"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioForceps", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PNotifier:"Forceps"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioOHW", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PNotifier:"Other Health Worker(OHW)"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioOther", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{TPNotifier:{TPNotifier}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////////end/////////////////////////////////////////////////
//////////////////////////////////////////////////Paralysis//////////////////////
app.get("/Gete-SinglePolioYes", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PFlaccid:"Yes"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SinglePolioNo", async (req, res) => {
  try {
    const singleMeasel= PolioMondel.find().or([{PFlaccid:'No'}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
//////////////////////////////////////////////////end///////////////////////////
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

/////////////////-----------------------------------------------
//const multer = require("multer");

const storages = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  pdfDetailsfilename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});
require("./model/pdfDetails");
const PdfSchemas = mongoose.model("PdfDetails");
const uploads = multer({ storage: storages });

app.post("/upload-files", uploads.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  const pdfDetailsfileName = req.file.pdfDetailsfilename;
  try {
    await PdfSchemas.create({ title: title, pdf: pdfDetailsfileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/Gete-pdf", async (req, res) => {
  try {
    PdfSchemas.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});
////////////////////////----------------------------------------

//measeles line list//////
/*app.post("/Measles" ,(req, res) => {
    const{RStartDate,Latitude,Longitude,visible,Sex,Age,HNumber,PWoreda,pTWoreda,PSubCity,PRegion,WRegion,BDate,pname,visit,Eschool,SName,Hfacility,visite,PType,Weight,Hight,BMI,MUAC,PPhone,HRegion, HTRegion,HSubCity,HWoreda,HFTworeda,HFName,HFTName,NotifiedDate,OnsetDate,Orash,MNumber,Vdate,Aepidemics,visited,Treatment,TTreatment,visiblee,Dspeciemen,DspeciemenS,Tspecimen,TTspecimen,sample,TypeC,Labresults,SMeasles,Nmeasles,TNmeasles,visibleIso,Isolated,visibles,vitaminA,visiting,Complication,AdmitedHF,Tcomplications,Pfactors,WPfactors,DateSR,FCName,Phone,PNeonat,Outcome,email,EPIWeek} = req.body
    MeaselesMondel.findOne({email: email})
    .then(user => {
        if(user){
        res.json("Already have an account")}
        else{
            MeaselesMondel.create({RStartDate:RStartDate,Latitude:Latitude,Longitude:Longitude,visible:visible,Sex:Sex,Age:Age,HNumber:HNumber,PWoreda:PWoreda,pTWoreda:pTWoreda,PSubCity:PSubCity,PRegion:PRegion,WRegion:WRegion,BDate:BDate,pname:pname,visit:visit,Eschool:Eschool,SName:SName,Hfacility:Hfacility,visite:visite,PType:PType,Weight:Weight,Hight:Hight,BMI:BMI,MUAC:MUAC,PPhone:PPhone,HRegion:HRegion,HTRegion:HTRegion,HSubCity:HSubCity,HWoreda:HWoreda,HFTworeda:HFTworeda,HFName:HFName,HFTName:HFTName,NotifiedDate:NotifiedDate,OnsetDate:OnsetDate,Orash:Orash,MNumber:MNumber,Vdate:Vdate,Aepidemics:Aepidemics,visited:visited,Treatment:Treatment,TTreatment:TTreatment,visiblee:visiblee,Dspeciemen:Dspeciemen,DspeciemenS:DspeciemenS,Tspecimen:Tspecimen,TTspecimen:TTspecimen,sample:sample,TypeC:TypeC,Labresults:Labresults,SMeasles:SMeasles,Nmeasles:Nmeasles,TNmeasles:TNmeasles,visibleIso:visibleIso,Isolated:Isolated,visibles:visibles,vitaminA:vitaminA,visiting:visiting,Complication:Complication,AdmitedHF:AdmitedHF,Tcomplications:Tcomplications,Pfactors:Pfactors,WPfactors:WPfactors,DateSR:DateSR,FCName:FCName,Phone:Phone,PNeonat:PNeonat,Outcome:Outcome,email:email,EPIWeek:EPIWeek})
            .then(result => res.json("Account created"))
            .catch(err => res.json("error"))
        }
    
}).catch(err => res.json(err))

})*/

//////Measles multer/////////////////////////////////////////////////////////
//const  = multer.diskStorage({
  //destination: (req, file, cb) =>{
   //   cb(null,'./MeaslesStor')
  //},
  //filename: (req, file, cb) =>{
   //  cb(null,  file.fieldname + "_" + `${Date.now()}_${file.originalname}`)
    
  //}
//})

//const MeaslesStor = multer({ storage:MeaslesM})

//app.post("/MeaslesFile" ,MeaslesStor.single('Measle'), (req, res) => {
  //MeaselesMondel.create({file: req.file.filename})
 //.then(result => res.json(result))
 //.catch(err => console.log(err))
 
//})

//multer------------------------------------------------------------
//const multer = require("multer");

const ResearchM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./ReserchProposal");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null,uniqueSuffix +  file.originalname);
  },
});

require("./model/Research");

const ResearchMondel = mongoose.model("Researchs" )
const ResearchStor = multer({ storage: ResearchM });

app.post("/ResearchP", ResearchStor.single("file"), async (req, res) => {
  console.log(req.file);
  const NCollege = req.body.NCollege;
  const Department = req.body.Department;
  const StudyF = req.body.StudyF;
  const Nadvisor = req.body.Nadvisor;
  const email = req.body.email;
  const phone = req.body.phone;
  const PI = req.body.PI;
  const PIPhone = req.body.PIPhone;
  const PIemail = req.body.PIemail;
  const Title = req.body.Title;
  const FocusA = req.body.FocusA;
  const SPeriodB = req.body.SPeriodB;
  const SPeriodE = req.body.SPeriodE;
  const ConductS = req.body.ConductS;
  const Rmethods = req.body.Rmethods;
  const Study = req.body.Study;
  const Design = req.body.Design;
  const geographicA = req.body.geographicA;
  const Slocation = req.body.Slocation;
  const Gender = req.body.Gender;
  const populations = req.body.populations;
  const MicroD = req.body.MicroD;
  const Eelectronically = req.body.Eelectronically;
  const Tools = req.body.Tools;
  const Tcollection = req.body.Tcollection;
  const Budget = req.body.Budget;
  const Geocoordinate = req.body.Geocoordinate;
  const Groups = req.body.Groups;
  const Dsharing = req.body.Dsharing;
  const Reasons = req.body.Reasons;
  const ResearchfileName = req.file.filename;
  try {
    await ResearchMondel.create({NCollege:NCollege,Department:Department,StudyF:StudyF,Nadvisor:Nadvisor,email:email,phone:phone,PI:PI,PIPhone:PIPhone,PIemail:PIemail,Title:Title,FocusA:FocusA,SPeriodB:SPeriodB,SPeriodE:SPeriodE,ConductS:ConductS,Rmethods:Rmethods,Study:Study,Design:Design,geographicA:geographicA,Slocation:Slocation,Gender:Gender,populations:populations,MicroD:MicroD,Eelectronically:Eelectronically,Tools:Tools,Tcollection:Tcollection,Budget:Budget,Geocoordinate:Geocoordinate,Groups:Groups,Dsharing:Dsharing,Reasons:Reasons, pdf:ResearchfileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Proposal", async (req, res) => {
  try {
    ResearchMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
/////////////////////////////////////////////////////////reserch proposal count///////////
app.get("/Gete-PHD", async (req, res) => {
  try {
    const singleMeasel= ResearchMondel.find().or([{StudyF:"PHD Degree"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-Msc", async (req, res) => {
  try {
    const singleMeasel= ResearchMondel.find().or([{StudyF:"Masters Degree"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-Bacheler", async (req, res) => {
  try {
    const singleMeasel= ResearchMondel.find().or([{StudyF:"Bachelors Degree"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-Project", async (req, res) => {
  try {
    const singleMeasel= ResearchMondel.find().or([{StudyF:"Project"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-Survey", async (req, res) => {
  try {
    const singleMeasel= ResearchMondel.find().or([{StudyF:"Survey"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-Other", async (req, res) => {
  try {
    const singleMeasel= ResearchMondel.find().or([{StudyF:"Other"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
//multer------------------------------------------------------------
//const multer = require("multer");

const MeningitsM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Meningits");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null,  file.originalname);
  },
});

require("./model/Meningits");

const MeningitsMondel = mongoose.model("Meningits" )
const MeningitsStor = multer({ storage: ResearchM });

app.post("/Meningits", MeningitsStor.single("file"), async (req, res) => {
  console.log(req.file);
  const startDate = req.body.startDate;
  const pname = req.body.pname;
  const MRN = req.body.MRN;
  const Age = req.body.Age;
  const Sex = req.body.Sex;
  const Pregnancy = req.body.Pregnancy;
  const PPhone = req.body.PPhone;
  const PRegion = req.body.PRegion;
  const PSubCity = req.body.PSubCity;
  const PWoreda = req.body.PWoreda;
  const pTWoreda = req.body.pTWoreda;
  const SpecificA = req.body.SpecificA;
  const Ketena = req.body.Ketena;
  const HNumber = req.body.HNumber;
  const POccupation = req.body.POccupation;
  const TPOccupation = req.body.TPOccupation;
  const FacilityT = req.body.FacilityT;
  const TFacilityT = req.body.TFacilityT;
  const HFName = req.body.HFName;
  const HFTName = req.body.HFTName;
  const SpecifyF = req.body.SpecifyF;
  const HRegion = req.body.HRegion;
  const HTRegion = req.body.HTRegion;
  const HSubCity = req.body.HSubCity;
  const THSubCity = req.body.THSubCity;
  const HWoreda = req.body.HWoreda;
  const HFTworeda = req.body.HFTworeda;
  const DReporting = req.body.DReporting;
  const seenDate = req.body.seenDate;
  const Odisease = req.body.Odisease;
  const Cfeature = req.body.Cfeature;
  const SampleT = req.body.SampleT;
  const DSampleT = req.body.DSampleT;
  const SampleTT = req.body.SampleTT;
  const SampleTR = req.body.SampleTR;
  const SampleTPG = req.body.SampleTPG;
  const Pcategory = req.body.Pcategory;
  const Preferral = req.body.Preferral;
  const TPreferral = req.body.TPreferral;
  const AdmissionS = req.body.AdmissionS;
  const DAdmissionS = req.body.DAdmissionS;
  const AdmissionSDD = req.body.AdmissionSDD;

  const Antibiotics = req.body.Antibiotics;
  const Symptoms = req.body.Symptoms;
  const Poutcome = req.body.Poutcome;
  const Sequelae = req.body.Sequelae;
  const Specimen = req.body.Specimen;
  const DSpecimen = req.body.DSpecimen;
  const CSF = req.body.CSF;
  const Transportation = req.body.Transportation;
  const Macroscopic = req.body.Macroscopic;
  const SQuantity = req.body.SQuantity;
  const IdentificationN = req.body.IdentificationN;
  const Results = req.body.Results;
  const GramStain = req.body.GramStain;
  const RapidT = req.body.RapidT;
  const WBC = req.body.WBC;
  const Glucose = req.body.Glucose;
  const Protein = req.body.Protein;
  const Agglutination = req.body.Agglutination;
  const Culture = req.body.Culture;
  const DReferenceL = req.body.DReferenceL;
  const NationalR = req.body.NationalR;
  const NCulture = req.body.NCulture;
  const PCR = req.body.PCR;
  const WHOCentre = req.body.WHOCentre;
  const NWHOCentre = req.body.NWHOCentre;
  const DWHOCentre = req.body.DWHOCentre;
  const DResultWHO = req.body.DResultWHO;
  const WHOPCR = req.body.WHOPCR;
  const Genotype = req.body.Genotype;
  const FResult = req.body.FResult;
  const Classification = req.body.Classification;
  const Observations = req.body.Observations;
  
  const Comorbidity = req.body.Comorbidity;
  const TComorbidity = req.body.TComorbidity;
  const FCName = req.body.FCName;
  const Phone = req.body.Phone;
  const EPIWeek = req.body.EPIWeek;
  const MeningitsfileName = req.file.filename;
  try {
    await MeningitsMondel.create({startDate:startDate,pname:pname,MRN:MRN,Age:Age,Sex:Sex,Pregnancy:Pregnancy,PPhone:PPhone,PRegion:PRegion,PSubCity:PSubCity,PWoreda:PWoreda,pTWoreda:pTWoreda,SpecificA:SpecificA,Ketena:Ketena,HNumber:HNumber,POccupation:POccupation,TPOccupation:TPOccupation,FacilityT:FacilityT,TFacilityT:TFacilityT,HFName:HFName,HFTName:HFTName,SpecifyF:SpecifyF,HRegion:HRegion,HTRegion:HTRegion,HSubCity:HSubCity,THSubCity:THSubCity,HWoreda:HWoreda,HFTworeda:HFTworeda,DReporting:DReporting,seenDate:seenDate,Odisease:Odisease,Cfeature:Cfeature,SampleT:SampleT,SampleT:DSampleT,DSampleT:SampleTT,SampleTR:SampleTR,SampleTPG:SampleTPG,Pcategory:Pcategory,Preferral:Preferral,TPreferral:TPreferral,AdmissionS:AdmissionS,DAdmissionS:DAdmissionS,AdmissionSDD:AdmissionSDD,Poutcome:Poutcome,Comorbidity:Comorbidity,TComorbidity:TComorbidity,FCName:FCName,Phone:Phone,EPIWeek:EPIWeek,pdf:MeningitsfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Meningits", async (req, res) => {
  try {
    MeningitsMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
///////////////////////////////////////////back end////////////////////////////////////////////////////
app.get("/Gete-SingleMeningitsAkaki", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"Akaki Sub City"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsaAddisKetema", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"Addis Ketema Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsArada", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"Arada Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsBole", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"Bole sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsGulele", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"Gulele Sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsKirkos", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"kirkos sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeningitskolife", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"kolife keranio sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsNifas_Silk_Lafto", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"Nifas silik lafto sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsLemi_Kura", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"lemi kura sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsLideta", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"lideta sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsYeka", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{PSubCity:"yeka sub city"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsFemale", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find({Sex:"Female"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsMale", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find({Sex:"Male" }).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
///////////////////////////////////////////Outcome//////////////////////////////////////////////////////////
app.get("/Gete-SingleMeningitsImproved", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{Poutcome:"Improved"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsOnTreatment", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{Poutcome:"On treatment"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsReferred", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find({Poutcome:"Referred"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsDeath", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find({Poutcome:"Death" }).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
//////////////////////////////////////////Outcome End///////////////////////////////////////////////////////
//////////////////////////////////////////back end age///////////////////////////////////////////////
app.get("/Gete-SingleMeningitsLessFive", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{Age: {$lte: 5}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsBetweb5To14", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{Age: {$gte: 5, $lte: 14}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsBetweb15To29", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{Age: {$gte: 15, $lte: 29}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsBetweb30To49", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{Age: {$gte: 30, $lte: 49}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeningitsBetweb50To59", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{Age: {$gte: 50, $lte: 59}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsBetweb60To69", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{Age: {$gte: 60, $lte: 69}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsAbove70", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{Age: {$gte: 70}}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

/////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////week back end////////////////////////////////////////////////////
app.get("/Gete-SingleMeningitsWeek1", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-1"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsaWeek2", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-2"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek3", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-3"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek4", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-4"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek5", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-5"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek6", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-6"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeningitsWeek7", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-7"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek8", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-8"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek9", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-9"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek10", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-10"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek11", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-11"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek12", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or({EPIWeek:"Week-12"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek13", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or({EPIWeek:"Week-13"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeningitsWeek14", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or({EPIWeek:"Week-14"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeningitsWeek15", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-15"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsaWeek16", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-16"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek17", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-17"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek18", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-18"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek19", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-19"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek20", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-20"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeningitsWeek21", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-21"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek22", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-22"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek23", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-23"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek24", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-24"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek25", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-25"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek26", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or({EPIWeek:"Week-26"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek27", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or({EPIWeek:"Week-27"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeningitsWeek28", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or({EPIWeek:"Week-28"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeningitsWeek29", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-29"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsaWeek30", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-30"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek31", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-31"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek32", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-32"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek33", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-33"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek34", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-34"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeningitsWeek35", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-35"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek36", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-36"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek37", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-37"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek38", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-38"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek39", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-39"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek40", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or({EPIWeek:"Week-40"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek41", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or({EPIWeek:"Week-41"}).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeningitsWeek42", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or({EPIWeek:"Week-42"}).countDocuments() .then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-SingleMeningitsWeek43", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-43"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsaWeek44", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-44"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek45", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-45"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek46", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-46"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek47", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-47"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek48", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-48"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
 
app.get("/Gete-SingleMeningitsWeek49", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-49"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek50", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-50"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek51", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-51"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-SingleMeningitsWeek52", async (req, res) => {
  try {
    const singleMeasel= MeningitsMondel.find().or([{EPIWeek:"Week-52"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//////////////////////////////////////////back end age///////////////////////////////////////////////
//apis----------------------------------------------------------------
app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});

//////Research multer/////////////////////////////////////////////////////////
/*const ResearchM = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null,'./ReserchProposal')
    },
    filename: (req, file, cb) =>{
       cb(null,  file.fieldname + "_" + `${Date.now()}_${file.originalname}`)
      //cb(null, file.fieldname + "_" + Date.now()+ path.extname(file.originalname))
    }
})

const ResearchStor = multer({ storage:ResearchM})
//const cpUpload = upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 8 }])
//app.post('/cool-profile', cpUpload, function (req, res, next) {
app.post("/ResearchP" ,ResearchStor.single('Proposal'), (req, res) => {
    //console.log(req.body)
   //console.log(req.file)
 //const fileName = req.file.filename;
    
 ResearchMondel.create({file: req.file.filename})
   .then(result => res.json(result))
   .catch(err => console.log(err))
   
    //try{
       // await RegisterMondel.create({file:fileName})
       // res.json({status: "ok"})
    //}catch(error){
       //res.json({status: error})

    //}
})*/
///reseerch file------------------------

/*app.post("/ResearchA" , (req, res) => {
    const{NCollege,Department,StudyF,Nadvisor,email,phone,PI,PIPhone,PIemail,Title,FocusA,SPeriodB,SPeriodE,ConductS,Rmethods,Study,Design,geographicA,Slocation,Gender,populations,MicroD,Eelectronically,Tools,Tcollection,Budget,Geocoordinate,Groups,Dsharing,Reasons} = req.body
    ResearchMondel.findOne({email: email})
    .then(user => {
        if(user){
        res.json("Already have an account")}
        else{
            //ResearchMondel.create({file: req.file.filename})
            ResearchMondel.create({NCollege:NCollege,Department:Department,StudyF:StudyF,Nadvisor:Nadvisor,email:email,phone:phone,PI:PI,PIPhone:PIPhone,PIemail:PIemail,Title:Title,FocusA:FocusA,SPeriodB:SPeriodB,SPeriodE:SPeriodE,ConductS:ConductS,Rmethods:Rmethods,Study:Study,Design:Design,geographicA:geographicA,Slocation:Slocation,Gender:Gender,populations:populations,MicroD:MicroD,Eelectronically:Eelectronically,Tools:Tools,Tcollection:Tcollection,Budget:Budget,Geocoordinate:Geocoordinate,Groups:Groups,Dsharing:Dsharing,Reasons:Reasons})
            .then(result => res.json("Account created"))
            .catch(err => res.json("the file is not uploaded"))
        }
    
}).catch(err => res.json(err))

})*/

//////CoRegistration/////////////////////////////////////////////////////////
app.post("/CoRegistration" ,(req, res) => {
    const{NCollege,informationF,Name,Educational,Specialization,email,phone,Advisory} = req.body
    CoRegistrationMondel.findOne({email: email})
    .then(user => {
        if(user){
        res.json("Already have an account")}
        else{
            CoRegistrationMondel.create({NCollege:NCollege,informationF:informationF,Name:Name,Educational:Educational,Specialization:Specialization,email:email,phone:phone,Advisory:Advisory})
            .then(result => res.json("Account created"))
            .catch(err => res.json("error"))
        }
    
}).catch(err => res.json(err))

})
//////IRBUpload/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const IRB = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./FinalReserchPaper");
  },
  IRBUploadfilename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/IRBUpload");
const IRBMondel = mongoose.model("IRBUploaded");
const IRBStorage = multer({ storage: IRB });

app.post("/IRBUpload", IRBStorage.single("file"), async (req, res) => {
  console.log(req.file);
  //const title = req.body.title;
  const NUniversity = req.body.NUniversity;
  const Name = req.body.Name;
  const email = req.body.email;
  const phone = req.body.phone;
  const IRBUploadedfileName = req.file.IRBUploadfilename;
  try {
    await IRBMondel.create({ NUniversity: NUniversity,Name:Name,email:email,phone:phone,pdf:IRBUploadedfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});




app.get("/get-IRBfiles", async (req, res) => {
  try {
    IRBMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
/*const IRB = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null,'./FinalReserchPaper')
    },
    filename: (req, file, cb) =>{
       cb(null, `${Date.now()}_${file.originalname}`)
      //cb(null, file.fieldname + "_" + Date.now()+ path.extname(file.originalname))
    }
})

const IRBStorage = multer({ storage:IRB})

app.post("/IRupload" ,IRBStorage.single('IRB'), (req, res) => {
    //console.log(req.body)
   //console.log(req.file)
 //const fileName = req.file.filename;
    
 IRBMondel.create({file: req.file.filename})
   .then(result => res.json(result))
   .catch(err => console.log(err))
    //try{
       // await RegisterMondel.create({file:fileName})
       // res.json({status: "ok"})
    //}catch(error){
       //res.json({status: error})

    //}
})*/

////////////////////fil IRB///////////////////////

app.post("/IRBUpload" ,(req, res) => {
    const{NUniversity,Name,email,phone} = req.body
    IRBMondel.findOne({email: email})
    .then(user => {
        if(user){
        res.json("Already have an account")}
        else{
            IRBMondel.create({NUniversity:NUniversity,Name:Name,email:email,phone:phone})
            .then(result => res.json("Account created"))
            .catch(err => res.json("error"))
        }
    
}).catch(err => res.json(err))

})

//////bulletin uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");"./FinalReserchPaper"

const Bulletin = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Bulletin");
  },
  IRBUploadfilename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/Bulletin");
const BulletinMondel = mongoose.model("Bulletin");
const BulletinStorage = multer({ storage: Bulletin });

app.post("/WeekelyBuletin", BulletinStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const Title = req.body.Title;
  const EPIWeek = req.body.EPIWeek;
  const BulletinfileName = req.file.filename;
  try {
    await BulletinMondel.create({Title:Title, EPIWeek: EPIWeek,pdf:BulletinfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Bulliten", async (req, res) => {
  try {
    BulletinMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//////Outbreak Investigation uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const OutbreakI = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./OutbreakInvestigation");
  },
  IRBUploadfilename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/OutbreakI");
const OutbreakIMondel = mongoose.model("OutbreakI");
const OutbreakIStorage = multer({ storage: OutbreakI });

app.post("/OutbreakInvestigation", OutbreakIStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const InvestigationTitle = req.body.InvestigationTitle;
  const EPIWeek = req.body.EPIWeek;
  const ReportingDate = req.body.ReportingDate
  const OutbreakIfileName = req.file.filename;
  try {
    await OutbreakIMondel.create({InvestigationTitle:InvestigationTitle, EPIWeek: EPIWeek,ReportingDate:ReportingDate,pdf:OutbreakIfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-OutbreakI", async (req, res) => {
  try {
    OutbreakIMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//ActiveSearch/////////////////////////////////////////////////////////
 //high------------------------------------------------------------
 const ActiveSearch = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./ActiveSearch");
  },
  IRBUploadfilename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/ActiveSearch");
const ActiveSearchMondel = mongoose.model("ActiveSearch");
const ActiveSearchStorage = multer({ storage: ActiveSearch });

app.post("/PriorityLevel", OutbreakIStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const HFName = req.body.HFName;
  const PriorityLevel = req.body.PriorityLevel;
  try {
    await ActiveSearchMondel.create({HFName:HFName, PriorityLevel: PriorityLevel});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});
 
app.get("/Gete-highLevel", async (req, res) => {
  try {
    const singleMeasel= ActiveSearchMondel.find().or([{PriorityLevel:"high"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-MediumLevel", async (req, res) => {
  try {
    const singleMeasel= ActiveSearchMondel.find().or([{PriorityLevel:"Medium"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

app.get("/Gete-LowLevel", async (req, res) => {
  try {
    const singleMeasel= ActiveSearchMondel.find().or([{PriorityLevel:"Low"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});

//NOPV Investigation uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const NOPV = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./NOPV");
  },
  IRBUploadfilename: function (req, file, cb) {
    
    cb(null, file.originalname);
  },
});

require("./model/NOPV");
const NOPVMondel = mongoose.model("NOPV");
const NOPVStorage = multer({ storage: NOPV });

app.post("/NOPVDocument", NOPVStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const NOPVTitle = req.body.NOPVTitle;
  const NOPVfileName = req.file.filename;
  try {
    await NOPVMondel.create({NOPVTitle:NOPVTitle, pdf:NOPVfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-NOPV", async (req, res) => {
  try {
    NOPVMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//VRAM uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const VRAM = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./VRAM");
  },
  IRBUploadfilename: function (req, file, cb) {
    
    cb(null, file.originalname);
  },
});

require("./model/VRAM");
const VRAMMondel = mongoose.model("VRAM");
const VRAMStorage = multer({ storage: VRAM });

app.post("/VRAMDocument", VRAMStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const VRAMTitle = req.body.VRAMTitle;
  const VRAMfileName = req.file.filename;
  try {
    await VRAMMondel.create({VRAMTitle:VRAMTitle, pdf:VRAMfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-VRAM", async (req, res) => {
  try {
    VRAMMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//EPRP uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const EPRP = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./EPRP");
  },
  IRBUploadfilename: function (req, file, cb) {
    
    cb(null, file.originalname);
  },
});

require("./model/EPRP");
const EPRPMondel = mongoose.model("EPRP");
const EPRPStorage = multer({ storage: EPRP });

app.post("/EPRPDocument", EPRPStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const EPRPTitle = req.body.EPRPTitle;
  const VRAMSource = req.body.VRAMSource;
  const EPRPfileName = req.file.filename;
  try {
    await EPRPMondel.create({EPRPTitle:EPRPTitle,VRAMSource:VRAMSource, pdf:EPRPfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-EPRP", async (req, res) => {
  try {
    EPRPMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//RiskA uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const RiskA = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./RiskA");
  },
  IRBUploadfilename: function (req, file, cb) {
    
    cb(null, file.originalname);
  },
});

require("./model/RiskA");
const RiskAMondel = mongoose.model("RiskA");
const RiskAStorage = multer({ storage: RiskA });

app.post("/RiskA", RiskAStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const RiskTitle = req.body.RiskTitle;
  const RARegion = req.body.RARegion;
  const SubCity = req.file.SubCity;
  const RAKebele = req.body.RAKebele;
  const RAWoreda = req.body.RAWoreda;
  const RiskAfileName = req.file.filename;
  try {
    await RiskAMondel.create({RiskTitle:RiskTitle,RARegion:RARegion, SubCity:SubCity,RAKebele:RAKebele,RAWoreda:RAWoreda, pdf:RiskAfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-RiskA", async (req, res) => {
  try {
    RiskAMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
//IAR uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const IAR = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./IAR");
  },
  IRBUploadfilename: function (req, file, cb) {
    
    cb(null, file.originalname);
  },
});

require("./model/IAR");
const IARMondel = mongoose.model("IAR");
const IARStorage = multer({ storage: IAR });

app.post("/IARDocument", IARStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const IARTitle = req.body.IARTitle;
  const Abstract = req.body.Abstract;
  const IARfileName = req.file.filename;
  try {
    await IARMondel.create({IARTitle:IARTitle,Abstract:Abstract, pdf:IARfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-IAR", async (req, res) => {
  try {
    IARMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//AAPHEML Research Unit Publication/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const Publication = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Publication");
  },
  IRBUploadfilename: function (req, file, cb) {
    
    cb(null, file.originalname);
  },
});

require("./model/Publication");
const PublicationMondel = mongoose.model("Publication");
const PublicationStorage = multer({ storage: Publication });

app.post("/Publication", PublicationStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const PublicationTitle = req.body.PublicationTitle;
  const PublicationAbstract = req.body.PublicationAbstract;
  const PublicationfileName = req.file.filename;
  try {
    await PublicationMondel.create({PublicationTitle:PublicationTitle,PublicationAbstract:PublicationAbstract, pdf:PublicationfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Publication", async (req, res) => {
  try {
    PublicationMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//Education & Training by AAPHEML Research Unit /////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const ETraining = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./ETraining");
  },
  IRBUploadfilename: function (req, file, cb) {
    
    cb(null, file.originalname);
  },
});

require("./model/ETraining");
const ETrainingMondel = mongoose.model("ETraining");
const ETrainingStorage = multer({ storage: ETraining });

app.post("/ETraining", ETrainingStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const ETrainingTitle = req.body.ETrainingTitle;
  const ETrainingDate = req.body.ETrainingDate;
  const ETrainer = req.body.ETrainer;
  const EPlace = req.body.EPlace;
  const ETrainingfileName = req.file.filename;
  try {
    await ETrainingMondel.create({ETrainingTitle:ETrainingTitle,ETrainingDate:ETrainingDate,ETrainer:ETrainer,EPlace:EPlace, pdf:ETrainingfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-ETraining", async (req, res) => {
  try {
    ETrainingMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

///Suppervision uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const Suppervision = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Suppervision");
  },
  filename: function (req, file, cb) {
    ////
    cb(null, file.originalname);
  },
});

require("./model/Suppervision");
const SuppervisionMondel = mongoose.model("Suppervision");
const SuppervisionStorage = multer({ storage: Suppervision });

app.post("/Suppervision", SuppervisionStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const SuppervisionTitle = req.body.SuppervisionTitle;
  const EPIWeek = req.body.EPIWeek;
  const SuppervisionfileName = req.file.filename;
  try {
    await SuppervisionMondel.create({SuppervisionTitle:SuppervisionTitle,EPIWeek:EPIWeek , pdf:SuppervisionfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Suppervision", async (req, res) => {
  try {
    SuppervisionMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//////Homepage Cards uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const Cards = multer.diskStorage({
  destination: function (req, file, cb) { 
    cb(null,"./Cards");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/Cards");
const CardsMondel = mongoose.model("Cards");
const Cardstorage = multer({ storage: Cards });

app.post("/CreatCards", Cardstorage.single("file"), async (req, res) => {
  console.log(req.file);
  const FrontTitle = req.body.FrontTitle;
  const Frontdescription = req.body.Frontdescription;
  const FrontCardsfileName = req.file.filename;
  try {
    await CardsMondel.create({FrontTitle:FrontTitle, Frontdescription:Frontdescription, pdf:FrontCardsfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Cards", async (req, res) => {
  try {
    CardsMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});
///fetching file from Cards ----------

app.get('/fetching-Cards', async(req, res) =>{
    
  //ResearchMondel.find()
  const allUser = await CardsMondel.find({});
const page = parseInt(req.query.page)
const limit = parseInt(req.query.limit)

const startIndex = (page - 1) * limit
const lastIndex = (page) * limit

const results = {}
results.totalUser=allUser.length;
results.pageCount=Math.ceil(allUser.length/limit);

if (lastIndex < allUser.length) {
  results.next = {
    page: page + 1,
  }
}
if (startIndex > 0) {
  results.prev = {
    page: page - 1,
  }
}
results.result = allUser.slice(startIndex, lastIndex);
res.json(results)
  //.then(user => res.json(user))
  //.catch(err => console.log(err))  
  ///passswpred---------invg pgzi yrbs qntc----
  })

//////Homepage CardBottum uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const CardBottum = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./CardBottum");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/CardBottum");
const CardBottumMondel = mongoose.model("CardBottum");
const CardBottumstorage = multer({ storage: CardBottum });

app.post("/CreatCardBottum", CardBottumstorage.single("file"), async (req, res) => {
  console.log(req.file);
  const Bottumname = req.body.Bottumname;
  const Bottumdescription = req.body.Bottumdescription;
  const BottumCardsfileName = req.file.filename;
  try {
    await CardBottumMondel.create({ Bottumname: Bottumname,Bottumdescription: Bottumdescription,pdf:BottumCardsfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});



app.get("/get-CardBottum", async (req, res) => {
  try {
    CardBottumMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//////Homepage Risk communication uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const CardRiskComm = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./RiskComm");
  },
  filename: function (req, file, cb) {
    cb(null,  file.originalname);
  },
});

require("./model/RiskCommunication");
const RiskCommMondel = mongoose.model("RiskCommunication");
const RiskCommstorage = multer({ storage: CardRiskComm });

app.post("/RiskCommunication", RiskCommstorage.single("file"), async (req, res) => {
  console.log(req.file);
  const Title = req.body.Title;
  const Defination = req.body.Defination;
  const Transmition = req.body.Transmition;
  const Prevation = req.body.Prevation;
  const RiskCommunicationfileName = req.file.filename;
  try {
    await RiskCommMondel.create({ Title: Title,Defination: Defination, Transmition: Transmition,Prevation: Prevation,pdf:RiskCommunicationfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

// app.put('/RiskComm/:id', (req, res) => {
//   const id = req.params.id;
//   RiskCommMondel.findByIdAndUpdate({_id: id}, {
//       name: req.body.name,
//       email: req.body.email,
//       age: req.body.age
//   }).then(user => res.json(user))
//   .catch(err => res.json(err))
// })
app.get('/RiskCommunication/:id', (req, res) => {
  const id = req.params.id
  RiskCommMondel.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})

app.get("/RiskComm", async (req, res) => {
  try {
    RiskCommMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//////Homepage CardBottum uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const Guidlines = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./Guidlines");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

require("./model/Guidlines");
const GuidlinesMondel = mongoose.model("Guidlines");
const Guidlinesstorage = multer({ storage: Guidlines });

app.post("/Guidelines", Guidlinesstorage.single("file"), async (req, res) => {
  console.log(req.file);
  const GuidelinesTitle = req.body.GuidelinesTitle;
  const BottumCardsfileName = req.file.filename;
  try {
    await GuidlinesMondel.create({ GuidelinesTitle: GuidelinesTitle,pdf:BottumCardsfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});



app.get("/get-Guidlines", async (req, res) => {
  try {
    GuidlinesMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//////Homepage IRBPolicy uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const IRBPolicy = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./IRBPolicy");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

require("./model/IRBPolicy");
const IRBPolicyMondel = mongoose.model("IRBPolicy");
const IRBPolicystorage = multer({ storage: IRBPolicy });

app.post("/IRBPolicy", IRBPolicystorage.single("file"), async (req, res) => {
  console.log(req.file);
  const IRBPolicyTitle = req.body.IRBPolicyTitle;
  const IRBPolicyfileName = req.file.filename;
  try {
    await IRBPolicyMondel.create({ IRBPolicyTitle: IRBPolicyTitle,pdf:IRBPolicyfileName});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});



app.get("/get-IRBPolicy", async (req, res) => {
  try {
    IRBPolicyMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
////////////////////////////////////multer for capacity building////////////////
// const multer = require("multer");

const capacityBstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./capacityB");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/CapacityBuilding");
const capacityBMondel = mongoose.model("CapacityBuilding");
const capacityBupload = multer({ storage: capacityBstorage });

app.post("/capacityB", capacityBupload.single("file"), async (req, res) => {
  console.log(req.file);
  const TrainingTitle = req.body.TrainingTitle;
  const TrainingDate = req.body.TrainingDate;
  const TCertification = req.file.TCertification;
  const capacityBfileName = req.file.filename;
  try {
    await capacityBMondel.create({ TrainingTitle: TrainingTitle,TrainingDate:TrainingDate,TCertification:TCertification, pdf: capacityBfileName });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-capacityB", async (req, res) => {
  try {
    capacityBMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
/////////////////////////////////////capacity  building end//////////
////////////////////fil Reportable deases///////////////////////

app.post("/RT-Deases" ,(req, res) => {
  const{Deases,TyReport,TyChart,EPIWeek} = req.body
  RepDeseaseMondel.findOne({EPIWeek: EPIWeek})
  .then(user => {
      if(user){
        alert(`this epi week ${EPIWeek} already used`)
      res.json("Already have an account")}
      else{
        RepDeseaseMondel.create({Deases:Deases,TyReport:TyReport,TyChart:TyChart,EPIWeek:EPIWeek})
          .then(result => res.json("Account created"))
          .catch(err => res.json("error"))
      }
  
}).catch(err => res.json(err))

})

//////////////////////////////////////EVENT UPLOAD///////////////////
app.post("/EVENTSUpload" ,(req, res) => {
  const{EVENTS1,EVENTS2,EVENTS3,EVENTS1Date,EVENTS2Date,EVENTS3Date} = req.body
  EVENTSMondel.findOne({EVENTS1: EVENTS1})
  .then(user => {
      if(user){
      res.json("Already have an account")}
      else{
        EVENTSMondel.create({EVENTS1:EVENTS1,EVENTS2:EVENTS2,EVENTS3:EVENTS3,EVENTS1Date:EVENTS1Date,EVENTS2Date:EVENTS2Date,EVENTS3Date:EVENTS3Date})
          .then(result => res.json("Account created"))
          .catch(err => res.json("error"))
      }
  
}).catch(err => res.json(err))

})


///////////////////////EVENT GET////////
app.get('/EVENTSGet',(req, res) =>{
    
  EVENTSMondel.find()
  .then(users => res.json(users))
  .catch(err => console.log(err))  
  })



//mongoose.connect('mongodb://127.0.0.1:27017/test')

//uploading file/////
/*app.post("/register" ,(req, res) => {
    const{orgname,title,principal,phone,dsharing,availability,raw,coverage,BGDate,LDate,gender,type,cleaned,url,comments,email,Title} = req.body
    RegisterMondel.findOne({email: email})
    .then(user => {
        if(user){
        res.json("Already have an account")}
        else{
            RegisterMondel.create({orgname:orgname,title:title,principal:principal,phone:phone,dsharing:dsharing,availability:availability,raw:raw,coverage:coverage,BGDate:BGDate,LDate:LDate,gender:gender,type:type,cleaned:cleaned,url:url,comments:comments,email:email,Title:Title})
            .then(result => res.json("Account created"))
            .catch(err => res.json("error"))
        }
    
}).catch(err => res.json(err))

})*/
io.on('connection', (socket) => {
  console.log('a user connected');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("server is runing")
})
