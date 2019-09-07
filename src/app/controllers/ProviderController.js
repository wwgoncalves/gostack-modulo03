import User from "../models/User";
import File from "../models/File";

class ProviderController {
  async index(request, response) {
    try {
      const providers = await User.findAll({
        where: { provider: true },
        attributes: ["id", "name", "email", "avatar_id"],
        include: [
          {
            model: File,
            as: "avatar",
            attributes: ["name", "path", "url"],
          },
        ],
      });

      return response.json({ providers });
    } catch (error) {
      return response.status(500).json({ error });
    }
  }
}

export default new ProviderController();
