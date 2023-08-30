// db.js
require('dotenv').config();
const mongoose = require("mongoose");
//connection to mongodb 


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    
})
    .then(() => {
        console.log('Connected to the database');
    })
    .catch((error) => {
        console.error('Error connecting to the database:', error);
    });
// schema for registration api
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    service: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

// schema for tracker 
const visitSchema = new mongoose.Schema({
    count: Number,
});

//schema for career form api
const careerFormSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    totalExp: {
        type: String,
        required: true,
    },
    careerGap: {
        type: String,
        required: true,
    },
    currentLocation: {
        type: String,
        required: true,
    },
    preferredLocation: {
        type: String,
        required: true,
    },
    reasonForJobChange: {
        type: String,
        required: true,
    },
    jobProfile: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    relevantExp: {
        type: String,
        required: true,
    },
    currentCTC: {
        type: String,
        required: true,
    },
    expectedCTC: {
        type: String,
        required: true,
    },
    noticePeriod: {
        type: String,
        required: true,
    },
    resume: {
        type: String,
        required: true,
    },
});

//schema for contactus api
const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },

    message: {
        type: String,
        required: true,
    },
});


//schema for queries api
const queriesSchema = new mongoose.Schema({
    queryFirstName: {
        type: String,
        required: true,
    },
    queryLastName: {
        type: String,
        required: true,
    },
    queryEmail: {
        type: String,
        required: true,
    },
    queryCountry: {
        type: String,
        required: true,
    },
    queryMessage: {
        type: String,
        required: true,
    },
});

//admin schema
const adminSchema = new mongoose.Schema({
    username:{ 
        type:String,
        required:true,
    },

    password:{
        type:String,
        required:true,
    },
    role: {
        type: String,
        default: 'Admin', // Set the default role to 'Admin'
      },
  });
  
 
//job schema
const jobPostSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
},
description:{
    type:String,
    required:true,
},
experience:{
    type:Number,
    required:true,
},
location:{
    type:String,
    required:true,
}

});

//models for each schema or collection for database 
const User = mongoose.model('User', userSchema);
const Visit = mongoose.model('Visit', visitSchema);
const CareerForm = mongoose.model('CareerForm', careerFormSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Querie = mongoose.model('Querie', queriesSchema);
const Jobpost=mongoose.model("Job",jobPostSchema);
const Admin = mongoose.model('Admin', adminSchema);
module.exports = {
    User,
    Visit,
    CareerForm,
    Contact,
    Querie,
    Jobpost,
    Admin
};
