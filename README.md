# Moveout

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Scripts](#scripts)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Overview

**Moveout** is a MERN web application that help people to organize moving boxes when it is time to move to a new place.

<p>
   <img src="https://img.shields.io/badge/MongoDB-47A248.svg?style=flat&logo=mongodb&logoColor=white" alt="MongoDB">
   <img src="https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white" alt="Express">
   <img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=react&logoColor=black" alt="React">
   <img src="https://img.shields.io/badge/Node.js-339933.svg?style=flat&logo=node.js&logoColor=white" alt="Node.js">
   <img src="https://img.shields.io/badge/BcryptJS-339933.svg?style=flat&logo=lock&logoColor=white" alt="BcryptJS">
   <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
   <img src="https://img.shields.io/badge/Nodemailer-339933.svg?style=flat&logo=nodemailer&logoColor=white" alt="Nodemailer">
   <img src="https://img.shields.io/badge/Multer-339933.svg?style=flat&logo=storage&logoColor=black" alt="Multer">
   <img src="https://img.shields.io/badge/Dotenv-339933.svg?style=flat&logo=dotenv&logoColor=white" alt="Dotenv">
   <img src="https://img.shields.io/badge/JSONWebToken-339933.svg?style=flat&logo=jsonwebtokens&logoColor=white" alt="JSONWebToken">
   <img src="https://img.shields.io/badge/Mongoose-47A248.svg?style=flat&logo=mongoose&logoColor=white" alt="Mongoose">
   <img src="https://img.shields.io/badge/Nodemon-339933.svg?style=flat&logo=nodemon&logoColor=white" alt="Nodemon">
   <img src="https://img.shields.io/badge/HTML2Canvas-61DAFB.svg?style=flat&logo=html2canvas&logoColor=white" alt="HTML2Canvas">
   <img src="https://img.shields.io/badge/JSPDF-61DAFB.svg?style=flat&logo=jspdf&logoColor=white" alt="JSPDF">
   <img src="https://img.shields.io/badge/QRCode-61DAFB.svg?style=flat&logo=qrcode.react&logoColor=white" alt="QRCode.react">
   <img src="https://img.shields.io/badge/React--H5--Audio--Player-61DAFB.svg?style=flat&logo=react-h5-audio-player&logoColor=white" alt="React-H5-Audio-Player">
   <img src="https://img.shields.io/badge/React--Icons-61DAFB.svg?style=flat&logo=react-icons&logoColor=white" alt="React-Icons">
   <img src="https://img.shields.io/badge/React--Redux-764ABC.svg?style=flat&logo=redux&logoColor=white" alt="React-Redux">
   <img src="https://img.shields.io/badge/React--Router-61DAFB.svg?style=flat&logo=react-router&logoColor=white" alt="React-Router">
   <img src="https://img.shields.io/badge/React--Toastify-61DAFB.svg?style=flat&logo=react-toastify&logoColor=white" alt="React-Toastify">
</p>

## Requirements

- **Node.js** version 20.17 or higher
- **MongoDB**
- **NPM**

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/eliasbakhshi/mern-moveout.git
   ```

2. Navigate to the project directory:

   ```bash
   cd mern-moveout
   ```

3. Make a .env file

   ```bash
   cp .env.production .env
   ```

4. Install the dependencies:

   ```bash
   npm install
   ```

5. Go to the front-end folder:

   ```bash
   cd frontend
   ```

6. Install the dependencies for the front end:

   ```bash
   npm install
   ```

7. Change directory to the back-end folder:

   ```bash
   cd ..
   cd backend
   ```

8. Install the dependencies for the back end:

   ```bash
   npm install
   ```

9. Go back to the root and run the scripts:

   ```bash
   cd ..
   ```

## Scripts

For running both the frontend and backend servers concurrently.

```bash
 npm start
```

This starts the backend server using nodemon.

```bash
 npm run backend
```

This starts the frontend server.

```bash
 npm run frontend
```

## Usage

#### **Registration/Login:**

- Guests can sign up using their email/password or Gmail accounts. An email verification will be sent to guests's email to verify their email if they register with the registration form.
- The email should be verified first to be able to login to the application. If the user login with the Gmail their email will be verified.
- when users login with Gmail, their avatar will be replaced on the user's account if they have no picture uploaded as profile picture.
- Guests can reset their password and request a new verification email.
- Users who are not active for 3 weeks will receive a reminder email to log in to the web application to renew their activation time. If they do not log in, their account will be deactivated the week after (one month after the last activity).

![Registraiton and login](frontend/public/previews/registraiton-login.gif)

#### **Boxes and Items:**

- Users can manage all kinds of digital boxes with customized items related to specific types.
- Users can share boxes with other registered users, and the information about the shared boxes will be sent to the recipient's email.
- There are two types of boxes: standard and insurance with different items types and views.

![Boxes and Items](frontend/public/previews/box-item.gif)

#### **Labels:**

- Users can share the label with other registered users.
- Users can download the label in PDF form.

![Label](frontend/public/previews/label.gif)

#### **Profile:**

- Users can view and manage their profiles.
- Users can deactivate and activate their accounts. Upon deactivation, an email will be sent to the user.
- Users can soft delete their accounts after deactivating. An email will be sent to the user to confirm the deletion.
- If the user is deactivated, they can only visit the profile page and not other pages that require users to be logged in.

![Profile](frontend/public/previews/profile.gif)

#### **Users List:**

- Admins can manage users and soft delete or delete users.
- Users created by admins can log in to the app without verifying their email.
- Admins can see a list of registered users, a list of deleted users, and how much space they have used.
- Admins can send marketing emails to all users or just selected users.

![Users List](frontend/public/previews/users-list.gif)

#### **Box-Details:**

- Guests can only view the box details (items) by scanning the QR code. If the box is private, they must enter a 6-digit code before visiting the page.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository** (if you haven’t already) by going to the main repository on GitHub and clicking the “Fork” button at the top-right of the page.

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m 'Add Your Feature'
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Send a poll request**

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

- **Email:** Bakhshielias@gmail.com
- **LinkedIn:** [Elias Bakhshi](https://www.linkedin.com/in/eliasbakhshi)
- **GitHub:** [EliasBakhshi](https://github.com/eliasbakhshi)
