const express=require('express')
const multer=require('multer')
const bcrypt=require("bcrypt")
const HouseModel=require('../models/HouseSchema')
const UserModel=require('../models/UserSchema')
const EnquiryModel=require('../models/EnquirySchema')
const router=express()
const upload = multer()




//RequestHandler to save a house information in houses collection
router.post("/inserthouse", upload.none(), async (request, response) => {
    const house=request.body;
    // console.log(house);
    const housedata = new HouseModel(house);
    await housedata.save()
    try {
      response.status(200).send(housedata);
    } catch (error) {
      response.status(500).send(error);
    }
});


// To get all the houses information
router.get("/", async (request, response) => {
    const housesData = await HouseModel.find({});
    try {
      response.status(200).send(housesData);
    } catch (error) {
      response.status(500).send(error);
    }
});


// To get all the houses information belongs to a county
router.get("/searchresults/:county", async (request, response) => {
    let countyname=request.params.county;
    const housesData = await HouseModel.find({county:{$eq:countyname}});
   
    try {
      response.status(200).send(housesData);
    } catch (error) {
      response.status(500).send(error);
    }
});


// To get all the house information having the given ID
router.get("/searchhouse/:id", async (request, response) => {
    let houseid=request.params.id;
    const housesData = await HouseModel.find({_id:{$eq:houseid}});
   
    try {
      response.status(200).send(housesData);
    } catch (error) {
      response.status(500).send(error);
    }
});


//RequestHandler to save a enquiry information about a house
router.post("/register", upload.none(), async (request, response) => {
    const enquiry=request.body;
    // console.log(enquiry);
    const enquirydata = new EnquiryModel(enquiry);
    await enquirydata.save()


    try {
      response.status(200).send(enquirydata);
    } catch (error) {
      response.status(500).send(error);
    }
});


// To get all the enquiries information
router.get("/allenquiries", async (request, response) => {
    const enquiryData = await EnquiryModel.find({});


    try {
      response.status(200).send(enquiryData);
    } catch (error) {
      response.status(500).send(error);
    }
});


//RequestHandler to save a user information about in users collection
router.post("/signup", upload.none(), async (request, response) => {
  let {name, email, password} = request.body;

  // 1. Find user in the database with the given email
  const existingUser = await UserModel.findOne({ email });

  // 2. If a matching user is found, return a response indicating the email is already registered
  if (existingUser) {
      return response.status(400).send({ message: "Email already exists. Please use a different email." });
  }

  // If no matching user is found, proceed to register a new user

  // Encrypt password using bcrypt
  try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      password = hash;

      // Create a new user
      const newUser = new UserModel({ name, email, password });
      
      // Save the new user to the database
      await newUser.save();
      
      response.status(200).send(newUser);
  } catch (error) {
      response.status(500).send(error);
  }
});



//RequestHandler to save a user information about in users collection
router.post("/login", upload.none(), async (request, response) => {
    const user=request.body;
    // console.log(user);
    let epassword=user.password;
    //any error in talking to DB and fetching data should be in try
    try {
      const loginData = await UserModel.find({email:{$eq:user.email}});
      // console.log(loginData);
      // if there is a document with this email
      if(loginData.length>0) {      
        let lpassword=loginData[0].password;
        // check if password is also matching
        await bcrypt.compare(epassword, lpassword, (err, result) => {
          //if password cpmparision error then return with status 500
          if (err) {
              // Handle error
              console.error('Error comparing passwords:', err);
              response.status(500).send("Login Failed , invalid password");
          }    
          // if no error then return with status 200 and user data    
            if(result)
              response.status(200).send(loginData);
            else
            response.status(500).send("Login Failed , invalid details");
          }
        )
    }
    else { // is there is NO document with the email
      response.status(500).send("Login Failed , invalid email");
    }
    }
    catch (error) { // for any kind of error
      response.status(500).send("Login Failed");
    }
});


module.exports = router
