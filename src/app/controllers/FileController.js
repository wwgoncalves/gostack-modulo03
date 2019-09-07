import File from "../models/File";

class FileController {
  async store(request, response) {
    const { originalname: name, filename: path } = request.file;

    try {
      const file = await File.create({
        name,
        path,
      });

      return response.json(file);
    } catch (error) {
      return response.status(500).json({ error });
    }
  }
}

export default new FileController();
