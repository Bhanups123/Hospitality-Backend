# Hospitality
<img src="https://user-images.githubusercontent.com/38679082/79780084-03f5f480-8359-11ea-8083-399d62bf484e.png" alt="Login Activity" width="250"/>

A Node.js-based backend for [Hospitality-MobileClient](https://github.com/saarthak08/Hospitality-MobileClient) which can be used to find out the nearest hospitals to you in a specific given input range and can be used to check the statistics and the availabilities of the hospitals. Moreover, users can also book appointments with respective hospitals.


### [Hospitality-MobileClient](https://github.com/saarthak08/Hospitality-MobileClient)


## How it works?
- It is a two-faced application i.e. there are two clients: `Hospital` & `Patient`. 
- Both hospitals and users will signup and provide their locations to the application.
- When a user will provide an input distance to the app, our algorithm will find out the nearest hospitals to him/her within the provided input distance.
- Hospitals will have to update their statistics (like total beds, available beds, total doctors, available doctors, hospital availability etc)  regularly.
- Users can check out the hospitals' stats and can request for an appointment booking with the hospital as per the hospital availability stats provided by the hospital.
- Hospitals will response to these bookings as per their availability and convenience.


## Features:
- Search hospitals near you with the help of our custom algorithm.
- Get the location of the hospitals on Google Maps.
- JWT-Token-based authentication system.
- Request for appointment booking and track the appointment status.


## Tech-Stack Used:
- [Node.js](https://nodejs.org/en/) for backend development.
- [Flutter](https://flutter.dev/) for mobile application development.
- [Google Maps API](https://developers.google.com/maps/documentation) for showing the hospitals' search result on Google Maps.
- [Docker](https://www.docker.com/) for development and deployment purposes.
- [SendGrid](https://app.sendgrid.com/) for SMTP purposes.


## Note:
- To run this app, follow the steps below:
- - Run `npm install` in the terminal in the project's directory to install the dependencies.
- - Create a file named `key.js` and place it in `config` folder of the project's directory.
- - In `key.js` export an object with keys: `mongoURI`, `secretOrKey`, `API_KEY` and values: `YOUR_OWN_MONGODB_URI`, `JWT_SECRET_KEY`, `YOUR_OWN_SENDGRID_APIKEY` respectively.
- - So, your `key.js` will look like this: 
```
module.exports = {
  mongoURI:
    "YOUR_OWN_MONGODB_URI",
  secretOrKey: "JWT_SECRET_KEY",
  API_KEY: "YOUR_OWN_SENDGRID_APIKEY",
};
```
