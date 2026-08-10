/*****************************************************
 * CORE MODULES & CONFIGURATION
 *****************************************************/
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const multer = require("multer");
const QRCode = require("qrcode");
const nodemailer = require("nodemailer");

dotenv.config();

/*****************************************************
 * SERVER & SOCKET
 *****************************************************/
const { createServer } = require("node:http");
const { Server } = require("socket.io");

/*****************************************************
 * DATABASE & SESSION STORES
 *****************************************************/
const MongoStore = require("connect-mongo");
const MongoDBStore = require("connect-mongodb-session")(session);

/*****************************************************
 * CLOUD & MEDIA SERVICES
 *****************************************************/
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const ImageKit = require("imagekit");
const streamifier = require("streamifier");
const { v4: uuidv4 } = require("uuid");

/*****************************************************
 * CUSTOM UTILITIES & MIDDLEWARE
 *****************************************************/
const connectDB = require("./db/connect");
const { logger } = require("./middleware/logEvents");

/*****************************************************
 * MODELS
 *****************************************************/
const ImagesDescriptionMondel = require("./model/ImageDescription");
const HealthFacilityMondel = require("./model/HealthFacilityinfo");
const SignupFormBlog = require("./model/SignupForm");
const ImagesMondel = require("./model/imageDetails");
const Blog = require("./model/Blog");
const User = require("./model/User");
const BlogUser = require("./model/BlogUser");
const Blogcomment = require("./model/Blogcomment");
const FileEntry = require("./model/FileEntry");
const Log = require("./model/Log");
const Form = require("./model/Form");
const NewsFeedMondel = require("./model/NewsFeedMondel");
const EVENTSMondel = require("./model/Events");
const RepDeseaseMondel = require("./model/RepDesease");
const Component = require("./model/Component");
const CoRegistrationMondel = require("./model/CoRegistration");

/*****************************************************
 * ROUTES
 *****************************************************/
const emailRoutes = require("./routes/emailRoutes");

/*****************************************************
 * ENV CONSTANTS
 *****************************************************/
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const SECRET_KEY = JWT_SECRET;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "LabResult");

/*****************************************************
 * EXPRESS APP INITIALIZATION
 *****************************************************/
const app = express();
const server = createServer(app);
const io = new Server(server);

/*****************************************************
 * REQUEST TIMEOUT CONFIG
 *****************************************************/
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000);
  next();
});

/*****************************************************
 * GLOBAL MIDDLEWARE
 *****************************************************/
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

/*****************************************************
 * CORS CONFIGURATION
 *****************************************************/
app.use(
  cors({
    origin: [
      "https://aacdmc.gov.et",
      "https://www.aacdmc.gov.et",
      "*",
      "http://localhost:5173",
      "https://server-qub9.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/*****************************************************
 * AUTH MIDDLEWARE
 *****************************************************/
function requireLogin(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ message: "Login required" });
}

/*****************************************************
 * STATIC FILE SERVING
 *****************************************************/
app.use("/files", express.static("files"));
app.use("/image", express.static("image"));
app.use("/CardBottum", express.static("CardBottum"));
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
app.use("/Cards", express.static(path.join(__dirname, "Cards")));
app.use(express.static("BanerImage"));

/*****************************************************
 * DATABASE CONNECTION
 *****************************************************/
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const store = MongoStore.create({
  mongoUrl: process.env.MONGO_URL,
  collectionName: "sessions",
});

/*****************************************************
 * GLOBAL ERROR HANDLING
 *****************************************************/
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});





/*****************************************************
 *  ---------- SESSION CONFIG ----------
 *****************************************************/
app.use(
  session({
    name: "token",
    secret:  JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,          // HTTPS on Render, required
      sameSite: "none",      // allow cross-site cookies
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
    }),
  })
);

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

/*****************************************************
 *   ==== AUTH MIDDLEWARE ====
 *****************************************************/

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userId = decoded.id;
    req.userName = decoded.name;
    next();
  });
};


/*****************************************************
 *   ==== AITHONTICATION ====
 *****************************************************/

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

 
  /*****************************************************
 *   ==== LOG HISTORY HANDLING ====
 *****************************************************/

async function addLog(action, details) {
  try {
    // Save in MongoDB
    await new Log({ action, details }).save();

    // Save in file system
    const logLine = `${new Date().toISOString()} | ${action} | ${details}\n`;
    fs.appendFileSync(path.join(__dirname, "server.log"), logLine);
  } catch (err) {
    console.error("Error saving log:", err);
  }
}

// === Example Routes ===
app.post("/api/data", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    await addLog("ERROR", "Name is missing in /api/data request");
    return res.status(400).json({ error: "Name required" });
  }

  await addLog("CREATE", `New data created for ${name}`);
  res.json({ success: true, message: `Data saved for ${name} `});
});

app.get("/api/logs", async (req, res) => {
  const logs = await Log.find().sort({ createdAt: -1 }).limit(20);
  res.json(logs);
});
///////////////////////////////////////////////new with log text/////////////
// ✅ Log file path
const logFile = path.join(__dirname, "logs.txt");

// ✅ Middleware to save logs (DB + File)
app.use(async (req, res, next) => {
  const logEntry = `${new Date().toISOString()} | ${req.headers["x-user"] || "guest"} | ${req.method} ${req.url}\n`;

  // Save to DB
  try {
    await Log.create({
      action: `${req.method} ${req.url}`,
      user: req.headers["x-user"] || "guest",
    });
  } catch (err) {
    console.error("DB log error:", err.message);
  }

  // Save to File
  fs.appendFile(logFile, logEntry, (err) => {
    if (err) console.error("File log error:", err.message);
  });

  next();
});

// ✅ Example route
app.post("/api/doSomething", (req, res) => {
  res.json({ message: "Action performed successfully!" });
});

// ✅ Get logs from DB
app.get("/api/logs", async (req, res) => {
  const logs = await Log.find().sort({ createdAt: -1 });
  res.json(logs);
});

// ✅ Get logs from File
app.get("/api/logs/file", (req, res) => {
  fs.readFile(logFile, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Could not read logs.txt" });
    res.type("text/plain").send(data);
  });
});

    /*****************************************************
 *   ==== RESERCH RECIEVED CALCULATION FORMULA====Function to add working days (skipping Saturday & Sunday)
 *****************************************************/
function addWorkingDays(startDate, daysToAdd) {
  let currentDate = new Date(startDate);
  let addedDays = 0;

  while (addedDays < daysToAdd) {
    currentDate.setDate(currentDate.getDate() + 1);
    const day = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) {
      addedDays++;
    }
  }
  return currentDate;
}

app.post("/submit-form", (req, res) => {
  const { submittingDate } = req.body; // e.g. "2025-09-12"
  const afterSixWorkingDays = addWorkingDays(submittingDate, 6);
  res.json({
    submittingDate,
    afterSixWorkingDays: afterSixWorkingDays.toISOString().split("T")[0], // format as YYYY-MM-DD
  });
});
  

  /*****************************************************
 *   ==== IRB STUDENT REGISTRATION ====
 *****************************************************/
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
// app.get('/fetching',(req, res) =>{
    
//     RegisterMondel.find()
//     .then(users => res.json(users))
//     .catch(err => console.log(err))  
//     })

   /*****************************************************
 *   ==== FETCHING FOR STUDENT IN RESERCH ====
 *****************************************************/
app.get('/fetching', async(req, res) =>{
    
    //ResearchMondel.find()
    const allUser = await RegisterMondel.find({});
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
 
  /*****************************************************
 *   ==== FETCHING FOR HEADLINE NEWS ====
 *****************************************************/
    app.get('/NewsHeadline',(req, res) =>{
      NewsFeedMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })


 /*****************************************************
 *   ==== FETCHING FOR MEASELES ====
 *****************************************************/
    app.get('/Filter',(req, res) =>{
      const { q } = req.query;
      const Measeles = MeaselesMondel.find()
      .then(users => res.json(users))
      .catch(err => console.log(err))  
      })


   /*****************************************************
 *   ==== DELET NEWS HEADLINE ====
 *****************************************************/
    app.delete('/deletNewes/:id',(req, res) =>{
      const id = req.params.id;
      NewsFeedMondel.findByIdAndDelete({_id: id})
      .then(res => res.json(res))
      .catch(err => res.json(err))
      })

 /*****************************************************
 *   ==== FDELET EVENTS ====
 *****************************************************/
    app.delete('/deletEvent/:id',(req, res) =>{
      const id = req.params.id;
      EVENTSMondel.findByIdAndDelete({_id: id})
      .then(res => res.json(res))
      .catch(err => res.json(err))
      })

/*****************************************************
 *   ==== DELET BANNER ====
 *****************************************************/
 app.delete('/deletBaner/:id',(req, res) =>{
  const id = req.params.id;
  ImagesMondel.findByIdAndDelete({_id: id})
  .then(res => res.json(res))
  .catch(err => res.json(err))
  })

  
   /*****************************************************
 *   ==== DELET HEALTH FACILITY ====
 *****************************************************/
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

 
 /*****************************************************
 *   ==== CREATE NEWS HEADLINE ====
 *****************************************************/

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

 /*****************************************************
 *   ==== REVIEW STUDENT PROPOSAL ====
 *****************************************************/
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

 /*****************************************************
 *   ==== REVIEW DOWENLOAD METADATA ====
 *****************************************************/
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

 /*****************************************************
 *   ==== UPDATE HEALTH FACILITY ====
 *****************************************************/
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

 /*****************************************************
 *   ==== FILTER HEALTH FACILITY ====
 *****************************************************/

app.get('/Facility-info',(req, res) =>{
    
  HealthFacilityMondel.find()
  .then(users => res.json(users))
  .catch(err => console.log(err))  
  })
   ///fetching file from reserch----------
app.get("/Facility-infoRumer", async (req, res) => {
  try {
    // You can filter by query, e.g. ?type=image
    const filter = {};
    if (req.query.HSubCity) filter.HFName = req.query.HSubCity;

    // Aggregation to remove duplicates based on email
    const uniqueFiles = await HealthFacilityMondel.aggregate([
      { $match: filter },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$HFName",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);

    res.json(uniqueFiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
  ////////////// fetching Vram with selection option /////////////

app.get('/Fetch-VRAM',(req, res) =>{
    
  VRAMMondel.find()
  .then(users => res.json(users))
  .catch(err => console.log(err))  
  })
//////////////////////////////////////Health Facility UPLOAD///////////////////
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
    ///fetching file from reserch----------
app.get("/fetching-option", async (req, res) => {
  try {
    // You can filter by query, e.g. ?type=image
    const filter = {};
    if (req.query.PI) filter.PI = req.query.PI;

    // Aggregation to remove duplicates based on email
    const uniqueFiles = await ResearchMondel.aggregate([
      { $match: filter },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$PIemail",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);

    res.json(uniqueFiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

    // app.get('/fetching-option',(req, res) =>{
    
    //     ResearchMondel.find()
    //     .then(users => res.json(users))
    //     .catch(err => console.log(err))  
    //     })


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


// const Image = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null,'./BanerImage');
//   },
//   filename: function (req, file, cb) {
//     cb(null,  Date.now() + path.extname(file.originalname));
//   },
// });
// // const upload = multer({ 
// //   storage: storage,
// //   limits: { fileSize: 10000000 } // 10MB limit
// // });

// // require("./model/imageDetails");

//  //const ImagesMondel  = mongoose.model("ImageDetails" )
// const uploadImag = multer({ storage: Image });// limits: { fileSize: 10000000 }  10MB limit
// 🔧 Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const Image = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


// require("./model/imageDetails");
// const ImagesMondel = mongoose.model("imageDetails");
const uploadImag = multer({ storage: Image });

app.post("/MainImage", uploadImag.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { Title, Description } = req.body;
  const {originalname} = req.file;

  const cloudinaryResponse = await cloudinary.uploader.upload(file, {
    folder: "BanerImage",
    resource_type: "auto"
  });
try {

  const savetoDb = await ImagesMondel.create({
    Title,
    Description,
    filename:originalname,
    public_id: cloudinaryResponse.public_id,
    imgUrl: cloudinaryResponse.secure_url,
  });
 
  res.send({ status: "ok" });
    } catch (error) {
      res.json({ status: error });
    }
});


// 📦 Configure Multer to use Cloudinary storage
// const Image = new CloudinaryStorage({
//     cloudinary,
//   params: {
//     folder: 'BanerImage',
//     allowed_formats: ['jpg', 'png', 'jpeg'],
//     //transformation: [{ width: 800, height: 800, crop: 'limit' }],
//   },
// });
// const uploadImag = multer({ Image });

// app.post("/MainImage", uploadImag.single("file"), async (req, res) => {
//  if (!req.file) {
//     return res.status(400).send('No file uploaded.');
//   }
//  try {
//     const result = await cloudinary.uploader.upload(req.file.path);
//     const image = new ImagesMondel({Title:result.Description, Description:result.Description, imageUrl: result.secure_url, imagePublicId: result.imagePublicId });
//     await image.save();
//     fs.unlinkSync(req.file.path); // remove local file
//     res.json(image);
//   } catch (err) {
//     res.status(500).json({ error: 'Upload failed' });
//   }
//});

//       const posts = new ImagesMondel({
//         Title,
//         Description,
//         imageUrl: req.file.path,
//         imagePublicId: req.file.filename,
//     });

//     const saved = await posts.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Upload failed' });
//   }
// });
    
//   const image = await ImagesMondel.create({Title:Title,Description:Description,filename:imagePublicId,path:imageUrl})
//   res.status(201).json(image);
//   //res.send({"msg":"image send"})
//    } catch (error){
//     res.send({"error":"unable to send the image"})
//   }
//   //  const imageUrl =`https://github.com/alembju/AACDMC/blob/main/BanerImage/${req.file.filename}`;
//   // const fileName = req.file.filename;
 
//   //   await ImagesMondel.create({Title:Title,Description:Description,url: imageUrl});
//   //   res.send({ status: "ok" });
//   // } catch (error) {
//   //   res.json({ status: error });
//   // }
// });

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
app.get('/Baner', async (req, res) => {
  try {
    const posts = await ImagesMondel.find().sort({ _id: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve posts' });
  }
});

// app.get('/images/:id', async (req, res) => {
//    const {id} = req.params
//   try {
//     const image = await ImagesMondel.findById({_id: id});
//     if (!image) {
//       return res.status(404).send('Image not found');
//     }
//     const imagepath = path.join(__dirname, "BanerImage" , image.filename)
//     res.send(imagepath)
//     //res.json(image); // Returns the image metadata including filename and URL
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to retrieve image' });
//   }
// });

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
 /*****************************************************
 *   ==== UPLOAD IMAGE FOR RESOLVE ====
 *****************************************************/
const ResolveImage = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/ResolveImage");
const ResolveImageMondel = mongoose.model("ResolveImage");
const ResolveImag = multer({ storage: ResolveImage });

app.post("/MainResolveImage", ResolveImag.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { ResolveImageTitle, ResolveImageDescription } = req.body;
  const {originalname} = req.file;

  const cloudinaryResolveImage = await cloudinary.uploader.upload(file, {
    folder: "ResolveImage",
    resource_type: "auto"
  });
try {

  const savetoDb = await ResolveImageMondel.create({
    ResolveImageTitle,
    ResolveImageDescription,
    filename:originalname,
    public_id: cloudinaryResolveImage.public_id,
    imgUrl: cloudinaryResolveImage.secure_url,
  });
 
  res.send({ status: "ok" });
    } catch (error) {
      res.json({ status: error });
    }
});

///////////////get image for Resolve  slide/////////
app.get("/get-ResolveImage", async (req, res) => {
  try {
    ResolveImageMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});
 /*****************************************************
 *   ==== UPLOAD NEWS FOR RESOLVE ====
 *****************************************************/

const ResolveNews = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/ResolveNews");
const ResolveNewsMondel = mongoose.model("ResolveNews");
const ResolveNewsMondelUpload = multer({ storage: ResolveNews });

app.post("/CreatResolveCards", ResolveNewsMondelUpload.single("Image"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { FrontResolveTitle, FrontDate,Resolvedescription } = req.body;
  const {originalname} = req.file;

  const cloudinaryResolveNews = await cloudinary.uploader.upload(file, {
    folder: "ResolveNews",
    resource_type: "auto"
  });
try {

  const savetoDb = await ResolveNewsMondel.create({
    FrontResolveTitle,
    FrontDate,
    Resolvedescription,
    filename:originalname,
    public_id: cloudinaryResolveNews.public_id,
    imgUrl: cloudinaryResolveNews.secure_url,
  });
 
  res.send({ status: "ok" });
    } catch (error) {
      res.json({ status: error });
    }
});

///fetching file from Cards ----------

app.get('/fetching-ResolveCards', async(req, res) =>{
    
  //ResearchMondel.find()
  const allUser = await ResolveNewsMondel.find({}).sort({createdAt: -1});
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

  
   /*****************************************************
 *   ==== GIF IMAGE FOR BOTTUM NEWS ====
 *****************************************************/
const GIF = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


 require("./model/GIF");
const GIFMondel = mongoose.model("GIF");
const uploadGIF = multer({ storage: GIF });

app.post("/GIF", uploadGIF.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { GIFTitle, GIFDescription } = req.body;
  const {originalname} = req.file;

  const cloudinaryGIF = await cloudinary.uploader.upload(file, {
    folder: "GIFImage",
    resource_type: "auto"
  });
try {

  const savetoDb = await GIFMondel.create({
    GIFTitle,
    GIFDescription,
    filename:originalname,
    public_id: cloudinaryGIF.public_id,
    imgUrl: cloudinaryGIF.secure_url,
  });
 
  res.send({ status: "ok" });
    } catch (error) {
      res.json({ status: error });
    }
});
/////////////////////////////////////get for cared bottum//////////
app.get("/get-GIFimage", async (req, res) => {
  try {
    GIFMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});
///////////////get GIF for insert image/////////
app.get('/getGIF', async (req, res) => {
  try {
    const posts = await GIFMondel.find().sort({ _id: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve posts' });
  }
});


 /*****************************************************
 *   ==== ABOTUS LEADERS PHOTO UPLOAD ====
 *****************************************************/
const AbotUs = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


 require("./model/AbotUs");
 const AbotUsMondel = mongoose.model("AbotUs");
const AbotUsImag = multer({ storage: AbotUs });

app.post("/AbotUs", AbotUsImag.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { Position, Education } = req.body;
  const {originalname} = req.file;

  const cloudinaryAbotUs = await cloudinary.uploader.upload(file, {
    folder: "AbotUs",
    resource_type: 'auto'
  });

  const savetoDb = await AbotUsMondel.create({
    Position,
    Education,
    filename:originalname,
    public_id: cloudinaryAbotUs.public_id,
    imgUrl: cloudinaryAbotUs.secure_url,
  });
 try {
  res.send({ status: "ok" });
    } catch (error) {
      res.json({ status: error });
    }
});
///////////////get image for Photo slide/////////
app.get("/get-Director", async (req, res) => {
  try {
    AbotUsMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

////////////////////////Delet Banner/////////////////////////////
 app.delete('/deletDirector/:id',(req, res) =>{
  const id = req.params.id;
  AbotUsMondel.findByIdAndDelete({_id: id})
  .then(res => res.json(res))
  .catch(err => res.json(err))
  })
///////////////get image for Photo slide/////////
////////////////////////////////////Abot Operation Photo///////////
const Operation = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


 require("./model/Operation");
 const OperationMondel = mongoose.model("Operation");
const OperationImag = multer({ storage: Operation });

app.post("/Operation", OperationImag.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { OPosition,OEducation } = req.body;
  const {originalname} = req.file;

  const cloudinaryOperation = await cloudinary.uploader.upload(file, {
    folder: "Operation",
    resource_type: "auto"
  });

  const savetoDb = await OperationMondel.create({
    OPosition,
    OEducation,
    filename:originalname,
    public_id: cloudinaryOperation.public_id,
    imgUrl: cloudinaryOperation.secure_url,
  });
 try {
  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});
app.get("/get-Operation", async (req, res) => {
  try {
    OperationMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});
////////////////////////Delet Operation/////////////////////////////
 app.delete('/deletOperation/:id',(req, res) =>{
  const id = req.params.id;
  OperationMondel.findByIdAndDelete({_id: id})
  .then(res => res.json(res))
  .catch(err => res.json(err))
  })
///////////////get image for Photo slide/////////
////////////////////////////////////Abot Us Planning Photo///////////
const Planning = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


 require("./model/Planning");
 const PlanningMondel = mongoose.model("Planning");
const PlanningImag = multer({ storage: Planning });

app.post("/Planning", PlanningImag.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { PPosition, PEducation } = req.body;
  const {originalname} = req.file;

  const cloudinaryPlanning = await cloudinary.uploader.upload(file, {
    folder: "Planning",
    resource_type: "auto"
  });

  const savetoDb = await PlanningMondel.create({
    PPosition,
    PEducation,
    filename:originalname,
    public_id: cloudinaryPlanning.public_id,
    imgUrl: cloudinaryPlanning.secure_url,
  });
 try {
  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});
app.get("/get-Planning", async (req, res) => {
  try {
    PlanningMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

////////////////////////////////////Abot Us Top Ledere Photo///////////
const TopLeders = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


 require("./model/TopLeders");
 const TopLedersMondel = mongoose.model("TopLeders");
const TopLedersImag = multer({ storage: TopLeders });

app.post("/TopLeders", TopLedersImag.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { TPosition, TEducation } = req.body;
  const {originalname} = req.file;

  const cloudinaryTopLeders = await cloudinary.uploader.upload(file, {
    folder: "TopLeders",
    resource_type: "auto"
  });

  const savetoDb = await TopLedersMondel.create({
    TPosition,
    TEducation,
    filename:originalname,
    public_id: cloudinaryTopLeders.public_id,
    imgUrl: cloudinaryTopLeders.secure_url,
  });
 try {
  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});
app.get("/get-TopLeders", async (req, res) => {
  try {
    TopLedersMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});
////////////////////////Delet Top leader/////////////////////////////
 app.delete('/deletTopLeders/:id',(req, res) =>{
  const id = req.params.id;
  TopLedersMondel.findByIdAndDelete({_id: id})
  .then(res => res.json(res))
  .catch(err => res.json(err))
  })
////////////////////////Delet Banner/////////////////////////////
 app.delete('/deletPlanning/:id',(req, res) =>{
  const id = req.params.id;
  PlanningMondel.findByIdAndDelete({_id: id})
  .then(res => res.json(res))
  .catch(err => res.json(err))
  })
///////////////get User name for nav bar/////////
app.get('/get-UserName/:id', (req, res) => {
  const id = req.params.id
  User_Login.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})


// Seed database (visit this URL once)
app.get('/seed', async (req, res) => {
  await Component.deleteMany({});
  await Component.insertMany([
    { name: "Navbar", description: "Top navigation bar component" },
    { name: "Footer", description: "Bottom footer component" },
    { name: "Sidebar", description: "Left sidebar navigation" },
    { name: "Card", description: "Reusable card UI component" },
    { name: "Button", description: "Interactive button component" }
  ]);
  res.send("Components seeded.");
});

// Search endpoint
app.get('/search', async (req, res) => {
  const q = req.query.q || '';
  try {
    const results = await Component.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed.' });
  }
});


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
// app.get("/fetching-Rech", async (req, res) => {
//    try {
//     // You can filter by query, e.g. ?type=image
//     const filter = {};
//     if (req.query.PI) filter.PI = req.query.PI;

//     // Aggregation to remove duplicates based on email
//     const uniqueFiles = await ResearchMondel.aggregate([
//       { $match: filter },
//       { $sort: { createdAt: 1 } },
//       {
//         $group: {
//           _id: "$PIemail",
//           doc: { $first: "$$ROOT" }
//         }
//       },
//       { $replaceRoot: { newRoot: "$doc" } }
//     ]);
    
//   const page = parseInt(req.query.page) || 1;
// const limit = parseInt(req.query.limit) || 10;

//   const startIndex = (page - 1) * limit
//   const lastIndex = (page) * limit

//   const results = {}
//   results.totalUser=uniqueFiles.length;
//   results.pageCount=Math.ceil(uniqueFiles.length/limit);

//   if (lastIndex < uniqueFiles.length) {
//     results.next = {
//       page: page + 1,
//     }
//   }
//   if (startIndex > 0) {
//     results.prev = {
//       page: page - 1,
//     }
//   }
//   results.result = uniqueFiles.slice(startIndex, lastIndex);
//   res.json(results)
//     //.then(user => res.json(user))
//     //.catch(err => console.log(err))  
//     ///passswpred---------invg pgzi yrbs qntc----
//     } catch (err) {
//     console.error("Error fetching research:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
// ✅ Default route
app.get("/", (req, res) => {
  res.send("MERN Signup API running...");
});

// ✅ Register API (POST)
 /*****************************************************
 *   ==== REGISTER API FOR BLOGING IN RESERCH ====
 *****************************************************/
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, fatherName, email, phone, birthday, gender, password } = req.body;

    // Validate fields
    if (!name || !fatherName || !email || !phone || !birthday || !gender || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await SignupFormBlog.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new SignupFormBlog({
      name,
      fatherName,
      email,
      phone,
      birthday,
      gender,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({
      message: "🎉 User registered successfully!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ LOGIN Route
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await SignupFormBlog.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Create JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "2h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
//////////////////////////////////fetchinf reserch for reserch unit//////////
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

 /*****************************************************
 *   ==== EMAIL FOR RESERCH UNIT====
 *****************************************************/
const Esend = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

require("./model/Esend");
const EsendModel = mongoose.model("Esend");

const attached = multer({ storage: Esend });

app.post("/Esend", attached.single("file"), async (req, res) => {
  try {
    const { PrincipalI, Title, email, messages, Statua } = req.body;

    // File path from multer
    const filePath = req.file.path;

    // Upload file to Cloudinary
    const cloudinaryEsend = await cloudinary.uploader.upload(filePath, {
      folder: "attached",
      resource_type: "auto",
    });

    // Save data to MongoDB
    const savetoDb = await EsendModel.create({
      PrincipalI,
      Title,
      email,
      messages,
      Statua,
      filename: req.file.originalname,
      public_id: cloudinaryEsend.public_id,
      imgUrl: cloudinaryEsend.secure_url,
    });

    console.log("Saved:", savetoDb);

    // Configure email transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Send email with attachment from Cloudinary
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: Title,
      html: `
        <p><b>Principal Investigator:</b> ${PrincipalI}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${Title}</p>
        <p><b>Message:</b> ${messages}</p>
        <p><b>Status:</b> ${Statua}</p>
      `,
      attachments: [
        {
          filename: req.file.originalname,
          path: cloudinaryEsend.secure_url, // Attach file from Cloudinary URL
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.send({ status: "ok", message: "Email sent and file saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: error.message });
  }
});
//   app.get("/get-Esend", async (req, res) => {
//   try {
//     EsendMondel.find({}).sort({createdAt: -1}).then((data) => {
//       res.send({ status: "ok", data: data });
//     });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });  
//fetching file from Cards ----------

app.get('/get-Esend', async(req, res) =>{
    
  //ResearchMondel.find()
  const allUser = await EsendModel.find({}).sort({createdAt: -1});
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
//////Homepage SearchPage/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const SearchPage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./ActiveSearch");
  },
  IRBUploadfilename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

require("./model/Page");
const PageMondel = mongoose.model("Page");
const SearchPagestorage = multer({ storage: SearchPage });

app.post("/SerchPage", SearchPagestorage.single("file"), async (req, res) => {
  console.log(req.file);
  const name = req.body.name;
  const route = req.body.route;
  try {
    await PageMondel.create({name:name, route: route});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


  // Search endpoint
app.get('/api/search', async (req, res) => {
  const q = req.query.q || '';
  const regex = new RegExp('^' + q, 'i'); // Match from start

  try {
    const results = q
      ? await PageMondel.find({ name: regex }).limit()
      : await PageMondel.find().limit(); // Default results
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});


 /*****************************************************
 *   ==== CONTACT US EMAIL ====
 *****************************************************/
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


 /*****************************************************
 *   ==== RUMER EMAIL ====
 *****************************************************/
const EmailRummer = multer.diskStorage({
  destination:function(req, file, cb){
      cb(null,('./EmailRummer'));
  },
  filename:function(req,file,cb){
      const name = Date.now()+'-'+file.originalname;
      cb(null,name);
  }
});

const Rummer = multer({ Emailstorage:EmailRummer });
const transportersRummer = nodemailer.createTransport({
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
app.post("/Rummer", Rummer.single("email"), async(req, res) =>{
  const { Rummer,RSubCity, Woreda,Place, RType} = req.body;
  const file= req.file;
  console.log(Rummer,RSubCity,Woreda,Place,RType,file);

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to:  "alem845070@gmail.com",
    subject: Rummer,
    text: Place,
    html: `<p>Place:${Place}</p><p>Subcity:${RSubCity}</p><p>Woreda:${Woreda}</p><p>Phon Number: ${RType}</p>`,
    attachement:  [
      {   
       filename: file,
       
      }
  ]
  };
  await transportersRummer.sendMail(mailOptions, function(error, info){
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


 /*****************************************************
 *   ==== UPLOADING ADDIS ABABA DATAMANGEMENT CENTER RTD  ====
 *****************************************************/
const storage = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Register");

const RegisterMondel  = mongoose.model("register" )
const upload = multer({ storage: storage ,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5 MB limit
  });

app.post("/upload", upload.array("files", 10), async (req, res) => {
  try {
    console.log("📩 Received files:", req.files?.map(f => f.originalname));
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
 const {orgname,Title,principal,phone,dsharing,availability,coverage,BGDate,LDate,gender,type,raw,cleaned,urlLink,comments,email} = req.body;

  const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "upload" },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(fileBuffer);
      });
    };

  
 const results = [];
  for (let file of req.files) {
  const uploaded = await streamUpload(file.path);
  console.log("✅ Cloudinary uploaded:", uploaded.secure_url);
  const savedFile = await RegisterMondel.create({
    orgname,
    Title,
    principal,
    phone,
    dsharing,
    availability,
    coverage,
    BGDate,
    LDate,
    gender,
    type,
    raw,
    cleaned,
    urlLink,
    comments,
    email,
    public_id: uploaded.public_id,
    url: uploaded.secure_url,
    original_filename: uploaded.original_filename,
    format: uploaded.format,
   });
      results.push(savedFile);
    }

   res.json({ message: "Uploaded & saved successfully", files: results });
  } catch (err) {
    console.error("❌ Upload error (server):", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});
// app.get("/get-upload", async (req, res) => {
//   try {
//     RegisterMondel.find({}).sort({createdAt: -1}).then((data) => {
//       res.send({ status: "ok", data: data });
//     });
//   } catch (error) {}
// });
 app.get('/get-upload',(req, res) =>{
    
    RegisterMondel.find({}).sort({createdAt: -1})
    .then(users => res.json(users))
    .catch(err => console.log(err))  
    })

    app.get("/get-uploadView", async (req, res) => {
  try {
    RegisterMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
//multer------------------------------------------------------------
//const multer = require("multer");
// const storage = multer.diskStorage({
//   // destination: './public/uploads',
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });



// require("./model/Register");

// const RegisterMondel  = mongoose.model("register" )
// const upload = multer({ storage: storage });

// app.post("/upload", upload.single("file"), async (req, res) => {
//   //  console.log("This is my file ",req.file)
//   const file = req.file.path;
//   const {orgname,title,principal,phone,dsharing,availability,coverage,BGDate,LDate,gender,type,raw,cleaned,url,comments,email} = req.body;
//   const {originalname} = req.file;

//   const cloudinaryupload = await cloudinary.uploader.upload(file, {
//     folder: "upload",
//      resource_type: "auto"
//   });
// try {
//   const savetoDb = await RegisterMondel.create({
//     orgname,
//     title,
//     principal,
//     phone,
//     dsharing,
//     availability,
//     coverage,
//     BGDate,
//     LDate,
//     gender,
//     type,
//     raw,
//     cleaned,
//     url,
//     comments,
//     email,
//     filename: originalname,
//     public_id: cloudinaryupload.public_id,
//     imgUrl: cloudinaryupload.secure_url,
//   });

//   res.send({ status: "ok" });
// } catch (error) {
//   res.json({ status: error });
// }
// });

// app.get("/get-OutbreakI", async (req, res) => {
//   try {
//     RegisterMondel.find({}).sort({createdAt: -1}).then((data) => {
//       res.send({ status: "ok", data: data });
//     });
//   } catch (error) {}
// });



//multer------------------------------------------------------------
//const multer = require("multer");



 /*****************************************************
 *   ==== UPLOADING DATA COLLECTION PROGRESS ====
 *****************************************************/
// Multer storage config
const DataCollectionP = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./DataCollectionP");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null,uniqueSuffix +  file.originalname);
  },
});

require("./model/DataCollectionP");

const DataCollectionPMondel = mongoose.model("DataCollectionP" )
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

  const Additiona3DC = req.body.Additiona3DC;
  const StudyA3 = req.body.StudyA3;
  const NameContactP3 = req.body.NameContactP3;
  const CPhone3 = req.body.CPhone3;
  const Additiona4DC = req.body.Additiona4DC;
  const StudyA4 = req.body.StudyA4;
  const NameContactP4 = req.body.NameContactP4;
  const CPhone4 = req.body.CPhone4;
  const Additiona5DC = req.body.Additiona5DC;
  const StudyA5 = req.body.StudyA5;
  const NameContactP5 = req.body.NameContactP5;
  const CPhone5 = req.body.CPhone5;

  const DStart = req.body.DStart;
  const DTermination = req.body.DTermination;
  

  try {
    await DataCollectionPMondel.create({Name:Name,PhonePI:PhonePI,email:email,title:title,NUniversity:NUniversity,DataC:DataC,StudyA1:StudyA1,NameContactP1:NameContactP1,CPhone1:CPhone1,AdditionalDC:AdditionalDC,StudyA2:StudyA2,NameContactP2:NameContactP2,CPhone2:CPhone2,Additiona3DC:Additiona3DC,StudyA3:StudyA3,NameContactP3:NameContactP3,CPhone3:CPhone3,Additiona4DC:Additiona4DC,StudyA4:StudyA4,NameContactP4:NameContactP4,CPhone4:CPhone4,Additiona5DC:Additiona5DC,StudyA5:StudyA5,NameContactP5:NameContactP5,CPhone5:CPhone5, DStart:DStart,DTermination:DTermination});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-CoRegistration", async (req, res) => {
  try {
    DataCollectionPMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});



// POST route to save multiple forms
app.post("/api/forms", async (req, res) => {
  try {
    const forms = req.body; // array of objects
    const savedForms = await Form.insertMany(forms);
    res.json({ message: "Forms saved successfully", savedForms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/*app.get("/get-files", async (req, res) => {
  try {
    RegisterMondel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});*/
////////////////////////////////////DataCollectionc///////////
// const DataCollectionC = multer.diskStorage({
//   // destination: './public/uploads',
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });


//  require("./model/DataCollectionC");

// const DataCollectionCMondel  = mongoose.model("DataCollectionC" )
// const DataCollectionCupload = multer({ storage: DataCollectionC });

// app.post("/DataCollectionC", DataCollectionCupload.single("file"), async (req, res) => {
//   //  console.log("This is my file ",req.file)
//   const file = req.file.path;
//   const {Name,PhonePI,email,title,NUniversity,Nadvisor,phone,PIemail,Grade,submitted} = req.body;
//   const {originalname} = req.file;

//   const cloudinaryDataCollectionC = await cloudinary.uploader.upload(file, {
//     folder: "DataCollectionC",
//   });

//   const savetoDb = await DataCollectionCMondel.create({
//     Name,
//     PhonePI,
//     email,
//     title,
//     NUniversity,
//     Nadvisor,
//     phone,
//     PIemail,
//     Grade,
//     submitted,
//     filename:originalname,
//     public_id: cloudinaryDataCollectionC.public_id,
//     imgUrl: cloudinaryDataCollectionC.secure_url,
//   });
//  try {
//   res.send({ status: "ok" });
// } catch (error) {
//   res.json({ status: error });
// }
// });
////////////////////////////////////DataCollectionc///////////
const DataCollectionC = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


 require("./model/DataCollectionC");

const DataCollectionCMondel  = mongoose.model("DataCollectionC" )
const DataCollectionCupload = multer({ storage: DataCollectionC });


app.post("/DataCollectionC", DataCollectionCupload.array("files", 10), async (req, res) => {
  try {
    console.log("📩 Received files:", req.files?.map(f => f.originalname));
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
 const {Name,PhonePI,email,title,NUniversity,Nadvisor,phone,PIemail,Grade,submitted} = req.body;
  // const {originalname} = req.file;
  

  const uploadedFiles = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "auto", folder: "DataCollectionC"
      });

      // ✅ Save to MongoDB
      const savedFile = await DataCollectionCMondel.create({
        Name,
        PhonePI,
        email,
        title,
        NUniversity,
        Nadvisor,
        phone,
        PIemail,
        Grade,
        submitted,
        public_id: result.public_id,
        secure_url: result.secure_url,
        original_filename: file.originalname,
        format: result.format,
      });

      uploadedFiles.push(savedFile);

      // ✅ Remove file from local storage after uploading
      fs.unlinkSync(file.path);
    }

   res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

//multer------------------------------------------------------------
//const multer = require("multer");

// const Request = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./Images");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     cb(null, uniqueSuffix + file.originalname);
//   },
// });

// require("./model/RequestList");

// const RequestMondel  = mongoose.model("Requests" )
// const REQupload = multer({ storage: Request });

// app.post("/file-Request", REQupload.single("file"), async (req, res) => {
//   console.log(req.file);
//   const Name = req.body.Name;
//   const phone = req.body.phone;
//   const emaill = req.body.emaill;
//   const Title = req.body.Title;
//   const Reaseon = req.body.Reaseon;
//   const Affiliation = req.body.Affiliation;
//   const email = req.body.email;
//   const messages = req.body.messages;
//   const isCheked = req.body.isCheked;
  
//   try {
//     await RequestMondel.create({Name:Name,phone:phone,emaill:emaill,Title:Title,Reaseon:Reaseon,Affiliation:Affiliation,email:email,messages:messages,isCheked:isCheked});
//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });

 /*****************************************************
 *   ==== UPLOADING FILE REQUEST  ====
 *****************************************************/
const Request = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/RequestList");

const RequestMondel  = mongoose.model("Requests" )
const REQupload = multer({ storage: Request  ,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5 MB limit
  });

app.post("/file-Request", REQupload.single("file"), async (req, res) => {
  try {
    console.log("📩 Received files:", req.files?.map(f => f.originalname));
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
 const {Name,phone,emaill,Title,Reaseon,Affiliation,email,messages,isCheked} = req.body;

  const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "RequestList" },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(fileBuffer);
      });
    };

  
 const results = [];
  for (let file of req.files) {
  const uploaded = await streamUpload(file.path);
  console.log("✅ Cloudinary uploaded:", uploaded.secure_url);
  const savedFile = await RequestMondel.create({
    Name,
    phone,
    emaill,
    Title,
    Reaseon,
    Affiliation,
    email,
    messages,
    isCheked,
    public_id: uploaded.public_id,
    url: uploaded.secure_url,
    original_filename: uploaded.original_filename,
    format: uploaded.format,
   });
      results.push(savedFile);
    }

   res.json({ message: "Uploaded & saved successfully", files: results });
  } catch (err) {
    console.error("❌ Upload error (server):", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
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

 /*****************************************************
 *   ==== UPLOADING MEASELES FILE ====
 *****************************************************/

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


 /*****************************************************
 *   ==== UPLOADING MALARIYA FILE ====
 *****************************************************/

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

 /*****************************************************
 *   ==== UPLOADING RELAPSING FEVER FILE ====
 *****************************************************/

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

 /*****************************************************
 *   ==== UPLOADING AFI FILE ====
 *****************************************************/

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


 /*****************************************************
 *   ==== UPLOADING PRENATAL FILE ====
 *****************************************************/

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


 /*****************************************************
 *   ==== UPLOADING FISTULA FILE ====
 *****************************************************/

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


 /*****************************************************
 *   ==== UPLOADING RABIS FILE ====
 *****************************************************/

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



 /*****************************************************
 *   ==== UPLOADING YELLOW FEVER FILE ====
 *****************************************************/

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


 /*****************************************************
 *   ==== UPLOADING MATERNAL FILE ====
 *****************************************************/

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



 /*****************************************************
 *   ==== UPLOADING CHOLERA FILE ====
 *****************************************************/

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
 /*****************************************************
 *   ==== DATA COLLECTION PROGRESS IN TO CLOUDINARY ====
 *****************************************************/
const ResearchM = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Research");

const ResearchMondel = mongoose.model("Researchs" )
const ResearchStor = multer({ storage: ResearchM ,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  });

app.post("/ResearchP", ResearchStor.array("files", 10), async (req, res) => {
  try {
    console.log("📩 Received files:", req.files?.map(f => f.originalname));
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
  const { NCollege,Department,TDepartment,StudyF,Nadvisor,email,phone,PI,PIPhone,PIemail,Title,FocusA,SPeriodB,SPeriodE,ConductS,Rmethods,Study,Design,TDesign,geographicA,TGeographicA,Slocation,Gender,TGender,populations,MicroD,Eelectronically,Tools,Tcollection,TTcollection,Budget,Geocoordinate,Groups,Dsharing,selectedChoices,Reasons,NewColl } = req.body;

  const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "ReserchProposal" },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(fileBuffer);
      });
    };

  
 const results = [];
  for (let file of req.files) {
  const uploaded = await streamUpload(file.path);
  console.log("✅ Cloudinary uploaded:", uploaded.secure_url);
  const savedFile = await ResearchMondel.create({
    NCollege,
    Department,
    TDepartment,
    StudyF,
    Nadvisor,
    email,
    phone,
    PI,
    PIPhone,
    PIemail,
    Title,
    FocusA,
    SPeriodB,
    SPeriodE,
    ConductS,
    Rmethods,
    Study,
    Design,
    TDesign,
    geographicA,
    TGeographicA,
    Slocation,
    Gender,
    TGender,
    populations,
    MicroD,
    Eelectronically,
    Tools,
    Tcollection,
    TTcollection,
    Budget,
    Geocoordinate,
    Groups,
    Dsharing,
    selectedChoices,
    Reasons,
    NewColl,
    public_id: uploaded.public_id,
    url: uploaded.secure_url,
    original_filename: uploaded.original_filename,
    format: uploaded.format,
   });
      results.push(savedFile);
    }

   res.json({ message: "Uploaded & saved successfully", files: results });
  } catch (err) {
    console.error("❌ Upload error (server):", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

//////Homepage LabGuidlines/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
// const ResearchM = multer.diskStorage({
//   // destination: './public/uploads',
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });


// require("./model/Research");

// const ResearchMondel = mongoose.model("Researchs" )
// const ResearchStor = multer({ storage: ResearchM ,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
//   });
// // const MultipleUploadStorage = multer({ storage: TestMultipleUpload });

// app.post("/ResearchP", ResearchStor.array("file", 10), async (req, res) => {
//   try {
//     console.log("📩 Received files:", req.files?.map(f => f.originalname));
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No files uploaded" });
//     }
//   const { NCollege,Department,TDepartment,StudyF,Nadvisor,email,phone,PI,PIPhone,PIemail,Title,FocusA,SPeriodB,SPeriodE,ConductS,Rmethods,Study,Design,TDesign,geographicA,TGeographicA,Slocation,Gender,TGender,populations,MicroD,Eelectronically,Tools,Tcollection,TTcollection,Budget,Geocoordinate,Groups,Dsharing,selectedChoices,Reasons,NewColl } = req.body;
//   // const {originalname} = req.file;
  

//   const uploadedFiles = [];
//     for (const file of req.files) {
//       const result = await cloudinary.uploader.upload(file.path, {
//         resource_type: "auto", folder: "ReserchProposal"
//       });

//       // ✅ Save to MongoDB
//       const savedFile = await ResearchMondel.create({
//         NCollege,
//         Department,
//         TDepartment,
//         StudyF,
//         Nadvisor,
//         email,
//         phone,
//         PI,
//         PIPhone,
//         PIemail,
//         Title,
//         FocusA,
//         SPeriodB,
//         SPeriodE,
//         ConductS,
//         Rmethods,
//         Study,
//         Design,
//         TDesign,
//         geographicA,
//         TGeographicA,
//         Slocation,
//         Gender,
//         TGender,
//         populations,
//         MicroD,
//         Eelectronically,
//         Tools,
//         Tcollection,
//         TTcollection,
//         Budget,
//         Geocoordinate,
//         Groups,
//         Dsharing,
//         selectedChoices,
//         Reasons,
//         NewColl,
//         public_id: result.public_id,
//         secure_url: result.secure_url,
//         original_filename: file.originalname,
//         format: result.format,
//       });

//       uploadedFiles.push(savedFile);

//       // ✅ Remove file from local storage after uploading
//       fs.unlinkSync(file.path);
//     }

//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });

// Fetch all uploaded file info
app.get("/files", async (req, res) => {
  try {
    const files = await ResearchMondel.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch files" });
  }
});

// //multer------------------------------------------------------------
// //const multer = require("multer");

// const ResearchM = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./ReserchProposal");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     cb(null,uniqueSuffix +  file.originalname);
//   },
// });

// require("./model/Research");

// const ResearchMondel = mongoose.model("Researchs" )
// const ResearchStor = multer({ storage: ResearchM });

// app.post("/ResearchP", ResearchStor.single("file"), async (req, res) => {
//   console.log(req.file);
//   const NCollege = req.body.NCollege;
//   const Department = req.body.Department;
//   const StudyF = req.body.StudyF;
//   const Nadvisor = req.body.Nadvisor;
//   const email = req.body.email;
//   const phone = req.body.phone;
//   const PI = req.body.PI;
//   const PIPhone = req.body.PIPhone;
//   const PIemail = req.body.PIemail;
//   const Title = req.body.Title;
//   const FocusA = req.body.FocusA;
//   const SPeriodB = req.body.SPeriodB;
//   const SPeriodE = req.body.SPeriodE;
//   const ConductS = req.body.ConductS;
//   const Rmethods = req.body.Rmethods;
//   const Study = req.body.Study;
//   const Design = req.body.Design;
//   const geographicA = req.body.geographicA;
//   const Slocation = req.body.Slocation;
//   const Gender = req.body.Gender;
//   const populations = req.body.populations;
//   const MicroD = req.body.MicroD;
//   const Eelectronically = req.body.Eelectronically;
//   const Tools = req.body.Tools;
//   const Tcollection = req.body.Tcollection;
//   const Budget = req.body.Budget;
//   const Geocoordinate = req.body.Geocoordinate;
//   const Groups = req.body.Groups;
//   const Dsharing = req.body.Dsharing;
//   const Reasons = req.body.Reasons;
//   const ResearchfileName = req.file.filename;
//   try {
//     await ResearchMondel.create({NCollege:NCollege,Department:Department,StudyF:StudyF,Nadvisor:Nadvisor,email:email,phone:phone,PI:PI,PIPhone:PIPhone,PIemail:PIemail,Title:Title,FocusA:FocusA,SPeriodB:SPeriodB,SPeriodE:SPeriodE,ConductS:ConductS,Rmethods:Rmethods,Study:Study,Design:Design,geographicA:geographicA,Slocation:Slocation,Gender:Gender,populations:populations,MicroD:MicroD,Eelectronically:Eelectronically,Tools:Tools,Tcollection:Tcollection,Budget:Budget,Geocoordinate:Geocoordinate,Groups:Groups,Dsharing:Dsharing,Reasons:Reasons, pdf:ResearchfileName });
//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });

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
    const singleMeasel= ResearchMondel.find().or([{StudyF:"Other"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(singleMeasel)
    });
  } catch (error) {}
});
app.get("/Gete-Qualitative", async (req, res) => {
  try {
    const Qualitative= ResearchMondel.find().or([{Rmethods:"Qualitative"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Qualitative)
    });
  } catch (error) {}
});
app.get("/Gete-Quantitative", async (req, res) => {
  try {
    const Quantitative= ResearchMondel.find().or([{Rmethods:"Quantitative"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Quantitative)
    });
  } catch (error) {}
});
app.get("/Gete-Mixed", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{Rmethods:"Mixed"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-National", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"National"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});

app.get("/Gete-Region", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"Region | City"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-SubCity", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"Zone | Sub City"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Woreda", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"Woreda"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Kebele", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"Kebele"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Program", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"Program/research implementation woreda or kebele"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Departmental", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"Departmental"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Facility", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"Facility"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Global", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"Global"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-NotRepresentative", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"Not representative"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Others", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{geographicA:"Others"}]).countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Electronic", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{Eelectronically:"yes"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-NoElectronic", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{Eelectronically:"No"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Access", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{Dsharing:"Open access"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Request", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{Dsharing:"Accessible upon request"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
app.get("/Gete-Notaccessible", async (req, res) => {
  try {
    const Mixed= ResearchMondel.find().or([{Dsharing:"Not accessible"}]) .countDocuments().then((data) => {
      res.send({ status: "ok", data: data });
      console.log(Mixed)
    });
  } catch (error) {}
});
 ////////////////////////////fetchinf Student proposal for reserch dashbored////////////
        app.get("/ProposalSubmit", async (req, res) => {
          let query = {};
          const searchData = req.query.search;
          if (searchData) {
            query = {
              $or: [
                { Rmethods: { $regex: searchData, $options: "i" } },
                { Design: { $regex: searchData, $options: "i" } },
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

        
 /*****************************************************
 *   ==== UPLOADING MENINGITSM FILE ====
 *****************************************************/

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
// Multer storage config
const CoRegistrationStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./CoRegistration");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null,uniqueSuffix +  file.originalname);
  },
});

require("./model/CoRegistration");

const CoRegistrationModel = mongoose.model("CoRegistration" )
const CoRegistrationUpload = multer({ storage: CoRegistrationStorage });

app.post("/CoRegistration", CoRegistrationUpload.single("file"), async (req, res) => {
  console.log(req.file);
  const NCollege = req.body.NCollege;
  const informationF = req.body.informationF;
  const Name = req.body.Name;
  const Educational = req.body.Educational;
  const Specialization = req.body.Specialization;
  const email = req.body.email;
  const phone = req.body.phone;
  const Advisory = req.body.Advisory;
  const Departments = req.body.Departments;
  const TDepartments = req.body.TDepartments;
  const IRBPhone = req.body.IRBPhone;
  const IRBEmail = req.body.IRBEmail;
  const EstablishedDate = req.body.EstablishedDate;
  const RenewedDate = req.body.RenewedDate;
  const Number = req.body.Number;
  const Renewal = req.body.Renewal;
  const Dual = req.body.Dual;

  try {
    await CoRegistrationModel.create({NCollege:NCollege,informationF:informationF,Name:Name,Educational:Educational,Specialization:Specialization,email:email,phone:phone,Advisory:Advisory,Departments:Departments,TDepartments:TDepartments,IRBPhone:IRBPhone,IRBEmail:IRBEmail,EstablishedDate:EstablishedDate,RenewedDate:RenewedDate,Number:Number,Renewal:Renewal,Dual:Dual});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-CoRegistration", async (req, res) => {
  try {
    CoRegistrationModel.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

// const CoRegistrationStorage = multer.diskStorage({
//   // destination: './public/uploads',
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });

// const CoRegistrationUpload = multer({ storage: CoRegistrationStorage });

// // Load Mongoose model
// require("./model/CoRegistration");
// const CoRegistrationModel = mongoose.model("CoRegistration");

// // Express POST route
// app.post("/CoRegistration", CoRegistrationUpload.single("file"), async (req, res) => {
//   try {
//     const file = req.file?.path;
//     const { originalname } = req.file || {};

//     if (!file) {
//       return res.status(400).json({ status: "error", message: "No file uploaded." });
//     }

//     const {
//       NCollege,
//       informationF,
//       Name,
//       Educational,
//       Specialization,
//       email,
//       phone,
//       Advisory,
//       Departments,
//       TDepartments,
//       IRBPhone,
//       IRBEmail,
//       EstablishedDate,
//       RenewedDate,
//       Number,
//       Renewal,
//       Dual
//     } = req.body;

//     // Validate inputs
//     if (!email || !Name || !phone || !NCollege) {
//       return res.status(400).json({ status: "error", message: "Missing required fields" });
//     }

//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({ status: "error", message: "Invalid email format" });
//     }

//     // Check for existing registration by email
//     const existing = await CoRegistrationModel.findOne({ email });
//     if (existing) {
//       return res.json({ status: "error", message: "Already have an account" });
//     }

  

//     // Save new registration to MongoDB
//     await CoRegistrationModel.create({
//       NCollege,
//       informationF,
//       Name,
//       Educational,
//       Specialization,
//       email,
//       phone,
//       Advisory,
//       Departments,
//       TDepartments,
//       IRBPhone,
//       IRBEmail,
//       EstablishedDate,
//       RenewedDate,
//       Number,
//       Renewal,
//       Dual,
//       filename: originalname,
//       public_id: cloudinaryUpload.public_id,
//       imgUrl: cloudinaryUpload.secure_url,
//     });

//      res.send({ status: "ok" });
//   } catch (error) {
//    console.error("Error in /CoRegistration:", error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// });



//     res.json({ status: "ok", message: "Successfully registered" });

//   } catch (error) {
//     console.error("Error in /CoRegistration:", error);
//     res.status(500).json({ status: "error", message: error.message });
//   }
// });

// //////CoRegistration/////////////////////////////////////////////////////////
// app.post("/CoRegistration" ,(req, res) => {
//     const{NCollege,informationF,Name,Educational,Specialization,email,phone,Advisory,Departments,TDepartments,IRBPhone,IRBEmail,EstablishedDate,RenewedDate,Number,Renewal,Dual} = req.body
//     CoRegistrationMondel.findOne({email: email})
//     .then(user => {
//         if(user){
//         res.json("Already have an account")}
//         else{
//             CoRegistrationMondel.create({NCollege:NCollege,informationF:informationF,Name:Name,Educational:Educational,Specialization:Specialization,email:email,phone:phone,Advisory:Advisory,Departments:Departments,TDepartments:TDepartments,IRBPhone:IRBPhone,IRBEmail:IRBEmail,EstablishedDate:EstablishedDate,RenewedDate:RenewedDate,Number:Number,Renewal:Renewal,Dual:Dual})
//             .then(result => res.json("Account created"))
//             .catch(err => res.json("error"))
//         }
    
// }).catch(err => res.json(err))

// })
//////IRBUpload/////////////////////////////////////////////////////////
 
 

  /*****************************************************
 *   ==== FINAL RESERCH PAPER SUBMITION ====
 *****************************************************/

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
const Colledge = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./Colledge");
    },
    Colledgefilename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + file.originalname);
    },
  });
  
  require("./model/Colledge");
  const ColledgeMondel = mongoose.model("Colledge");
  const ColledgeStorage = multer({ storage: Colledge });
  
  app.post("/CreatCollName", ColledgeStorage.single("file"), async (req, res) => {
    console.log(req.file);
    const CollName = req.body.CollName;
  //  const BulletinfileName = req.file.filename;
    try {
      await ColledgeMondel.create({CollName:CollName });
      res.send({ status: "ok" });
    } catch (error) {
      res.json({ status: error });
    }
  });
  app.get('/ColledgeList',(req, res) =>{
    
    ColledgeMondel.find({}).sort({createdAt: -1})
    .then(users => res.json(users))
    .catch(err => console.log(err))  
    })

    ////////////////////////////fetchinf Number of colledge for reserch dashbored////////////
        app.get("/TotalColledge", async (req, res) => {
          let query = {};
          const searchData = req.query.search;
          if (searchData) {
            query = {
              $or: [
                { CollName: { $regex: searchData, $options: "i" } },
                { CollName: { $regex: searchData, $options: "i" } },
              ],
            };
          }
        
          try {
            const allUser = await ColledgeMondel.find(query);
            res.send({ status: "ok", data: allUser });
          } catch (error) {
            console.log(error);
          }
        });


 /*****************************************************
 *   ==== BULETIN UPLOADING ====
 *****************************************************/
const Bulletin = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/Bulletin");
const BulletinMondel = mongoose.model("Bulletin");
const BulletinStorage = multer({ storage: Bulletin });

app.post("/WeekelyBuletin", BulletinStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {Title,EPIWeek,BullitenDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryBulletin = await await cloudinary.uploader.upload(file,  {
    folder: "Bulletin",
   resource_type: 'raw',
    // format: 'pdf',
    // allowed_formats: ['pdf'],
     type: "upload",         // 👈 PUBLIC (no signed URL needed)
  });
  fs.unlinkSync(req.file.path); // Optional: remove file after upload

try {
  const savetoDb = await BulletinMondel.create({
    Title,
    EPIWeek,
    BullitenDate,
    filename: originalname,
    public_id: cloudinaryBulletin.public_id,
    imgUrl: cloudinaryBulletin.secure_url,
  });
//res.json({ imgUrl: cloudinaryBulletin.secure_url})
  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


// ✅ Download signed PDF
app.get(":id", async (req, res) => {
  try {
    const url = cloudinary.v2.utils.private_download_url(
      req.params.id,
      "pdf",
      { resource_type: "raw", type: "authenticated" }
    );
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6️⃣ List PDFs (for Download Page)
app.get("/pdfs", async (req, res) => {
  try {
    const pdfs = await BulletinMondel.find();
    res.json(pdfs);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch PDFs" });
  }
});
// cloudinary.config({
// ImageKit config
// const imagekBullet = new ImageKit({
//   publicKey: "process.env.IMAGEKIT_PUBLIC_KEY",
//   privateKey: "process.env.IMAGEKIT_PRIVATE_KEY",
//   urlEndpoint: "process.env.IMAGEKIT_URL_ENDPOINT",
// });
// const Bulletin = multer.diskStorage({
//   // destination: './public/uploads',
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });


// require("./model/Bulletin");
// const BulletinMondel = mongoose.model("Bulletin");
// const BulletinStorage = multer({ storage: Bulletin });

// app.post("/WeekelyBuletin", BulletinStorage.single("file"), async (req, res) => {
// try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }
//     if (req.file.mimetype !== "application/pdf") {
//       return res.status(400).json({ error: "Only PDF files allowed" });
//     }
//         // const file = req.file.path;
//         // const {Title,EPIWeek,BullitenDate} = req.body;
//         const fileName = `${Date.now()}_${req.file.originalname}`;

//     // Upload to ImageKit
//     const result = await imagekBullet.upload({
//       file: req.file.buffer, // buffer from multer
//       fileName, // Date.now() + "_" + req.file.originalname,
//       folder: "/pdfs", // optional folder in your ImageKit account
//       useUniqueFileName: true,
//       isPrivateFile: true,
//     });

//   fs.unlinkSync(req.file.path); // Optional: remove file after upload
    
 
//     // Save metadata to MongoDB
  
//         const doc = await BulletinMondel.create({
//         Title,
//         EPIWeek,
//         BullitenDate,
//         fileName: result.name || fileName,
//         fileId: result.fileId,
//         url: result.url || null,
//          isPrivate: true,
//         mimeType: req.file.mimetype,
//         size: req.file.size,
//         // uploadedBy: req.body.uploadedBy || "anonymous",
//         });

//   // const savetoDb = await BulletinMondel.create({
//   //   Title,
//   //   EPIWeek,
//   //   BullitenDate,
//   //   filename: originalname,
//   //   public_id: cloudinaryBulletin.public_id,
//   //   imgUrl: cloudinaryBulletin.secure_url,
//   // });
// //res.json({ imgUrl: cloudinaryBulletin.secure_url})
//    res.json({ message: "Uploaded", file: doc });
//   } catch (err) {
//     console.error("Upload failed:", err);
//     res.status(500).json({ error: err.message });
//   }
  
// });

// ➤ Download PDF (signed URL)
// app.get("/api/download/:fileId", async (req, res) => {
//   const doc = await FileModel.findOne({ fileId: req.params.fileId });
//   if (!doc) return res.status(404).json({ error: "Not found" });

//   const path = `${process.env.IMAGEKIT_FOLDER}/${doc.fileName}`;
//   const signedUrl = imagekit.getSignedUrl({
//     path,
//     expireSeconds: parseInt(process.env.SIGNED_URL_EXPIRY_SECONDS || "300", 10),
//   });

//   res.json({ signedUrl });
// });


// const Bulletin = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./Bulletin");
//   },
//   IRBUploadfilename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     cb(null, uniqueSuffix + file.originalname);
//   },
// });

// require("./model/Bulletin");
// const BulletinMondel = mongoose.model("Bulletin");
// const BulletinStorage = multer({ storage: Bulletin });

// app.post("/WeekelyBuletin", BulletinStorage.single("file"), async (req, res) => {
//   console.log(req.file);
//   const Title = req.body.Title;
//   const EPIWeek = req.body.EPIWeek;
//   const BullitenDate = req.body.BullitenDate;
//   const BulletinfileName = req.file.filename;
//   try {
//     await BulletinMondel.create({Title:Title, EPIWeek: EPIWeek,BullitenDate:BullitenDate,pdf:BulletinfileName});
//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });
// Get PDF by ID (returns URL)
app.get('/api/pdf/:id', async (req, res) => {
  try {
    const pdf = await BulletinMondel.findById(req.params.id);
    if (!pdf) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    res.json({ imgUrl: pdf.imgUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get("/get-Bulliten", async (req, res) => {
  try {
    BulletinMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
// //fetching file from Bulletin ----------
// //Download PDF (forces download) 
// app.get("/download-pdf", (req, res) => { 
//   const { url } = req.query; // Cloudinary PDF URL passed from frontend 
//   if (!url || !url.endsWith(".pdf")) 
//     { 
//       return res.status(400).json({ 
//         error: "Only PDF files can be downloaded." }); 
//       } res.setHeader("Content-Disposition", "attachment; filename=file.pdf"); 
//       res.redirect(url); 
//     }); 
   /////////////////////////////////////////////////////////////////generate cod and dowenload////////
   // --- Helper: Generate short random code ---
function generateCode(len = 6) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
}



 /*****************************************************
 *   ==== LABORATORY RESULT SUBMITION AND GENERATING CODE ====
 *****************************************************/
app.post('/api/create', async (req, res) => {
  try {
    const { name, phone, Professional, sex ,HFName, HFTName} = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    let code;
    for (let i = 0; i < 5; i++) {
      code = generateCode(8);
      const exists = await FileEntry.findOne({ code });
      if (!exists) break;
      code = null;
    }
    if (!code) return res.status(500).json({ error: 'Could not generate code' });

    const entry = new FileEntry({ code, name, phone, Professional, sex ,HFName, HFTName});
    await entry.save();

    res.json({ message: 'Code created', code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
////////////// fetching Lab result /////////////

app.get('/LabResult_info',(req, res) =>{
    
  FileEntry.find()
  .then(users => res.json(users))
  .catch(err => console.log(err))  
  })
//////////////////////////////////////////Update Health Facility Name laboratory result////////////////////////////////////////HFUpdate
app.get('/LabResult_Update/:id', (req, res) => {
  const id = req.params.id
  FileEntry.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})

app.put('/LabResult_Update/:id', (req, res) => {
  const id = req.params.id;
  FileEntry.findByIdAndUpdate({_id: id}, {
    HFName: req.body.HFName,
  }).then(user => res.json(user))
  .catch(err => res.json(err))
})
// ====== MULTER (MEMORY STORAGE) ======
const uploadLabResult = multer({ storage: multer.memoryStorage() });

// 2️⃣ Upload file to Cloudinary for a specific code
app.post('/api/upload/:code', uploadLabResult.single('file'), async (req, res) => {
  try {
    const { code } = req.params;
    const entry = await FileEntry.findOne({ code });
    if (!entry) return res.status(404).json({ error: 'Invalid code' });
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No file uploaded or empty file buffer' });
    }

    console.log('Buffer size:', req.file.buffer.length, 'bytes');

    // Promisify Cloudinary upload_stream
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'LabResult', resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    // Generate QR code for download link
    const downloadLink = `${process.env.CLIENT_BASE_URL}/download?code=${code}`;
    const qrDataUrl = await QRCode.toDataURL(downloadLink);

    // Update entry
    entry.cloudinaryUrl = result.secure_url;
    entry.qrCode = qrDataUrl;
    await entry.save();

    res.json({
      message: 'File uploaded to Cloudinary successfully!',
      code,
      cloudinaryUrl: result.secure_url,
      qrCode: qrDataUrl,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// 3️⃣ Download (redirect to Cloudinary file)
app.get('/api/download/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const entry = await FileEntry.findOne({ code });
    if (!entry || !entry.cloudinaryUrl)
      return res.status(404).json({ error: 'File not found' });

    // Redirect user to Cloudinary URL
    res.redirect(entry.cloudinaryUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4️⃣ Get entry info
app.get('/api/entry/:code', async (req, res) => {
  const entry = await FileEntry.findOne({ code: req.params.code });
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json(entry);
});


///////////////////////////////////////////////end of code generate and dowenload file///////////
    

app.get('/fetching-Bulliten', async(req, res) =>{
     const fileUrl = req.query.url;
  //ResearchMondel.find()
  const allUser = await BulletinMondel.find({}).sort({createdAt: -1});
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

/////bulletin CaseBasedF/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");"./FinalReserchPaper"
const CaseBasedF = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/CaseBasedF");
const CaseBasedFMondel = mongoose.model("CaseBasedF");
const CaseBasedFStorage = multer({ storage: CaseBasedF });

app.post("/CaseBasedF", CaseBasedFStorage.single("Casefile"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {CaseBasedTitle,CaseBasedUDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryCaseBasedF = await cloudinary.uploader.upload(file, {
    folder: "SUpdate",
   resource_type: 'auto',
    // format: 'pdf',
    // allowed_formats: ['pdf']
  });
  try {
  const savetoDb = await CaseBasedFMondel.create({
    CaseBasedTitle,
    CaseBasedUDate,
    filename: originalname,
    public_id: cloudinaryCaseBasedF.public_id,
    imgUrl: cloudinaryCaseBasedF.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-CaseBasedF", async (req, res) => {
  try {
    CaseBasedFMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
/////bulletin DailyReport/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");"./FinalReserchPaper"
const DailyReport = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/DailyReport");
const DailyReportMondel = mongoose.model("DailyReport");
const DailyReportStorage = multer({ storage: DailyReport });

app.post("/DailyR", DailyReportStorage.single("Dailyfile"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {DailyReportTitle,DailyReportDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryDailyReport = await cloudinary.uploader.upload(file, {
    folder: "DailyReport",
   resource_type: 'auto',
    // format: 'pdf',
    // allowed_formats: ['pdf']
  });
  try {
  const savetoDb = await DailyReportMondel.create({
    DailyReportTitle,
    DailyReportDate,
    filename: originalname,
    public_id: cloudinaryDailyReport.public_id,
    imgUrl: cloudinaryDailyReport.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-DailyR", async (req, res) => {
  try {
    DailyReportMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

/////bulletin Linelist/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");"./FinalReserchPaper"
const Linelist = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/Linelist");
const LinelistMondel = mongoose.model("Linelist");
const LinelistStorage = multer({ storage: Linelist });

app.post("/LinelistT", LinelistStorage.single("LineListfile"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {LineListTitle,LineListDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryLinelist = await cloudinary.uploader.upload(file, {
    folder: "LinelistT",
   resource_type: 'auto',
    // format: 'pdf',
    // allowed_formats: ['pdf']
  });
  try {
  const savetoDb = await LinelistMondel.create({
    LineListTitle,
    LineListDate,
    filename: originalname,
    public_id: cloudinaryLinelist.public_id,
    imgUrl: cloudinaryLinelist.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Linelist", async (req, res) => {
  try {
    LinelistMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

/////bulletin WeeklyReport/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");"./FinalReserchPaper"
const WeeklyReport = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/WeeklyReport");
const WeeklyReportMondel = mongoose.model("WeeklyReport");
const WeeklyReportStorage = multer({ storage: WeeklyReport });

app.post("/WeekelyR", WeeklyReportStorage.single("Weeklyfile"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {WeeklyReportTitle,WeeklyReportDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryWeeklyReport = await cloudinary.uploader.upload(file, {
    folder: "WeeklyReport",
   resource_type: 'auto',
    // format: 'pdf',
    // allowed_formats: ['pdf']
  });
  try {
  const savetoDb = await WeeklyReportMondel.create({
    WeeklyReportTitle,
    WeeklyReportDate,
    filename: originalname,
    public_id: cloudinaryWeeklyReport.public_id,
    imgUrl: cloudinaryWeeklyReport.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-WeeklyR", async (req, res) => {
  try {
    WeeklyReportMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

/////bulletin WeeklyReport/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");"./FinalReserchPaper"
// const DowenloadCODE = multer.diskStorage({
//   // destination: './public/uploads',
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });


// require("./model/File");
// const FileMondel = mongoose.model("File");
// const FileStorage = multer({ storage: DowenloadCODE ,
//   limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit; change as needed
// });

// // ---------- Rate limiter for download endpoint ----------
// const dlLimiter = rateLimit({
//   windowMs: 60 * 1000, // 1 minute
//   max: 10,
//   message: 'Too many downloads from this IP, please try again later.'
// });

// // ---------- Helpers ----------
// function genCode(len = 8) {
//   // friendly alphanumeric code
//   return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0, len);
// }


// // 1) Upload (returns the unique code)
// app.post('/uploadResult', FileStorage.single('file'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

//     // generate unique code; ensure uniqueness in DB
//     let code;
//     let tries = 0;
//     do {
//       if (tries++ > 5) return res.status(500).json({ error: 'Could not generate unique code' });
//       code = genCode(8); // 8 hex chars
//     } while (await FileMondel.findOne({ code }));

//     //
//     const file = req.file.path;
//      const cloudinaryLabREsult = await cloudinary.uploader.upload(file, {
//     folder: "LabResult",
//      resource_type: "auto"
//   });

//     const fileDoc = new FileMondel({
//       code,
//       filenameOnDisk: req.file.filename,
//       originalName: req.file.originalname,
//       mimeType: req.file.mimetype,
//       // optional: set expiry 7 days from now
//       // expiresAt: new Date(Date.now() + 7*24*3600*1000)

//     });
//     await fileDoc.save();

//     // return the code (client will use it to download)
//     res.send({ code, originalName: req.file.originalname });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Upload failed' });
//   }
// });

// // 2) Download by code (no controller, single file)
// // Example: GET /download/abcd1234
// app.get('/downloadLabResult/:code', dlLimiter, async (req, res) => {
//   try {
//     const code = req.params.code;
//     // Basic validation: only allow 1-64 chars alnum/hex
//     if (!/^[0-9a-fA-F]{4,64}$/.test(code)) return res.status(400).json({ error: 'Invalid code format' });

//     const fileDoc = await FileMondel.findOne({code});
//     if (!fileDoc) return res.status(404).json({ error: 'File not found' });

//     // Optional: check expiry
//     if (fileDoc.expiresAt && fileDoc.expiresAt < new Date()) {
//       return res.status(410).json({ error: 'File expired' });
//     }

//         const filePath = path.join(UPLOAD_DIR, fileDoc.filenameOnDisk);
//     if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server' });

//     // increment download counter (fire-and-forget)
//     FileMondel.updateOne({ _id: fileDoc._id }, { $inc: { downloads: 1 } }).catch(()=>{});

//     // Set headers so browser downloads file with original name
//     res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileDoc.originalName)}"`);
//     res.setHeader('Content-Type', fileDoc.mimeType || 'application/octet-stream');

//     // Stream the file
//     const stream = fs.createReadStream(filePath);
//     stream.on('error', (err) => {
//       console.error('stream error', err);
//       if (!res.headersSent) res.status(500).end('Server error');
//     });
//     stream.pipe(res);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Download failed' });
//   }
// });

// // 3) Optional: admin route to list files (protect in prod)
// app.get('/admin/list', async (req, res) => {
//   const files = await FileMondel.find().sort({ createdAt: -1 }).limit(100).lean();
//   res.json(files);
// });

// // 4) Optional: delete by code (admin)
// app.delete('/admin/delete/:code', async (req, res) => {
//   const code = req.params.code;
//   const fileDoc = await FileMondel.findOneAndDelete({ code });
//   if (!fileDoc) return res.status(404).json({ error: 'Not found' });
//   const filePath = path.join(UPLOAD_DIR, fileDoc.filenameOnDisk);
//   fs.unlink(filePath, () => {});
//   res.json({ ok: true });
// });




/*****************************************************
 *   ==== DOWNLOAD BY CODE  ;LABORATORY RESULT====
 *****************************************************/
app.get('/download/:code', async (req, res) => {
try {
const code = req.params.code;
const fileDoc = await File.findOne({ code });
if (!fileDoc) return res.status(404).json({ error: 'code not found' });


if (fileDoc.expiresAt && fileDoc.expiresAt < new Date()) {
return res.status(410).json({ error: 'file expired' });
}


fileDoc.downloads = (fileDoc.downloads || 0) + 1;
await fileDoc.save();


// Cloudinary secure URL redirect
return res.redirect(fileDoc.cloudinaryUrl);


} catch (err) {
console.error(err);
res.status(500).json({ error: 'download failed' });
}
});


////bulletin WeeklyReport/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");"./FinalReserchPaper"
// const record = multer.diskStorage({
//   // destination: './public/uploads',
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     );
//   },
// });
//const record = multer({ storage: multer.memoryStorage() })
// Multer setup for in-memory storage
// const record = multer({ storage: multer.memoryStorage() });

// require("./model/Record");
// const RecordModel = mongoose.model("Record");
// const RecordStorage = multer({ storage: record });

// app.post("/api/submit", async (req, res) => {
//   try {
//     const { name, age, sex } = req.body;
//     if (!name) return res.status(400).json({ error: "Name required" });

//     // create unique short code
//     const code = uuidv4().replace(/-/g, "").slice(0, 8);

//     const record = new RecordModel({ name, age, sex, code });
//     await record.save();

//     res.json({ code });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // 2) Upload file by code
// app.post("/api/upload/:code", upload.single("recordfile"), async (req, res) => {
//   try {
//     const { code } = req.params;
//     const record = await RecordModel.findOne({ code });
//     if (!record) return res.status(404).json({ error: "Invalid code" });

//     if (!req.file || !req.file.buffer) {
//       return res.status(400).json({ error: "No valid file uploaded" });
//     }

//     console.log("File received:", req.file);

//     const uploadStream = cloudinary.uploader.upload_stream(
//       { folder: "mern_uploads", resource_type: "auto" },
//       async (error, result) => {
//         if (error) {
//           console.error("Cloudinary upload error:", error);
//           return res.status(500).json({ error: "Upload failed" });
//         }

//         // save Cloudinary info to DB
//         record.file_public_id = result.public_id;
//         record.file_url = result.secure_url;
//         record.uploadedAt = new Date();
//         await record.save();

//         res.json({ message: "File uploaded", file_url: result.secure_url });
//       }
//     );

//     streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
//   } catch (err) {
//     console.error("Server error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // 3) Download/Access file by code -> redirect to Cloudinary secure URL
// app.get("/api/download/:code", async (req, res) => {
//   try {
//     const { code } = req.params;
//     const record = await RecordModel.findOne({ code });
//     if (!record || !record.file_url) return res.status(404).json({ error: "File not found" });

//     // Redirect client to Cloudinary URL for direct download/preview
//     return res.redirect(record.file_url);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // 3) Download/Access file by code
// app.get("/api/download/:code", async (req, res) => {
//   try {
//     const { code } = req.params;
//     const record = await RecordModel.findOne({ code });
//     if (!record || !record.file_url)
//       return res.status(404).json({ error: "File not found" });

//     return res.redirect(record.file_url);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// app.post("/Record", RecordStorage.single("Weeklyfile"), async (req, res) => {
//   //  console.log("This is my file ",req.file)
//   const file = req.file.path;
//   const {WeeklyReportTitle,WeeklyReportDate} = req.body;
//   const {originalname} = req.file;

//   const cloudinaryWeeklyReport = await cloudinary.uploader.upload(file, {
//     folder: "WeeklyReport",
//    resource_type: 'auto',
//     // format: 'pdf',
//     // allowed_formats: ['pdf']
//   });
//   try {
//   const savetoDb = await WeeklyReportMondel.create({
//     WeeklyReportTitle,
//     WeeklyReportDate,
//     filename: originalname,
//     public_id: cloudinaryWeeklyReport.public_id,
//     imgUrl: cloudinaryWeeklyReport.secure_url,
//   });

//   res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });

// check metadata
// app.get('/check/:code', async (req, res) => {
// const code = req.params.code;
// const fileDoc = await File.findOne({ code });
// if (!fileDoc) return res.status(404).json({ ok: false, message: 'not found' });
// res.json({ ok: true, name: fileDoc.originalName, size: fileDoc.size });
// });
// app.get("/get-WeeklyR", async (req, res) => {
//   try {
//     WeeklyReportMondel.find({}).sort({createdAt: -1}).then((data) => {
//       res.send({ status: "ok", data: data });
//     });
//   } catch (error) {}
// });
//////Outbreak Investigation uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const OutbreakI = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/OutbreakI");
const OutbreakIMondel = mongoose.model("OutbreakI");
const OutbreakIStorage = multer({ storage: OutbreakI });

app.post("/OutbreakInvestigation", OutbreakIStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {InvestigationTitle,EPIWeek,ReportingDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryOutbreakI = await cloudinary.uploader.upload(file, {
    folder: "OutbreakInvestigation",
     resource_type: "auto"
  });
try {
  const savetoDb = await OutbreakIMondel.create({
    InvestigationTitle,
    EPIWeek,
    ReportingDate,
    filename: originalname,
    public_id: cloudinaryOutbreakI.public_id,
    imgUrl: cloudinaryOutbreakI.secure_url,
  });

  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});

app.get("/get-OutbreakI", async (req, res) => {
  try {
    OutbreakIMondel.find({}).sort({createdAt: -1}).then((data) => {
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
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/NOPV");
const NOPVMondel = mongoose.model("NOPV");
const NOPVStorage = multer({ storage: NOPV });

app.post("/NOPVDocument", NOPVStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {NOPVTitle} = req.body;
  const {originalname} = req.file;

  const cloudinaryNOPV = await cloudinary.uploader.upload(file, {
    folder: "NOPV",
     resource_type: "auto"
  });
try {
  const savetoDb = await NOPVMondel.create({
    NOPVTitle,
    filename: originalname,
    public_id: cloudinaryNOPV.public_id,
    imgUrl: cloudinaryNOPV.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});



app.get("/get-NOPV", async (req, res) => {
  try {
    NOPVMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//VRAM uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const VRAM = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/VRAM");
const VRAMMondel = mongoose.model("VRAM");
const VRAMStorage = multer({ storage: VRAM });

app.post("/VRAMDocument", VRAMStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {VRAMTitle} = req.body;
  const {originalname} = req.file;

  const cloudinaryVRAM = await cloudinary.uploader.upload(file, {
    folder: "VRAM",
    resource_type: "auto"
  });
  try {
  const savetoDb = await VRAMMondel.create({
    VRAMTitle,
    filename: originalname,
    public_id: cloudinaryVRAM.public_id,
    imgUrl: cloudinaryVRAM.secure_url,
  });
 
  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});

app.get("/get-VRAM", async (req, res) => {
  try {
    VRAMMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//EPRP uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const EPRP = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/EPRP");
const EPRPMondel = mongoose.model("EPRP");
const EPRPStorage = multer({ storage: EPRP });

app.post("/EPRPDocument", EPRPStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {EPRPTitle,VRAMSource} = req.body;
  const {originalname} = req.file;

  const cloudinaryEPRP = await cloudinary.uploader.upload(file, {
    folder: "EPRP",
    resource_type: "auto"
  });
  try {
  const savetoDb = await EPRPMondel.create({
    EPRPTitle,
    VRAMSource,
    filename: originalname,
    public_id: cloudinaryEPRP.public_id,
    imgUrl: cloudinaryEPRP.secure_url,
  });
 
  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-EPRP", async (req, res) => {
  try {
    EPRPMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//RiskA uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

const RiskA = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/RiskA");
const RiskAMondel = mongoose.model("RiskA");
const RiskAStorage = multer({ storage: RiskA });

app.post("/RiskA", RiskAStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {RiskTitle,RARegion,SubCity,RAKebele,RAWoreda } = req.body;
  const {originalname} = req.file;

  const cloudinaryRiskA = await cloudinary.uploader.upload(file, {
    folder: "RiskA",
    resource_type: "auto"
  });
  try {
  const savetoDb = await RiskAMondel.create({
    RiskTitle,
    RARegion,
    SubCity,
    RAKebele,
    RAWoreda,
    filename: originalname,
    public_id: cloudinaryRiskA.public_id,
    imgUrl: cloudinaryRiskA.secure_url,
  });

  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});

// const RiskA = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./RiskA");
//   },
//   IRBUploadfilename: function (req, file, cb) {
    
//     cb(null, file.originalname);
//   },
// });

// require("./model/RiskA");
// const RiskAMondel = mongoose.model("RiskA");
// const RiskAStorage = multer({ storage: RiskA });

// app.post("/RiskA", RiskAStorage.single("file"), async (req, res) => {
//   console.log(req.file);
//   const RiskTitle = req.body.RiskTitle;
//   const RARegion = req.body.RARegion;
//   const SubCity = req.file.SubCity;
//   const RAKebele = req.body.RAKebele;
//   const RAWoreda = req.body.RAWoreda;
//   const RiskAfileName = req.file.filename;
//   try {
//     await RiskAMondel.create({RiskTitle:RiskTitle,RARegion:RARegion, SubCity:SubCity,RAKebele:RAKebele,RAWoreda:RAWoreda, pdf:RiskAfileName});
//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });

app.get("/get-RiskA", async (req, res) => {
  try {
    RiskAMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
app.get('/get-RiskA/:id', (req, res) => {
  const id = req.params.id
  RiskAMondel.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})
//IAR uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const IAR = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/IAR");
const IARMondel = mongoose.model("IAR");
const IARStorage = multer({ storage: IAR });

app.post("/IARDocument", IARStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {IARTitle,Abstract} = req.body;
  const {originalname} = req.file;

  const cloudinaryIAR = await cloudinary.uploader.upload(file, {
    folder: "IAR",
     resource_type: "auto"
  });
try {
  const savetoDb = await IARMondel.create({
    IARTitle,
    Abstract,
    filename: originalname,
    public_id: cloudinaryIAR.public_id,
    imgUrl: cloudinaryIAR.secure_url,
  });

  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});


app.get("/get-IAR", async (req, res) => {
  try {
    IARMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//AAPHEML Research Unit Publication/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Publication = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/Publication");
const PublicationMondel = mongoose.model("Publication");
const PublicationStorage = multer({ storage: Publication });

app.post("/Publication", PublicationStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {PublicationTitle,PublicationDate,PublicationAbstract} = req.body;
  const {originalname} = req.file;

  const cloudinaryPublication = await cloudinary.uploader.upload(file, {
    folder: "Publication",
    resource_type: "auto"
  });
  try {
  const savetoDb = await PublicationMondel.create({
    PublicationTitle,
    PublicationDate,
    PublicationAbstract,
    filename: originalname,
    public_id: cloudinaryPublication.public_id,
    imgUrl: cloudinaryPublication.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


app.get("/get-Publication", async (req, res) => {
  try {
    PublicationMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//AAPHEML Research Unit Publication/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const TestMultipleUpload = multer.memoryStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/MultipleUpload");
const MultipleUploadMondel = mongoose.model("MultipleUpload");
const MultipleUploadStorage = multer({ storage: TestMultipleUpload });

// Upload multiple files and save info to MongoDB
app.post("/MultipleUpload", MultipleUploadStorage.array("files", 10), async (req, res) => {
  try {
    console.log("📩 Received files:", req.files?.map(f => f.originalname));
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    // const file = req.file.path;
  const { NCollege,NewColl} = req.body;


    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto", folder: "mern_uploads" },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        stream.end(fileBuffer);
      });
    };

    const results = [];
    for (let file of req.files) {
      const uploaded = await streamUpload(file.buffer);
      console.log("✅ Cloudinary uploaded:", uploaded.secure_url);
      const savedFile = await MultipleUploadMondel.create({
         NCollege,
        NewColl,
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
        original_filename: uploaded.original_filename,
        format: uploaded.format,
      });
      results.push(savedFile);
    }

    res.json({ message: "Uploaded & saved successfully", files: results });
  } catch (err) {
    console.error("❌ Upload error (server):", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Fetch all uploaded file info
app.get("/files", async (req, res) => {
  try {
    const files = await MultipleUploadMondel.find().sort({ createdAt: -1 });
    res.json(files);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch files" });
  }
});


//Education & Training by AAPHEML Research Unit /////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const ETraining = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/ETraining");
const ETrainingMondel = mongoose.model("ETraining");
const ETrainingStorage = multer({ storage: ETraining });

app.post("/ETraining", ETrainingStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {ETrainingTitle,ETrainingDate,ETrainer,EPlace} = req.body;
  const {originalname} = req.file;

  const cloudinaryETraining = await cloudinary.uploader.upload(file, {
    folder: "ETraining",
    resource_type: "auto"
  });
  try {
  const savetoDb = await ETrainingMondel.create({
    ETrainingTitle,
    ETrainingDate,
    ETrainer,
    EPlace,
    filename: originalname,
    public_id: cloudinaryETraining.public_id,
    imgUrl: cloudinaryETraining.secure_url,
  });
 
  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});



app.get("/get-ETraining", async (req, res) => {
  try {
    ETrainingMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});


//Laboratory Training Modules by AAPHEML Research Unit /////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const TModules = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/TModules");
const TModulesMondel = mongoose.model("TModules");
const TModulesStorage = multer({ storage: ETraining });

app.post("/TModules", TModulesStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {TModulesTitle,TModulesDate,TMTrainer} = req.body;
  const {originalname} = req.file;

  const cloudinaryTModules = await cloudinary.uploader.upload(file, {
    folder: "TModules",
    resource_type: "auto"
  });
  try {
  const savetoDb = await TModulesMondel.create({
    TModulesTitle,
    TModulesDate,
    TMTrainer,
    filename: originalname,
    public_id: cloudinaryTModules.public_id,
    imgUrl: cloudinaryTModules.secure_url,
  });
 
  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});

app.get("/get-TModules", async (req, res) => {
  try {
    TModulesMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});


//Laboratory Training Modules by AAPHEML Laboratory Unit /////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Regulations = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/Regulations");
const RegulationsMondel = mongoose.model("Regulations");
const RegulationsStorage = multer({ storage: Regulations });

app.post("/Regulations", RegulationsStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {RulesTitle,RulesADate} = req.body;
  const {originalname} = req.file;

  const cloudinaryRegulations = await cloudinary.uploader.upload(file, {
    folder: "Regulations",
    resource_type: "auto"
  });
  try {
  const savetoDb = await RegulationsMondel.create({
    RulesTitle,
    RulesADate,
    filename: originalname,
    public_id: cloudinaryRegulations.public_id,
    imgUrl: cloudinaryRegulations.secure_url,
  });
 
  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Regulations", async (req, res) => {
  try {
    RegulationsMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});


//SitRep /////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SitRep = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/SitRep");
const SitRepMondel = mongoose.model("SitRep");
const SitRepStorage = multer({ storage: SitRep });

app.post("/SitRep", SitRepStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {SitRepTitle,SitRepDate,SUpdate,EPIWeek} = req.body;
  const {originalname} = req.file;

  const cloudinarySitRep = await cloudinary.uploader.upload(file, {
    folder: "SitRep",
     resource_type: "auto"
  });
try {
  const savetoDb = await SitRepMondel.create({
    SitRepTitle,
    SitRepDate,
    SUpdate,
    EPIWeek,
    filename: originalname,
    public_id: cloudinarySitRep.public_id,
    imgUrl: cloudinarySitRep.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});



app.get("/get-SitRep", async (req, res) => {
  try {
    SitRepMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

/////////////////////////////////////////////////////////blog backe end//////
//Education & Training by AAPHEML Research Unit /////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");

const Newposts = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Newposts");
  },
  IRBUploadfilename: function (req, file, cb) {
    
    cb(null, file.originalname);
  },
});

require("./model/Post");
const PostMondel = mongoose.model("Post");
const NewpostsStorage = multer({ storage: Newposts });

app.post("/Newposts",NewpostsStorage.single("file"), async (req, res) => {
  console.log(req.file);
  const NPosttitle = req.body.NPosttitle;
  const content = req.body.content;
  try {
    await PostMondel.create({NPosttitle:NPosttitle,content:content});
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Newposts", async (req, res) => {
  try {
    PostMondel.find().sort({ createdAt: -1 }).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
/////////////////////////////////////////////////////////blog backe end//////

// Routes
app.get('/posts', async (req, res) => {
  const posts = await PostMondel.find();
  res.json(posts);
});


app.post('/posts/:id/comments', async (req, res) => {
  const post = await PostMondel.findById(req.params.id);
  post.comments.push({ text: req.body.text });
  await post.save();
  res.json(post);
});

//////////////////////////////////////////BlogPost////////////////////////////////////////HFUpdate
// Signup
app.post("/signup", async (req, res) => {
    const {name, email, password, gender, birthday, education} = req.body;

    if (await User.findOne({ email }))
        return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed , gender, birthday, education});
    await user.save();

    req.session.userId = user._id;
    req.session.userName = user.name;

    res.json({ message: "Signup success", user: user.name });
});

// app.post("/login", async (req, res) => {
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) return res.status(400).json({ message: "Invalid email" });

//   const ok = await bcrypt.compare(req.body.password, user.password);
//   if (!ok) return res.status(400).json({ message: "Invalid password" });

//   req.session.userId = user._id;
//   req.session.userName = user.name;

//   res.json({ message: "Logged in", user: user.name });
// });

app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(401).json({ message: "Invalid email" });

    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid password" });

    // Create session + cookie
    req.session.userId = user._id;
    req.session.userName = user.name;

    // res.cookie("token", "loggedin", {
    //   httpOnly: true,
    //   secure: false,  // use true in HTTPS
    //   sameSite: "NON"
    // });
      const token = user._id.toString(); // or JWT if you use one

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,      // Render uses https so MUST be true
      sameSite: "none",  // required for cross-site cookies
    });


    res.json({ message: "Login successful", name: user.name });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Create Blog
app.post("/api/blogs", async (req, res) => {
    if (!req.session.userId)
        return res.status(403).json({ message: "Login required" });

    const newBlog = new Blog({
        title: req.body.title,
        content: req.body.content,
        author: req.session.userName
    });

    await newBlog.save();
    res.json(newBlog);
});

// Get all blogs
app.get("/api/blogs", async (req, res) => {
    const blogs = await Blog.find();
    res.json(blogs);
});

// Post comment
app.post("/api/blogs/:id/comments", async (req, res) => {
    if (!req.session.userId)
        return res.status(403).json({ message: "Login required" });

    const blog = await Blog.findById(req.params.id);

    blog.comments.push({
        user: req.session.userName,
        text: req.body.text
    });

    await blog.save();
    res.json({ success: true });
});
/////////////Logout in bloglist
app.post("/logout", (req, res) => {
    res.clearCookie("token");
    req.session.destroy(() => {});
    return res.json({ message: "Logged out" });
});
// // Create blog post
// app.post('/api/blogs', async (req, res) => {
//   const { title, content } = req.body;
//   const blog = new Blog({title, content, comments: []});
//   await blog.save();
//   res.json(blog);
// });

// // Get all blogs
// app.get('/api/blogs', async (req, res) => {
//   const blogs = await Blog.find();
//   res.json(blogs);
// });

// // Add comment to blog
// app.post('/api/blogs/:id/comments', async (req, res) => {
//   const { text } = req.body;
//   const blog = await Blog.findById(req.params.id);
//   blog.comments.push({ text });
//   await blog.save();
//   res.json(blog);
// });





///Suppervision uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Suppervision = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/Suppervision");
const SuppervisionMondel = mongoose.model("Suppervision");
const SuppervisionStorage = multer({ storage: Suppervision });

app.post("/Suppervision", SuppervisionStorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {SuppervisionTitle,EPIWeek} = req.body;
  const {originalname} = req.file;

  const cloudinarySuppervision = await cloudinary.uploader.upload(file, {
    folder: "Suppervision",
     resource_type: "auto"
  });
try {
  const savetoDb = await SuppervisionMondel.create({
    SuppervisionTitle,
    EPIWeek,
    filename: originalname,
    public_id: cloudinarySuppervision.public_id,
    imgUrl: cloudinarySuppervision.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});



app.get("/get-Suppervision", async (req, res) => {
  try {
    SuppervisionMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//////Homepage Cards uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Cards = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/Cards");
const CardsMondel = mongoose.model("Cards");
const Cardstorage = multer({ storage: Cards });

app.post("/CreatCards", Cardstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { FrontTitle,FrontDate, Frontdescription,FrontDetail } = req.body;

  const cloudinaryCards = await cloudinary.uploader.upload(file, {
    folder: "Cards",
    resource_type:'auto'
  });
  try{
  const savetoDb = await CardsMondel.create({
    FrontTitle,
    FrontDate,
    Frontdescription,
    FrontDetail,
    filename: file.originalname,
    public_id: cloudinaryCards.public_id,
    imgUrl: cloudinaryCards.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});




app.get('/get-BottumCards/:id', (req, res) => {
  const id = req.params.id
  CardBottumMondel.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})

app.get('/get-Cards/:id', (req, res) => {
  const id = req.params.id
  CardsMondel.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})
app.get('/DetailNews/:id', (req, res) => {
  const id = req.params.id
  CardsMondel.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})
// app.put('/update/:id', (req, res) => {
//   const id = req.params.id;
//   CardsMondel.findByIdAndUpdate({_id: id}, {
//       name: req.body.name,
//       email: req.body.email,
//       age: req.body.age
//   }).then(user => res.json(user))
//   .catch(err => res.json(err))
// })

//////Homepage RCCE uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");


const RCCE = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/RCCE");
const RCCEMondel = mongoose.model("RCCE");
const RCCEtorage = multer({ storage: RCCE });

app.post("/CreatRCCECards", RCCEtorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { RCCETitle} = req.body;

  const cloudinaryRCCE = await cloudinary.uploader.upload(file, {
    folder: "RCCE",
    resource_type:'auto'
  });
  try{
  const savetoDb = await RCCEMondel.create({
    RCCETitle,
    filename: file.originalname,
    public_id: cloudinaryRCCE.public_id,
    imgUrl: cloudinaryRCCE.secure_url,
  });

  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});

app.get('/get-RCCECards', (req, res) => {
  const id = req.params.id
  RCCEMondel.findById({_id: id})
  .then(post => res.json(post))
  .catch(err => console.log(err))
})
///fetching file from RCCE ----------

app.get('/fetching-RCCECards', async(req, res) =>{
    
  //ResearchMondel.find()
  const allUser = await RCCEMondel.find({}).sort({createdAt: -1});
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

//////Homepage Accredited/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Accredited = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Accredited");
const AccreditedMondel = mongoose.model("Accredited");
const Accreditedstorage = multer({ storage: Accredited });

app.post("/Accredited", Accreditedstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {AccreditedTitle,AccreditedDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryAccredited = await cloudinary.uploader.upload(file, {
    folder: "Accredited",
    resource_type: "auto"
  });
  try {
  const savetoDb = await AccreditedMondel.create({
    AccreditedTitle,
    AccreditedDate,
    filename: originalname,
    public_id: cloudinaryAccredited.public_id,
    imgUrl: cloudinaryAccredited.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});



app.get("/get-Accredited", async (req, res) => {
  try {
    AccreditedMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

//////Homepage EQA/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const EQA = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/EQA");
const EQAMondel = mongoose.model("EQA");
const EQAstorage = multer({ storage: EQA });

app.post("/EQA", EQAstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {EQATitle,EQADate} = req.body;
  const {originalname} = req.file;

  const cloudinaryEQA = await cloudinary.uploader.upload(file, {
    folder: "EQA",
    resource_type: "auto"
  });
  try {
  const savetoDb = await EQAMondel.create({
    EQATitle,
    EQADate,
    filename: originalname,
    public_id: cloudinaryEQA.public_id,
    imgUrl: cloudinaryEQA.secure_url,
  });
 
  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-EQA", async (req, res) => {
  try {
    EQAMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

//////Homepage CPD/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const CPD = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/CPD");
const CPDMondel = mongoose.model("CPD");
const CPDstorage = multer({ storage: CPD });

app.post("/CPD", CPDstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {CPDTitle,CPDDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryCPD = await cloudinary.uploader.upload(file, {
    folder: "CPD",
    resource_type: "auto"
  });
  try {
  const savetoDb = await CPDMondel.create({
    CPDTitle,
    CPDDate,
    filename: originalname,
    public_id: cloudinaryCPD.public_id,
    imgUrl: cloudinaryCPD.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});



app.get("/get-CPD", async (req, res) => {
  try {
    CPDMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});


//////Homepage SLIMTA/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const SLIMTA = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/SLIMTA");
const SLIMTAMondel = mongoose.model("SLIMTA");
const SLIMTAstorage = multer({ storage: SLIMTA });

app.post("/SLIMTA", SLIMTAstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {SLIMTATitle,SLIMTADate} = req.body;
  const {originalname} = req.file;

  const cloudinarySLIMTA = await cloudinary.uploader.upload(file, {
    folder: "SLIMTA",
    resource_type: "auto"
  });
  try {
  const savetoDb = await SLIMTAMondel.create({
    SLIMTATitle,
    SLIMTADate,
    filename: originalname,
    public_id: cloudinarySLIMTA.public_id,
    imgUrl: cloudinarySLIMTA.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


app.get("/get-SLIMTA", async (req, res) => {
  try {
    SLIMTAMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

//////Homepage Mentorship/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Mentorship = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Mentorship");
const MentorshipMondel = mongoose.model("Mentorship");
const Mentorshipstorage = multer({ storage: Mentorship });

app.post("/Mentorship", Mentorshipstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {MentorshipTitle,MentorshipDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryMentorship = await cloudinary.uploader.upload(file, {
    folder: "Mentorship",
    resource_type: "auto"
  });
  try {
  const savetoDb = await MentorshipMondel.create({
    MentorshipTitle,
    MentorshipDate,
    filename: originalname,
    public_id: cloudinaryMentorship.public_id,
    imgUrl: cloudinaryMentorship.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


app.get("/get-Mentorship", async (req, res) => {
  try {
    MentorshipMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

//////Homepage QualityIndicators/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const QualityIndicators = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/QualityIndicators");
const QualityIndicatorsMondel = mongoose.model("QualityIndicators");
const QualityIndicatorsstorage = multer({ storage: QualityIndicators });

app.post("/QualityIndicators", QualityIndicatorsstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {QualityIndicatorsTitle,QualityIndicatorsDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryQualityIndicators = await cloudinary.uploader.upload(file, {
    folder: "QualityIndicators",
    resource_type: "auto"
  });
  try {
  const savetoDb = await QualityIndicatorsMondel.create({
    QualityIndicatorsTitle,
    QualityIndicatorsDate,
    filename: originalname,
    public_id: cloudinaryQualityIndicators.public_id,
    imgUrl: cloudinaryQualityIndicators.secure_url,
  });
 
  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


app.get("/get-QualityIndicator", async (req, res) => {
  try {
    QualityIndicatorsMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

//////Homepage Laboratory/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Laboratory = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Laboratory");
const LaboratoryMondel = mongoose.model("Laboratory");
const Laboratorystorage = multer({ storage: Laboratory });

app.post("/Laboratory", Laboratorystorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {LaboratoryTitle,LaboratoryDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryLaboratory = await cloudinary.uploader.upload(file, {
    folder: "Laboratory",
    resource_type: "auto"
  });
  try {
  const savetoDb = await LaboratoryMondel.create({
    LaboratoryTitle,
    LaboratoryDate,
    filename: originalname,
    public_id: cloudinaryLaboratory.public_id,
    imgUrl: cloudinaryLaboratory.secure_url,
  });
 
  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


app.get("/get-Laboratory", async (req, res) => {
  try {
    LaboratoryMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});


//////Homepage PolicyDoc/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const PolicyDoc = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/PolicyDoc");
const PolicyDocMondel = mongoose.model("PolicyDoc");
const PolicyDocstorage = multer({ storage: PolicyDoc });

app.post("/PolicyDoc", PolicyDocstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {PolicyDocTitle,PolicyDocDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryPolicyDoc = await cloudinary.uploader.upload(file, {
    folder: "PolicyDoc",
    resource_type: "auto"
  });
  try {
  const savetoDb = await PolicyDocMondel.create({
    PolicyDocTitle,
    PolicyDocDate,
    filename: originalname,
    public_id: cloudinaryPolicyDoc.public_id,
    imgUrl: cloudinaryPolicyDoc.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


app.get("/get-PolicyDoc", async (req, res) => {
  try {
    PolicyDocMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

//////Homepage Referral_L/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Referral = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Referral");
const  ReferralMondel = mongoose.model("Referral");
const  Referralstorage = multer({ storage:  Referral });

app.post("/Referral", Referralstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {ReferralTitle,ReferralDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryReferral = await cloudinary.uploader.upload(file, {
    folder: "Referral",
    resource_type: "auto"
  });
  try {
  const savetoDb = await ReferralMondel.create({
    ReferralTitle,
    ReferralDate,
    filename: originalname,
    public_id: cloudinaryReferral.public_id,
    imgUrl: cloudinaryReferral.secure_url,
  });
 
  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});

app.get("/get-Referral", async (req, res) => {
  try {
    ReferralMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

//////Homepage Manuals/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Manuals = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Manuals");
const  ManualsMondel = mongoose.model("Manuals");
const  Manualsstorage = multer({ storage:  Manuals });

app.post("/Manuals", Manualsstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {ManualsTitle,ManualsDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryManuals = await cloudinary.uploader.upload(file, {
    folder: "Manuals",
    resource_type: "auto"
  });
  try {
  const savetoDb = await ManualsMondel.create({
    ManualsTitle,
    ManualsDate,
    filename: originalname,
    public_id: cloudinaryManuals.public_id,
    imgUrl: cloudinaryManuals.secure_url,
  });
 
  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});


app.get("/get-Manuals", async (req, res) => {
  try {
    ManualsMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});


//////Homepage Process/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Process = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Process");
const  ProcessMondel = mongoose.model("Process");
const  Processstorage = multer({ storage:  Process });

app.post("/Process", Processstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {ProcessTitle,ProcessDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryProcess = await cloudinary.uploader.upload(file, {
    folder: "Process",
    resource_type: "auto"
  });
  try {
  const savetoDb = await ProcessMondel.create({
    ProcessTitle,
    ProcessDate,
    filename: originalname,
    public_id: cloudinaryProcess.public_id,
    imgUrl: cloudinaryProcess.secure_url,
  });
 
  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


app.get("/get-Process", async (req, res) => {
  try {
    ProcessMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

//////Homepage Procedures/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Procedures = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Procedures");
const  ProceduresMondel = mongoose.model("Procedures");
const  Proceduresstorage = multer({ storage:  Procedures });

app.post("/Procedures", Proceduresstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {ProceduresTitle,ProceduresDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryProcedures = await cloudinary.uploader.upload(file, {
    folder: "Procedures",
    resource_type: "auto"
  });
  try {
  const savetoDb = await ProceduresMondel.create({
    ProceduresTitle,
    ProceduresDate,
    filename: originalname,
    public_id: cloudinaryProcedures.public_id,
    imgUrl: cloudinaryProcedures.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


app.get("/get-Procedures", async (req, res) => {
  try {
    ProceduresMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});


//////Homepage JobAid
/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const JobAid = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/JobAid");
const  JobAidMondel = mongoose.model("JobAid");
const  JobAidstorage = multer({ storage:  JobAid });

app.post("/JobAids", JobAidstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {JobAidTitle,JobAidDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryJobAid = await cloudinary.uploader.upload(file, {
    folder: "JobAid",
    resource_type: "auto"
  });
  try {
  const savetoDb = await JobAidMondel.create({
    JobAidTitle,
    JobAidDate,
    filename: originalname,
    public_id: cloudinaryJobAid.public_id,
    imgUrl: cloudinaryJobAid.secure_url,
  });
 
  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});


app.get("/get-JobAid", async (req, res) => {
  try {
    JobAidMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

//////Homepage Checklists
/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Checklists = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Checklists");
const  ChecklistsMondel = mongoose.model("Checklists");
const  Checkliststorage = multer({ storage:  Checklists });

app.post("/Checklists", Checkliststorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {ChecklistsTitle,ChecklistsDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryChecklists = await cloudinary.uploader.upload(file, {
    folder: "Checklists",
    resource_type: "auto"
  });
  try {
  const savetoDb = await ChecklistsMondel.create({
    ChecklistsTitle,
    ChecklistsDate,
    filename: originalname,
    public_id: cloudinaryChecklists.public_id,
    imgUrl: cloudinaryChecklists.secure_url,
  });

  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});


app.get("/get-Checklists", async (req, res) => {
  try {
    ChecklistsMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});


//////Homepage Formats
/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Formats = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Formats");
const  FormatsMondel = mongoose.model("Formats");
const  Formatstorage = multer({ storage:  Formats });

app.post("/Formats", Formatstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {FormatsTitle,FormatsDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryFormats = await cloudinary.uploader.upload(file, {
    folder: "Formats",
    resource_type: "auto"
  });
  try {
  const savetoDb = await FormatsMondel.create({
    FormatsTitle,
    FormatsDate,
    filename: originalname,
    public_id: cloudinaryFormats.public_id,
    imgUrl: cloudinaryFormats.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Formats", async (req, res) => {
  try {
    FormatsMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});


//////Homepage LatestUpdate
/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const LatestUpdate = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/LatestUpdate");
const  LatestUpdateMondel = mongoose.model("LatestUpdate");
const  LatestUpdatetorage = multer({ storage:  LatestUpdate });

app.post("/LatestUpdate", LatestUpdatetorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {LatestUpdateTitle,LatestUpdateDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryLatestUpdate = await cloudinary.uploader.upload(file, {
    folder: "LatestUpdate",
    resource_type: "Auto"
  });
try {
  const savetoDb = await LatestUpdateMondel.create({
    LatestUpdateTitle,
    LatestUpdateDate,
  
    filename: originalname,
    public_id: cloudinaryLatestUpdate.public_id,
    imgUrl: cloudinaryLatestUpdate.secure_url,
  });
    res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-LatestUpdate", async (req, res) => {
  try {
    LatestUpdateMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});
//////bulletin uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");"./FinalReserchPaper"
const Info = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./Info");
    },
    Colledgefilename: function (req, file, cb) {
      const uniqueSuffix = Date.now();
      cb(null, uniqueSuffix + file.originalname);
    },
  });
  
  require("./model/Info");
  const InfoMondel = mongoose.model("Info");
  const InfoStorage = multer({ storage: Info });
  
  app.post("/Info", InfoStorage.single("file"), async (req, res) => {
    console.log(req.file);
    const LatestInfo = req.body.LatestInfo;
  //  const BulletinfileName = req.file.filename;
    try {
      await InfoMondel.create({LatestInfo:LatestInfo});
      res.send({ status: "ok" });
    } catch (error) {
      res.json({ status: error });
    }
  });

///////////////get Latest information in laboratory/////////
app.get("/get-LUpdate", async (req, res) => {
  try {
    InfoMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

  // app.get('/get-LUpdate',(req, res) =>{
    
  //   InfoMondel.find({}).sort({createdAt: -1})
  //   .then(users => res.json(users))
  //   .catch(err => console.log(err))  
  //   })
// app.get('/get-LUpdate/:id', (req, res) => {
//   const id = req.params.id
//   InfoMondel.findById({_id: id})
//   .then(post => res.json(post))
//   .catch(err => console.log(err))
// })

//////Homepage Feedback
/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const Feedback = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Feedback");
const  FeedbackMondel = mongoose.model("Feedback");
const  Feedbacktorage = multer({ storage:  Feedback });

app.post("/Feedback", Feedbacktorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {FeedbackTitle,FeedbackDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryFeedback = await cloudinary.uploader.upload(file, {
    folder: "Feedback",
    resource_type: "Auto"
  });
  try {
  const savetoDb = await FeedbackMondel.create({
    FeedbackTitle,
    FeedbackDate,
    filename: originalname,
    public_id: cloudinaryFeedback.public_id,
    imgUrl: cloudinaryFeedback.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-Feedback", async (req, res) => {
  try {
    FeedbackMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});


//////Homepage JDescriptions
/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const JDescriptions = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/JDescriptions");
const  JDescriptionsMondel = mongoose.model("JDescriptions");
const  JDescriptionstorage = multer({ storage:  JDescriptions });

app.post("/JDescriptions", JDescriptionstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {JDescriptionsTitle,JDescriptionsDate} = req.body;
  const {originalname} = req.file;

  const cloudinaryJDescriptions = await cloudinary.uploader.upload(file, {
    folder: "JDescriptions",
    resource_type: "Auto"
  });
  try {
  const savetoDb = await JDescriptionsMondel.create({
    JDescriptionsTitle,
    JDescriptionsDate,
    filename: originalname,
    public_id: cloudinaryJDescriptions.public_id,
    imgUrl: cloudinaryJDescriptions.secure_url,
  });
 
  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});

app.get("/get-JDescriptions", async (req, res) => {
  try {
    JDescriptionsMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

//////Homepage Materials/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const  Material = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/Material");
const   MaterialMondel = mongoose.model("Material");
const   Materialstorage = multer({ storage:   Material });

app.post("/Material", (req, res, next) => {
  Materialstorage.single("file")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ status: "error", message: err.message });
    } else if (err) {
      return res.status(500).json({ status: "error", message: "Unknown error" });
    }

    next();
  });
}, async (req, res) => {
  try {
  const file = req.file?.path;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded or path missing." });
  }

  const cloudinaryLabGuidlines = await cloudinary.uploader.upload(file, {
    folder: "Material",
    resource_type: "auto", // lowercase recommended
  });

  const savetoDb = await MaterialMondel.create({
    MatrialsTitle: req.body.MatrialsTitle,
    MatrialsDate: req.body.MatrialsDate,
    filename: req.file.originalname,
    public_id: cloudinaryLabGuidlines.public_id,
    imgUrl: cloudinaryLabGuidlines.secure_url,
  });

  return res.send({ status: "ok" });
} catch (error) {
  console.error("Upload Error:", error);
  return res.status(500).json({ status: "error", message: error.message });
}
});

app.get("/get-Material", async (req, res) => {
  try {
    MaterialMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});



//////Homepage LabGuidlines/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
const LabGuidlines = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

require("./model/LabGuidlines");
const  LabGuidlinesMondel = mongoose.model("LabGuidlines");
const  LabGuidlinesstorage = multer({ storage:  LabGuidlines });

app.post("/LabGuidlines", LabGuidlinesstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {LabGuidlinesTitle} = req.body;
  const {originalname} = req.file;

  const cloudinaryLabGuidlines = await cloudinary.uploader.upload(file, {
    folder: "LabGuidlines",
    resource_type: "Auto"
  });
  try {
  const savetoDb = await LabGuidlinesMondel.create({
    LabGuidlinesTitle,
    filename: originalname,
    public_id: cloudinaryLabGuidlines.public_id,
    imgUrl: cloudinaryLabGuidlines.secure_url,
  });
 
  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-LabGuidlines", async (req, res) => {
  try {
    LabGuidlinesMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});
///fetching file from Cards ----------

app.get('/fetching-Cards', async(req, res) =>{
    
  //ResearchMondel.find()
  const allUser = await CardsMondel.find({}).sort({createdAt: -1});
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
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CardBottum = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/CardBottum");
const CardBottumMondel = mongoose.model("CardBottum");
const CardBottumstorage = multer({ storage: CardBottum });

app.post("/CreatCardBottum", CardBottumstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const { Bottumname,BotumDate, Bottumdescription,BottumDetail } = req.body;

  const cloudinaryCardBottum = await cloudinary.uploader.upload(file, {
    folder: "CardBottum",
    resource_type: 'image'
  });
  try{
  const savetoDb = await CardBottumMondel.create({
    Bottumname,
    BotumDate,
    Bottumdescription,
    BottumDetail,
    filename: file.originalname,
    public_id: cloudinaryCardBottum.public_id,
    imgUrl: cloudinaryCardBottum.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

// const CardBottum = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null,"./CardBottum");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     cb(null, uniqueSuffix + file.originalname);
//   },
// });

// require("./model/CardBottum");
// const CardBottumMondel = mongoose.model("CardBottum");
// const CardBottumstorage = multer({ storage: CardBottum });

// app.post("/CreatCardBottum", CardBottumstorage.single("file"), async (req, res) => {
//   console.log(req.file);
//   const Bottumname = req.body.Bottumname;
//   const Bottumdescription = req.body.Bottumdescription;
//   const BottumDetail = req.body.BottumDetail;
//   const BottumCardsfileName = req.file.filename;
//   try {
//     await CardBottumMondel.create({ Bottumname: Bottumname,Bottumdescription: Bottumdescription,BottumDetail:BottumDetail,pdf:BottumCardsfileName});
//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });



app.get("/get-CardBottum", async (req, res) => {
  try {
    CardBottumMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

 app.delete('/deletCardBottum/:id',(req, res) =>{
      const id = req.params.id;
      CardBottumMondel.findByIdAndDelete({_id: id})
      .then(res => res.json(res))
      .catch(err => res.json(err))
      })
      
      
///////////////fetchin CardBottum////////////
app.get('/CardBottum',(req, res) =>{
  CardBottumMondel.find({})
  .then(users => res.json(users))
  .catch(err => console.log(err))  
  })


//////Homepage Risk communication uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const CardRiskComm = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/RiskCommunication");
const RiskCommMondel = mongoose.model("RiskCommunication");
const RiskCommstorage = multer({ storage: CardRiskComm });

app.post("/RiskCommunication", RiskCommstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {Title,Defination,Transmition,Prevation} = req.body;

  const cloudinaryRiskComm = await cloudinary.uploader.upload(file, {
    folder: "RiskComm",
    resource_type: "Auto"
  });
  try{
  const savetoDb = await RiskCommMondel.create({
    Title,
    Defination,
    Transmition,
    Prevation,
    filename: file.originalname,
    public_id: cloudinaryRiskComm.public_id,
    imgUrl: cloudinaryRiskComm.secure_url,
  });

  res.send({ status: "ok" });
  } catch (error) {
    res.json({ status: error });
  }
});

// const CardRiskComm = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null,"./RiskComm");
//   },
//   filename: function (req, file, cb) {
//     cb(null,  file.originalname);
//   },
// });

// require("./model/RiskCommunication");
// const RiskCommMondel = mongoose.model("RiskCommunication");
// const RiskCommstorage = multer({ storage: CardRiskComm });

// app.post("/RiskCommunication", RiskCommstorage.single("file"), async (req, res) => {
//   console.log(req.file);
//   const Title = req.body.Title;
//   const Defination = req.body.Defination;
//   const Transmition = req.body.Transmition;
//   const Prevation = req.body.Prevation;
//   const RiskCommunicationfileName = req.file.filename;
//   try {
//     await RiskCommMondel.create({ Title: Title,Defination: Defination, Transmition: Transmition,Prevation: Prevation,pdf:RiskCommunicationfileName});
//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });

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
    RiskCommMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});

//////Homepage CardBottum uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const Guidlines = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/Guidlines");
const GuidlinesMondel = mongoose.model("Guidlines");
const Guidlinesstorage = multer({ storage: Guidlines });

app.post("/Guidelines", Guidlinesstorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {GuidelinesTitle} = req.body;
  const {originalname} = req.file;

  const cloudinaryGuidelines = await cloudinary.uploader.upload(file, {
    folder: "Guidlines",
     resource_type: "Auto"
  });
try {
  const savetoDb = await GuidlinesMondel.create({
    GuidelinesTitle,
    filename: originalname,
    public_id: cloudinaryGuidelines.public_id,
    imgUrl: cloudinaryGuidelines.secure_url,
  });

  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});





app.get("/getGuidlines", async (req, res) => {
  try {
    GuidlinesMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
// app.get('/get-Guidlines', async (req, res) => {
//   try {
//     const posts = await GuidlinesMondel.find().sort({ _id: -1 });
//     res.json(posts);
//   } catch (err) {
//     res.status(500).json({ error: 'Could not retrieve posts' });
//   }
// });
//////Homepage IRBPolicy uploaded/////////////////////////////////////////////////////////
 //multer------------------------------------------------------------
//const multer = require("multer");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const IRBPolicy = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/IRBPolicy");
const IRBPolicyMondel = mongoose.model("IRBPolicy");
const IRBPolicystorage = multer({ storage: IRBPolicy });

app.post("/IRBPolicy", IRBPolicystorage.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {IRBPolicyTitle} = req.body;
  const {originalname} = req.file;

  const cloudinaryIRBPolicy = await cloudinary.uploader.upload(file, {
    folder: "IRBPolicy",
     resource_type: "Auto"
  });
try {
  const savetoDb = await IRBPolicyMondel.create({
    IRBPolicyTitle,
    filename: originalname,
    public_id: cloudinaryIRBPolicy.public_id,
    imgUrl: cloudinaryIRBPolicy.secure_url,
  });

  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});


app.get("/get-IRBPolicy", async (req, res) => {
  try {
    IRBPolicyMondel.find({}).sort({createdAt: -1}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {}
});
////////////////////////////////////multer for capacity building////////////////
// const multer = require("multer");
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });


/*****************************************************
 *   ==== UPLOAD FOR CAPACITY BUILDING ====
 *****************************************************/
const capacityBstorage = multer.diskStorage({
  // destination: './public/uploads',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});


require("./model/CapacityBuilding");
const capacityBMondel = mongoose.model("CapacityBuilding");
const capacityBupload = multer({ storage: capacityBstorage });

app.post("/capacityB", capacityBupload.single("file"), async (req, res) => {
  //  console.log("This is my file ",req.file)
  const file = req.file.path;
  const {TrainingTitle,TrainingDate,TCertification} = req.body;
  // const {originalname} = req.file;

  const cloudinarycapacityB = await cloudinary.uploader.upload(file, {
    folder: "capacityB",
     resource_type: "Auto"
  });
try {
  const savetoDb = await capacityBMondel.create({
    TrainingTitle,
    TrainingDate,
    TCertification,
    filename: file.originalname,
    public_id: cloudinarycapacityB.public_id,
    imgUrl: cloudinarycapacityB.secure_url,
  });

  res.send({ status: "ok" });
} catch (error) {
  res.json({ status: error });
}
});

// const capacityBstorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null,"./capacityB");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now();
//     cb(null, uniqueSuffix + file.originalname);
//   },
// });

// require("./model/CapacityBuilding");
// const capacityBMondel = mongoose.model("CapacityBuilding");
// const capacityBupload = multer({ storage: capacityBstorage });

// app.post("/capacityB", capacityBupload.single("file"), async (req, res) => {
//   console.log(req.file);
//   const TrainingTitle = req.body.TrainingTitle;
//   const TrainingDate = req.body.TrainingDate;
//   const TCertification = req.file.TCertification;
//   const capacityBfileName = req.file.filename;
//   try {
//     await capacityBMondel.create({ TrainingTitle: TrainingTitle,TrainingDate:TrainingDate,TCertification:TCertification, pdf: capacityBfileName });
//     res.send({ status: "ok" });
//   } catch (error) {
//     res.json({ status: error });
//   }
// });

app.get("/get-capacityB", async (req, res) => {
  try {
    capacityBMondel.find({}).sort({createdAt: -1}).then((data) => {
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
      res.json("Already Created Event")}
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
/*****************************************************
 * SERVER START
 *****************************************************/
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/src', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');
});
//  PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("server is runing")
})
