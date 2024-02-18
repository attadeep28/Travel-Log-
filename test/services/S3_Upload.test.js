// const fs = require("fs");
// const tmp = require("tmp");
// const sinon = require("sinon");
// const { expect } = require("chai");
// const { S3Client } = require("@aws-sdk/client-s3");
// const { uploadFileToS3 } = require("../../services/S3_Upload");

// describe("uploadFileToS3", () => {
//   let s3ClientStub;
//   let tempFilePath;

//   before(() => {
//     // Create a temporary file for testing
//     tempFilePath = tmp.fileSync().name;
//     // Write some content to the file
//     fs.writeFileSync(tempFilePath, "Test content");
//   });

//   beforeEach(() => {
//     s3ClientStub = sinon.stub(S3Client.prototype, "send");
//   });

//   afterEach(() => {
//     sinon.restore();
//   });

//   it("should upload file to S3", async () => {
//     const bucketName = "test-bucket";
//     const file = {
//       path: tempFilePath,
//     };

//     const mockResponse = {
//       ETag: "mockETag",
//       Location: `https://${bucketName}.s3.amazonaws.com/mockFileName`,
//     };
//     s3ClientStub.resolves(mockResponse);

//     const result = await uploadFileToS3(bucketName, file);
//     expect(result).to.be.string;
//   });

//   after(() => {
//     // Delete the temporary file after the test
//     fs.unlinkSync(tempFilePath);
//   });
// });
