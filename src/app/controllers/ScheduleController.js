import { startOfDay, endOfDay, parseISO } from "date-fns";
import { Op } from "sequelize";

import User from "../models/User";
import Appointment from "../models/Appointment";

class ScheduleController {
  async index(request, response) {
    const isProvider = await User.findOne({
      where: {
        id: request.userId,
        provider: true,
      },
    });

    if (!isProvider) {
      return response.status(401).json({ error: "User is not a provider." });
    }

    const { date } = request.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: request.userId,
        cancelled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name"],
        },
      ],
      order: ["date"],
    });

    return response.json(appointments);
  }
}

export default new ScheduleController();
