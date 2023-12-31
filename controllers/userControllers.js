const { usersRef, firebase, auth } = require('../db/firebase');
// const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const registerUser = async (req, res) => {
  const { email, password } = req.body;
  const date = new Date();
  const dateTime = date.toISOString();

  try {
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: true,
    });

    const userId = userRecord.uid;
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      createdAt: dateTime,
    };

    await usersRef.doc(userId).set(userData);

    res.json({
      message: 'Pendaftaran akun berhasil',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Pendaftaran akun gagal' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const idToken = await userCredential.user.getIdToken();
    const userId = await userCredential.user.uid;
    res.json({
      message: 'Login berhasil',
      data: { token: idToken, uid: userId, email: email },
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: 'Login gagal, email atau password salah' });
  }
};

module.exports = { registerUser, loginUser };
