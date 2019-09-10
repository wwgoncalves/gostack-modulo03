import User from "../models/User";
import Notification from "../schemas/Notification";

class NotificationController {
  async index(request, response) {
    try {
      const isProvider = await User.findOne({
        where: {
          id: request.userId,
          provider: true,
        },
      });

      if (!isProvider) {
        return response.status(401).json({ error: "User is not a provider." });
      }

      const notifications = await Notification.find({
        user: request.userId,
      })
        .sort("-createdAt")
        .limit(20);

      return response.json(notifications);
    } catch (error) {
      return response.status(500).json({ error });
    }
  }

  async update(request, response) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        request.params.id,
        { read: true },
        { new: true }
      );

      return response.json(notification);
    } catch (error) {
      return response.status(500).json({ error });
    }
  }
}

export default new NotificationController();
