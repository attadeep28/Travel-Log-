const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
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
    
    deleteFile(file.path);

    return `https://${bucketName}.s3.amazonaws.com/${fileName}`;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err; 
  }
}
async function deleteFileFromS3(fileURL) {
  // Extract the key from the file URL
  const urlParts = fileURL.split("/");
  const fileName = urlParts[urlParts.length - 1];

  const deleteParams = {
    Bucket: process.env.S3_BUCKET, 
    Key: fileName,
  };

  try {
    const data = await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log("File deleted successfully:", data);
  } catch (err) {
    console.error("Error deleting file:", err);
    throw err; 
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
  deleteFileFromS3,
};
