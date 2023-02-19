// import { CourierClient } from "@trycourier/courier";
const CourierClient = require("@trycourier/courier");

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

async function getRandomActivity(){
  let responce = await fetch("http://www.boredapi.com/api/activity/");
  return await (responce).json();
}

async function renderMainPage(req, res) {
  res.locals.complete = res.locals.complete || false;
  res.locals.activity = await getRandomActivity();
  res.render('pages/index')
}

async function onFormAction(req, res) {
  const formData = req.body;
  const email = formData.email;
  const courier = CourierClient.CourierClient({ authorizationToken: process.env.AUTH_TOKEN });
  const activity = await getRandomActivity();

  let message = "Your random activity fo today is:\n" + activity.activity + "\n";
  if (activity.link) {
    message += "Link: " + activity.link + "\n";
  }
  message += "Type: " + activity.type + "\n";
  message += "Participants: " + activity.participants + "\n";


  const { requestId } = await courier.send({
    message: {
      to: {
        email: email,
      },
      content: {
        title: "New activity for today!",
        body: message,
      },
      routing: {
        method: "single",
        channels: ["email"],
      },
    },
  });

  res.locals.complete = true;
  await renderMainPage(req, res);
}

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: true }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', renderMainPage)
  .post('/', onFormAction)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));


