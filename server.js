require('dotenv').config()

const nodemailer = require('nodemailer');
const axios = require('axios')
const express = require('express')
const port = 5000
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())

const User = require('./models/userSchema')
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);


const nodemailerPassword = process.env.NODEMAILER_PASSWORD;

// client.messages
//   .create({
//      body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
//      from: '+12184004507',
//      to: '+2348084929504'
//    })
//   .then(message => console.log(message.sid));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ebimieteimisongo@gmail.com',
    pass: nodemailerPassword
  }
});
let receiverMail = ''
let receiverName = ''
// Declare A variable for the school Result that'll be sent to the mail
let schoolResult = 'CSC401 : A <br> CSC403 : B<br> CSC409 : C<br> CSC411 : A<br> CSC413 : C'

// let mailOptions = {
//   from: 'ebimieteimisongo@gmail.com',
//   to: '',
//   subject: 'Sending Email using Node.js',
//   html: `<h1>School Result for ${receiverName}</h1> 
//         <h2>${schoolResult}</h2>`
// };

const sendMail = async (mail, name) => {
  let mailOptions = {
    from: 'ebimieteimisongo@gmail.com',
    to: mail,
    subject: 'Sending Email using Node.js',
    html: `<h1>School Result for ${name}</h1> 
          <h2>${schoolResult}</h2>`
  };
  // mailOptions.to = mail
  // receiverName = name
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
// sendMail('cryptoconvong@gmail.com')

app.post('/sendMail', (req, res) => {
  sendMail(req.body.email, req.body.name)
  console.log(req.body.name);
  res.status(200).send({data: 'Email sent'})
})

app.post('/signup', async (req, res) => {
  // check if user exists
  const { name, email, phone, password } = req.body
  const userExists = await User.findOne({ email: email })
  if (userExists) {
    res.status(201).send({data: 'User already exists'})
    return
  }
  const user = new User({ name, email, phone, password })
  try {
    await user.save()
    res.status(200).send({data: 'User created'})
  } catch (error) {
    res.status(400).send(error)
  }
})

app.post('/getusers', async (req, res) => {
  // exclude admins
  const users = await User.find({ role: 'user' })
  res.status(200).send({user: users})
})


app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email: email })
  if (!user) {
    res.status(400).send()
  } else {
    if (user.password !== password) {
      res.status(400).send()
    } else {
      if (user.role === 'admin') {
        res.status(200).send({
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        })
      } else {
        res.status(200).send({data: 'User logged in'})
      }
    }
  }
})

mongoose.connect(process.env.DB_URI)
  .then(() => app.listen(port, () => console.log(`Backend server is running`)))
  .catch((error) => console.log(error))