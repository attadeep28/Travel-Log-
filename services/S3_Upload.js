const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { createReadStream } = require("fs");
const fs = require("fs");

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to upload file to S3
async function uploadFileToS3(bucketName, file) {
  const fileStream = createReadStream(file.path);
  const fileName = `${Date.now()}-Cover`;
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileStream,
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("File uploaded successfully:", data);

    return `https://${bucketName}.s3.amazonaws.com/${fileName}`;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err; // Re-throw the error to handle it in the calling function
  }
}

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully.");
    }
  });
}

module.exports = {
  deleteFile,
  uploadFileToS3,
};
