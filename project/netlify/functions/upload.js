const cloudinary = require("cloudinary").v2;
const Busboy = require("busboy");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ddbqhpuoz,
  api_key: process.env.CLOUDINARY_153735887162795,
  api_secret: process.env.CLOUDINARY_DY8Qrmg8CVKjFoA25XDwMiEQk4o,
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  return new Promise((resolve, reject) => {
    try {
      const busboy = Busboy({ headers: event.headers });
      let fileBuffer = [];

      busboy.on("file", (fieldname, file) => {
        file.on("data", (data) => fileBuffer.push(data));
      });

      busboy.on("finish", async () => {
        try {
          const buffer = Buffer.concat(fileBuffer);
          const uploadRes = await cloudinary.uploader.upload_stream(
            { folder: "netlify_uploads" },
            (err, result) => {
              if (err) {
                reject({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
              } else {
                resolve({
                  statusCode: 200,
                  body: JSON.stringify({ url: result.secure_url }),
                });
              }
            }
          );
          // pipe data ke cloudinary
          const stream = uploadRes;
          stream.end(buffer);
        } catch (err) {
          reject({ statusCode: 500, body: JSON.stringify({ error: err.message }) });
        }
      });

      busboy.end(Buffer.from(event.body, "base64"));
    } catch (err) {
      reject({ statusCode: 500, body: "Upload failed" });
    }
  });
};
