const path = require("path");
const fs = require("fs");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Netlify Functions tidak support multipart langsung,
  // jadi kita perlu library "busboy" untuk parse form-data.
  const Busboy = require("busboy");

  return new Promise((resolve, reject) => {
    try {
      const busboy = Busboy({ headers: event.headers });
      let saveTo, fileName;

      busboy.on("file", (fieldname, file, filename) => {
        fileName = Date.now() + "-" + filename.filename;
        saveTo = path.join(__dirname, "../../uploads", fileName);
        file.pipe(fs.createWriteStream(saveTo));
      });

      busboy.on("finish", () => {
        const url = `https://${process.env.URL}/uploads/${fileName}`;
        resolve({
          statusCode: 200,
          body: JSON.stringify({ url }),
        });
      });

      busboy.end(Buffer.from(event.body, "base64"));
    } catch (err) {
      reject({ statusCode: 500, body: "Upload failed" });
    }
  });
};
