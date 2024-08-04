const { google } = require("googleapis");
const { Readable } = require("stream");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: "named-griffin-431411-i1",
    private_key_id: "db706f2595ff890d15bfe6f0e8ff8f45059bb14a",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDoU5n/SyLzEonY\n8XEntlOWj0gDJmXDbkzofc62zJ3KXdyvQ0KTeC2vOJoZHQZT74zPV1tolULsUiXE\nedlAV7oTGtLYZqcNdojvp6EotlxrqPr/BpU2nrn8b5kd8pxLXKo/6AmJixiHUqVk\ncvYq+jk8e0xZ0C2u+Dhs3M8fy185qLZmmYsa1K2qg25TLrIruKRySa2Vd50MooYs\nyriy3VRrtnj/QNfcmdUpF7awWfcZ7o1JXDJhK5l1l8uEAMmQ0glvsfPTquWiu7oG\nJ3QXd75cZdj26M3w2M0W23Y+CGfAwS3uTWUvXn+8fezMGCkOjOIeLStpwrFJxv22\nGVjqDrdxAgMBAAECggEAY7WVr0KxEj+Pl+MvnEqdH04JKwjsve515YYxFLVGt1aH\nY1Trmt0GRmB1inexgo6aEVa9rWn6GfC7stJU0k+UVaS6fxO3eIi6BpkcCpwRmEci\nyhcqLRH8YoIG5hp8x79SdjEA/t4KvfFTeIP6cMGJlRKZ1yYIpUJ0/QvbfRrMmLKl\nlFT9RSJFOUgXyjLaklAE/KEAIYHYmjxQdl2ifXtrfmUTPmLX5tXm8QWLe+sNh+fq\n8HeIrbT0qrcdqxhk1ONV2rG7tmmseVWyG88qN37884FBHZlg4MF6sp03GXrssmYT\nexE+S7rl97hyrM1OQtZ1r9bpJJXwr6QdgVyqlpP4nQKBgQD2wrll5Spco7sbmwT9\nHPETH6+oyZ68vc2azuo0ZAeqIId0xvLzkLoxfIqK+nrIiUFkMqCw7b/XafK6LuyU\nXyIUwSLI7waPb32J//kmORSmVNDXXfAq64goSXSKleVrHD+UNYzRfhhcqlWmWwVA\nXxV4zxGYtXXhjxAiiNqo/0yfvwKBgQDxBoW5jhmyxbsNaIJZfo9KNxsbypUPMtFd\nCghNFm7YTcgSZV/dYdG78tj7dXIrEg0cV9TqexjNhouba2U7DY10PXwrOoMEUoOu\n5T+3GqyOxfwxul6Y71vX+srZbdmXFZPCW+Hd/3tm9DWYpRSXls3A07ioRUA/sQ8v\nhEXHGwl0zwKBgHGgZQLYrdMOygACOB/djd0CgD626NN8iwq4MPyC+0yJwhYx7nnd\nsP9Mm/c3NAbXvTbIYVpXgDlPXigBp4sC64ynCr9/4YN3EVXUewPw0ONutuQVK5x3\n7LCwcmvGbmgOD/DNX9SvvcQd42bBDv//SMHih/XLyUZePE3KuvWK6du9AoGAYD7U\ng2YlCOhAa3hCJO6O1Xnvz0c0Ap+uTtLEwdOla6aTsBTfFQ4MrFqrHq6lamGI7rp8\nAS4ql1eUw/k8sToWNEahILn6u20fvGU67ikuosyYilr7j2J1cGdrPSvKabRqDoCW\nTwnIAzKdfFjfQjEr9EYXRMpyf3x6reTJ4FoBiq0CgYASIK41yQeopwwJKBVbDb8T\nDCRpxsQxPE71hVbEpx9oCqaq/NvqbQbByAC7dO2t5b+qQ2N7bZhHFoLLy6Sv1Ou/\nzyu1qKkDleuOVMxKwVDeFlOg3J76k4nbnCXKMgGGB8d5eG/etUBH5POzAEOD0hNW\nAzNPMW4uFhA7umROfrh88w==\n-----END PRIVATE KEY-----\n",
    client_email:
      "innover-school@named-griffin-431411-i1.iam.gserviceaccount.com",
    client_id: "114060209645138916646",
  },
  scopes: SCOPES,
});
const drive = google.drive({ version: "v3", auth });
const uploadFileToDrive = async (file) => {
  const { originalname, buffer } = file;
  const fileMetadata = {
    name: originalname,
    parents: ["1XAadYn7BaDa1enMPRv_bKVRxOGJP8VdK"],
    // Specify the folder ID if you want to upload to a specific folder
  };
  const media = { mimeType: file.mimetype, body: Readable.from(buffer) };
  const response = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: "id, webViewLink",
  });
  return response.data;
};
module.exports = { uploadFileToDrive };
