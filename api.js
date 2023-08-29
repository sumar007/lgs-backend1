const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { User, Contact, Visit, CareerForm, Querie, Jobpost, Admin } = require('./db');
const ApiFeatures = require('./apiFeatures');
const router = express.Router();
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
router.use(cookieParser());

const adminEmail = process.env.ADMIN_MAIL;
// Use the cors middleware with the appropriate options
router.use(
    cors({
        origin: process.env.LOCAL_HOST, // Replace with the origin of your frontend
        credentials: true,
    })
);
//middleware for  checking login authentication
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

//checks the credentials from database
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const admin = await Admin.findOne({ username });

            if (!admin) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            const passwordMatch = await bcrypt.compare(password, admin.password);
            if (!passwordMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, admin);
        } catch (error) {
            return done(error);
        }
    }
));
//user logs successfully section will be created and user id will be stored 
passport.serializeUser((user, done) => {
    done(null, user.id);
});
// used to fetch stored data in database (admin)
passport.deserializeUser(async (id, done) => {
    try {
        const admin = await Admin.findById(id);
        done(null, admin);
    } catch (error) {
        done(error);
    }
});

// after login admin session will expire after 24 hours
router.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        domain: process.env.LOCAL_HOST, // Replace with your frontend's domain
        path: '/', // Set to '/' to allow the cookie to be sent on all routes
    }
}));

router.use(passport.initialize());
router.use(passport.session());
// Set up the storage for resume uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination folder where uploaded resumes will be stored
        cb(null, 'uploads/resumes');
    },
    filename: function (req, file, cb) {

        // You can use a unique name for the file or keep the original name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extname = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extname);
    },
});

// Set up the multer middleware with the storage configuration
const upload = multer({ storage: storage });

// Create an endpoint for checking authentication
router.get('/check-auth', (req, res) => {
    // If the user reaches this point, they are authenticated
    res.json({ isAuthenticated: true });
});
// API for contactus
router.post('/contactlgs', async (req, res, next) => {
    try {
        const { firstName, lastName, email, message } = req.body;
        console.log(firstName, lastName, email, message)
        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newContact = new Contact({
            firstName, lastName, email, message,
        });

        await newContact.save();

        // Send an email to the user
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASSWORD,
            },
        });

        const userMailOptions = {
            from:process.env.EMAIL_USER,
            to: email,
            subject: 'Registration Confirmation',
            text: `Thank you for contacting us. We will get back to you soon.`,
        };

        transporter.sendMail(userMailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email to user:', error);
                // Continue to respond to the client even if there is an error with email sending
                res.json({ success: true });
            } else {
                console.log('Email sent to user:', info.response);
                // Send a response message
                res.json({ success: true });

                // Now, send an email to the admin with user details
                const adminMailOptions = {
                    from: process.env.EMAIL_USER,
                    to: adminEmail,
                    subject: 'New User Registration',
                    text: `A new user has registered with the following details:\n\nFirstName: ${firstName}\nLastName: ${lastName}\nEmail: ${email}\nMessage: ${message}`,
                };

                transporter.sendMail(adminMailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email to admin:', error);
                    } else {
                        console.log('Email sent to admin:', info.response);
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
        // Pass the error to the error handling middleware
        next(error);
    }
});

// API for queries
router.post('/queries', async (req, res, next) => {
    try {
        const { queryFirstName, queryLastName, queryEmail, queryCountry, queryMessage } = req.body;
        console.log(queryFirstName, queryLastName, queryEmail, queryCountry, queryMessage)
        if (!queryFirstName || !queryFirstName || !queryEmail || !queryCountry || !queryMessage) {
            return res.status(400).json({ error: 'All fields are required' });
        }



        const newQuerie = new Querie({
            queryFirstName, queryLastName, queryEmail, queryCountry, queryMessage,
        });

        await newQuerie.save();

        // Send an email to the user
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: queryEmail,
            subject: 'Registration Confirmation',
            text: `Thank you for contacting us. We will get back to you soon.`,
        };

        transporter.sendMail(userMailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email to user:', error);
                // Continue to respond to the client even if there is an error with email sending
                res.json({ success: true });
            } else {
                console.log('Email sent to user:', info.response);
                // Send a response message
                res.json({ success: true });

                // Now, send an email to the admin with user details
                const adminMailOptions = {
                    from: process.env.EMAIL_USER,
                    to: adminEmail,
                    subject: 'New User Registration',
                    text: `A new user has registered with the following details:\n\nFirstName: ${queryFirstName}\nLastName: ${queryLastName}\nEmail: ${queryEmail}\nCountry:${queryCountry}\nMessage: ${queryMessage}`,
                };

                transporter.sendMail(adminMailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email to admin:', error);
                    } else {
                        console.log('Email sent to admin:', info.response);
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
        // Pass the error to the error handling middleware
        next(error);
    }
});
// API for registration
router.post('/register', async (req, res, next) => {
    try {
        const { name, email, phone, service, message } = req.body;
        console.log(name, email, phone, service, message)
        if (!name || !email || !phone || !service || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (phone.length !== 10) {
            return res.status(400).json({ error: 'Phone and WhatsApp numbers must be 10 digits long' });
        }

        const newUser = new User({
            name,
            email,
            phone,
            service,
            message,
        });

        await newUser.save();

        // Send an email to the user
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Registration Confirmation',
            text: `Thank you for contacting us. You have selected the service: ${service}. We will get back to you soon.`,
        };

        transporter.sendMail(userMailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email to user:', error);
                // Continue to respond to the client even if there is an error with email sending
                res.json({ success: true });
            } else {
                console.log('Email sent to user:', info.response);
                // Send a response message
                res.json({ success: true });

                // Now, send an email to the admin with user details
                const adminMailOptions = {
                    from: process.env.EMAIL_USER,
                    to: adminEmail,
                    subject: 'New User Registration',
                    text: `A new user has registered with the following details:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nMessage: ${message}`,
                };

                transporter.sendMail(adminMailOptions, (error, info) => {
                    if (error) {
                        console.error('Error sending email to admin:', error);
                    } else {
                        console.log('Email sent to admin:', info.response);
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
        // Pass the error to the error handling middleware
        next(error);
    }
});
// API for career form submission
router.post('/career-form', upload.single('resume'), async (req, res, next) => {
    try {

        // Extract the career form data from the request body
        const {
            name,
            phone,
            totalExp,
            careerGap,
            currentLocation,
            preferredLocation,
            reasonForJobChange,
            jobProfile,
            email,
            relevantExp,
            currentCTC,
            expectedCTC,
            noticePeriod,
        } = req.body;

        // Create a new career form instance using the Mongoose model
        const newCareerForm = new CareerForm({

            name,
            phone,
            totalExp,
            careerGap,
            currentLocation,
            preferredLocation,
            reasonForJobChange,
            jobProfile,
            email,
            relevantExp,
            currentCTC,
            expectedCTC,
            noticePeriod,
            resume: req.file.path, // Replace with the actual path to the uploaded resume file
        });

        // Save the career form to the database
        await newCareerForm.save();

        // Send confirmation emails to user and admin
        await sendConfirmationEmailToUser(newCareerForm);
        await sendConfirmationEmailToAdmin(newCareerForm, req.file.path);

        res.json({ success: true, message: 'Career form submitted successfully' });
    } catch (error) {
        console.error('Error submitting career form:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Function to send confirmation email to the user
const sendConfirmationEmailToUser = async (careerFormData) => {
    try {
        const { email } = careerFormData;

        // Create the transporter for sending emails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Email options for the user
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Career Form Submission Confirmation',
            text: `Thank you for submitting the career form. We have received your details and will get back to you soon.`,
        };


        // Send the email to the user
        const info = await transporter.sendMail(userMailOptions);
        console.log('Email sent to user:', info.response);
    } catch (error) {
        console.error('Error sending email to user:', error);
    }
};

// Function to send confirmation email to the admin (HR)
const sendConfirmationEmailToAdmin = async (careerFormData) => {
    try {
        const { name, email, phone, jobProfile, resume } = careerFormData;
        const adminEmail = '160419733122@mjcollege.ac.in'; // Replace with the admin's email address

        // Create the transporter for sending emails
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Email options for the admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: 'New Career Form Submission',
            text: `A new career form has been submitted with the following details:\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nJob Profile: ${jobProfile}`,
            attachments: [
                {
                    filename: 'resume.pdf', // Set the filename for the attachment
                    path: resume, // Provide the path to the resume file
                },
            ],
        };

        // Send the email to the admin
        const info = await transporter.sendMail(adminMailOptions);
        console.log('Email sent to admin:', info.response);
    } catch (error) {
        console.error('Error sending email to admin:', error);
    }
};



// gets the count
router.get('/getVisitCount', async (req, res) => {
    try {
        const visit = await Visit.findOne();
        const visitCount = visit ? visit.count : 0;
        res.json({ visitCount });
    } catch (error) {
        console.error('Error fetching visit count:', error);
        res.status(500).json({ error: 'An error occurred while fetching the visit count' });
    }
});

// Endpoint to increment the website visit count
router.post('/incrementVisitCount', async (req, res) => {
    try {
        let visit = await Visit.findOne();
        if (!visit) {
            visit = await Visit.create({ count: 1 });
        } else {
            visit.count += 1;
            await visit.save();
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error incrementing visit count:', error);
        res.status(500).json({ error: 'An error occurred while incrementing the visit count' });
    }
});

// admin registration api
router.post('/adminreg', async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            username,
            password: hashedPassword,
        });
        await newAdmin.save();
        res.status(201).json({ success: true, message: 'Admin registered successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'An error occurred during registration.' });
    }
});

// admin login api
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, admin, info) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'An error occurred during login.' });
        }
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
        req.login(admin, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'An error occurred during login.' });
            }
            return res.json({ success: true, message: 'Admin logged in successfully.' });
        });
    })(req, res, next);
});


// creating jobs by admin
router.post('/jobs', async (req, res) => {
    console.log('Authenticated user:', req.user);

    const { title, description, experience, location } = req.body;
    console.log('Received job creation request:', req.body);

    try {
        // Get the currently logged-in admin from the request object
        // if (req.user.role !== "Admin") {
        //     return res.status(403).json({ error: 'Permission denied' });
        // }

        // Create the job post associated with the logged-in admin
        const newJob = new Jobpost({
            title,
            description,
            experience,
            location,
            // admin: req.user._id,
        });
        await newJob.save();

        res.status(201).json({ success: true, message: 'Job post created successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'An error occurred while creating the job post.' });
    }
    console.log('Job created successfully');
});

//logout the admin
router.delete('/logout', ensureAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'An error occurred during logout.' });
        }
        req.user = null; // Clear the user property in the request object
        res.json({ success: true, message: 'Admin logged out successfully.' });
    });
});

//delete the job
router.delete('/jobs/:_id', async (req, res) => {
    try {
        // Check if the authenticated user is an admin
        // if (req.user.role !== "Admin") {
        //     return res.status(403).json({ success: false, message: 'You do not have permission to access this route.' });
        // }

        // Get the job ID from the request parameters
        const _id = req.params._id;

        // Find the job and delete it
        const deletedJob = await Jobpost.findByIdAndDelete(_id);

        if (!deletedJob) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }

        res.json({ success: true, message: 'Job deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'An error occurred while deleting the job.' });
    }
});

//get all jobs by admin
//API endpoint to get all job posts
router.get('/alljobsadmin', ensureAuthenticated, async (req, res) => {
    try {
        const resultPerPage = 10;
        // You can adjust this based on your preference
        const apiFeatures = new ApiFeatures(Jobpost.find(), req.query)
            .search()
            .filter()
            .pagination(resultPerPage);

        const jobs = await apiFeatures.query;


        res.json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
router.get('/alljobs', async (req, res) => {
    try {
        const resultPerPage = 20;
        // You can adjust this based on your preference
        const apiFeatures = new ApiFeatures(Jobpost.find(), req.query)
            .search()
            .filter()
            .pagination(resultPerPage);

        const jobs = await apiFeatures.query;


        res.json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});
//get a single job 
router.get('/job/:_id', async (req, res) => {
    try {
        const job = await Jobpost.findById(req.params._id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
