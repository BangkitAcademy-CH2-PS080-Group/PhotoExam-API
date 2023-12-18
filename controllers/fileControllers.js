const { usersRef } = require('../db/firebase');
const { v4: uuidv4 } = require('uuid');
const { bucket } = require('../db/cloudStorage');

const addFiles = async (req, res) => {
  try {
    const uploadedFile = req.files;
    const { description, studentName, keyAnswer } = req.body;
    const documentId = req.user.uid;
    const score = 1;
    const studentAnswer = 'lorem ipsum dolor sit amet';

    if (!uploadedFile || uploadedFile.length === 0) {
      return res.status(404).json({ message: 'File tidak ditemukan' });
    }

    const uploadedData = [];

    for (const file of uploadedFile) {
      const fileId = uuidv4();
      const fileName = `${fileId}_${file.originalname}`;
      const storageFile = bucket.file(fileName);
      await storageFile.save(file.buffer);
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      const date = new Date();
      const dateTime = date.toISOString();

      const fileData = {
        fileId: fileId,
        fileName: file.originalname,
        storageUrl: publicUrl,
        createdAt: dateTime,
        description: description,
        studentName: studentName,
        studentAnswer: studentAnswer,
        keyAnswer: keyAnswer,
        score: score,
      };

      await usersRef
        .doc(documentId)
        .collection('files')
        .doc(fileId)
        .set(fileData);

      uploadedData.push(fileData);
    }

    res.json({
      message: 'Berhasil upload',
      data: uploadedData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat upload file' });
  }
};

const getFiles = async (req, res) => {
  try {
    const documentId = req.user.uid;

    const querySnapshot = await usersRef
      .doc(documentId)
      .collection('files')
      .get();

    const files = [];
    querySnapshot.forEach((doc) => {
      files.push(doc.data());
    });

    res.json({
      message: 'Berhasil mendapatkan semua data',
      data: files,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil file' });
  }
};

const getFileById = async (req, res) => {
  try {
    const documentId = req.user.uid;
    const fileId = req.params.fileId;

    const fileDoc = await usersRef
      .doc(documentId)
      .collection('files')
      .doc(fileId)
      .get();

    if (!fileDoc.exists) {
      return res.status(404).json({ message: 'File tidak ditemukan' });
    }

    const fileData = fileDoc.data();

    res.json({
      message: 'Berhasil mendapatkan satu data',
      data: fileData,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil file' });
  }
};

const deleteFile = async (req, res) => {
  try {
    const documentId = req.user.uid;
    const fileId = req.params.fileId;

    const fileDoc = await usersRef
      .doc(documentId)
      .collection('files')
      .doc(fileId)
      .get();

    if (!fileDoc.exists) {
      return res.status(404).json({ message: 'File tidak ditemukan' });
    }

    const fileName = `${fileId}_${fileDoc.data().fileName}`;
    const storageFile = bucket.file(fileName);
    await storageFile.delete();

    await usersRef.doc(documentId).collection('files').doc(fileId).delete();

    res.json({
      message: 'Berhasil menghapus satu data',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus file' });
  }
};

module.exports = { addFiles, getFiles, getFileById, deleteFile };
