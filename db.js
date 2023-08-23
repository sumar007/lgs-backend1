// db.js
const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/lgs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

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

const visitSchema = new mongoose.Schema({
  count: Number,
});

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

const User = mongoose.model('User', userSchema);
const Visit = mongoose.model('Visit', visitSchema);
const CareerForm = mongoose.model('CareerForm', careerFormSchema);
const Contact = mongoose.model('Contact', contactSchema);

module.exports = {
  User,
  Visit,
  CareerForm,
  Contact,
};
