const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bodyParser = require('body-parser');
const twilio = require('twilio');

const Dashboard = require('./models/dashboardModel');
require("./db/conn");


const User = require("./models/usermessage");
const User1 = require("./models/userlogin");
const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const templates_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

const session = require("express-session");
const handlebars = require('hbs');
handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

app.use(bodyParser.json());
app.use(
  session({
    secret: "your secret key",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());

// console.log(path.join(__dirname," ../public"));

app.use(express.urlencoded({ extended: false }));

app.use(
    "/css",
    express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css"))
  );

app.use(function (req, res, next) {
  res.locals.loggedIn = req.session.loggedIn;
  res.locals.usern = req.session.usern;
  res.locals.emailn = req.session.emailn;
  next();
});

app.use(express.static(static_path));
app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templates_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/index", (req, res) => {
    res.render("index");
  });
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/faqs", (req, res) => {
    res.render("faqs");
  });

  app.get("/resources", (req, res) => {
    res.render("resources");
  });
  app.get("/safety", (req, res) => {
    res.render("safety");
  });



app.get("/news", (req, res) => {
  res.render("news");
});
app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/about", (req, res) => {
  res.render("about");
});
app.get("/pathfinder", (req, res) => {
  res.render("pathfinder");
});


const Question = require("./models/questionModel");

app.post("/submit-question", async (req, res) => {
  try {
    const { question } = req.body;
    const username = req.session.usern; 
    const newQuestion = new Question({
      username: username,
      question: question,
    });

    await newQuestion.save();

    res.send('<script>alert("Question submitted successfully"); window.location.href = "/";</script>');
    return;
  } catch (error) {
    console.error(error);
    res.send('<script>alert("Try Again (check U are Already Login or not)"); window.location.href = "/";</script>');
  }
});


// Function to retrieve the user's mobile number from the database
async function getUserMobileNumberFromDatabase(username) {
  try {
    const dashboard = await Dashboard.findOne({ username: username });
    return dashboard.mobileNumber;
  } catch (error) {
    console.error('Error retrieving user mobile number:', error);
    return null;
  }
}

// Function to retrieve the emergency contact number from the database
async function getEmergencyContactNumberFromDatabase(username) {
  try {
    const dashboard = await Dashboard.findOne({ username: username });
    return dashboard.emergencyContact;
  } catch (error) {
    console.error('Error retrieving emergency contact number:', error);
    return null;
  }
}

app.post('/send-emergency-sms', async (req, res) => {
  const { latitude, longitude } = req.body;
  const username = req.session.usern;

  const accountSid = 'AC58a7548c25349aea439e42559affb406';
  const authToken = 'b6cd54a57581e441508fcffba3bc4601';
  const client = twilio(accountSid, authToken);

  const userPhoneNumber = await getUserMobileNumberFromDatabase(username);
  const emergencyPhoneNumber = await getEmergencyContactNumberFromDatabase(username);

  if (!userPhoneNumber || !emergencyPhoneNumber) {
    console.error('User mobile number or emergency contact number not found in database');
    res.status(500).json({ success: false, message: 'User mobile number or emergency contact number not found' });
    return;
  }

  const messageBody = `Emergency! User's location: Latitude: ${latitude}, Longitude: ${longitude}`;

  client.messages
    .create({
      body: messageBody,
      from: '+14178553049', // Your Twilio phone number
      to: [userPhoneNumber, emergencyPhoneNumber] // Phone numbers as strings
    })
    .then(message => {
      console.log('Emergency SMS sent successfully. SID:', message.sid);
      // res.send('<script>alert("once check that your number should be verified at https://console.twilio.com/us1/develop/phone-numbers/manage/verified "); window.location.href = "/";</script>');
      res.status(201).render("index");
    })
    .catch(error => {
      return;
      console.error('Error sending emergency SMS:', error.message);
      res.status(500).json({ success: false, message: 'Error sending emergency SMS' });
    });
    
});




app.post("/contact", async (req, res) => {
  try {
    // res.send(req.body);
    const userData = new User(req.body);
    await userData.save();
    res.status(201).render("index");
  } catch (error) {
    res.status(500).send(error);
  }
});


app.post('/save-personal-details', async (req, res) => {
    try {
      const { fullName, email, mobileNumber, address } = req.body;
      const username = req.session.usern; // Assuming you store the logged-in user's username in the session
  
      const dashboard = await Dashboard.findOneAndUpdate(
        { username: username },
        { fullName, email, mobileNumber, address },
        { upsert: true, new: true }
      );
  
    //   console.log(dashboard);
      res.redirect('/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  
// Handle the POST request to save the emergency details
app.post('/save-emergency-details', async (req, res) => {
    try {
      const { personName, emergencyContact, emergencyEmail, relation } = req.body;
      const username = req.session.usern; // Assuming you store the logged-in user's username in the session
  
      const dashboard = await Dashboard.findOneAndUpdate(
        { username: username },
        {
          $set: {
            personName: personName,
            emergencyContact: emergencyContact,
            emergencyEmail: emergencyEmail,
            relation: relation
          }
        },
        { upsert: true, new: true }
      );
      console.log(dashboard);
  
      res.redirect('/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });
  
  

  app.get("/dashboard", async (req, res) => {
    try {
        const user = await Dashboard.findOne({ username: req.session.usern });
        // console.log(user);
      res.render("dashboard", { user });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  });
  



app.post("/login", async (req, res) => {
  try {
    const userData = new User1(req.body);
    const user = await User1.findOne({ email: req.body.email });
    if (user) {
        res.send('<script>alert("Email Already Exist"); window.location.href = "login";</script>');
        return ;
    }
    else{
      await userData.save();
      res.cookie("authToken", "123456789", { maxAge: 3600000, httpOnly: true });
      req.session.loggedIn = true;
      // console.log(req.session.loggedIn);
      // console.log(req.body.username);
      req.session.usern=req.body.username;
      req.session.emailn=req.body.email;
      // console.log(req.session.emailn);
      res.status(201).send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="0; URL=/index" />
        </head>
        <body>
          Redirecting...
        </body>
      </html>
    `);
    }
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.email === 1) {
        res.send('<script>alert("Email Already Exist"); window.location.href = "login";</script>');
        return ;
    } else if (error.code === 11000 && error.keyPattern.username === 1) {
        res.send('<script>alert("Username Already Exist"); window.location.href = "login";</script>');
        return ;
    } else {
      res.status(500).send(error);
    }
  }
});

app.post("/check", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    // console.log(email);
    // console.log(password);
    const user = await User1.findOne({ email: email });
    if (user && user.password === password) {
      res.cookie("authToken", "123456789", { maxAge: 3600000, httpOnly: true });

      // Add this code to set a flag in the session indicating that the user is logged in
      req.session.loggedIn = true;
      req.session.usern = user.username;
      res.status(201).send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="0; URL=/index" />
        </head>
        <body>
          Redirecting...
        </body>
      </html>
    `);    } else {
        res.send('<script>alert("Incorrect Passward"); window.location.href = "login";</script>');
        return ;
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});


app.get("/logout", function (req, res) {
    // Destroy the user's session to log them out
    req.session.destroy(function (err) {
      if (err) {
        console.error(err);
        res.status(500).send("Server error");
      } else {
        // Redirect the user to the homepage after they have been logged out
        res.redirect("/");
      }
    });
  });



app.listen(port, () => {
  console.log(`server is running at port no ${port}`);
});
