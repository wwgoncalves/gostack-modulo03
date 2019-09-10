import * as Yup from "yup";
import { startOfHour, parseISO, isBefore, format } from "date-fns";
import enUS from "date-fns/locale/en-US";

import Appointment from "../models/Appointment";
import User from "../models/User";
import File from "../models/File";
import Notification from "../schemas/Notification";

class AppointmentController {
  async index(request, response) {
    const { page = 1 } = request.query;
    try {
      const appointments = await Appointment.findAll({
        where: {
          user_id: request.userId,
          cancelled_at: null,
        },
        order: ["date"],
        attributes: ["id", "date"],
        limit: 20,
        offset: (page - 1) * 20,
        include: [
          {
            model: User,
            as: "provider",
            attributes: ["id", "name"],
            include: [
              {
                model: File,
                as: "avatar",
                attributes: ["path", "url"],
              },
            ],
          },
        ],
      });

      return response.json(appointments);
    } catch (error) {
      return response.status(500).json({ error });
    }
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    try {
      if (!(await schema.isValid(request.body))) {
        return response.status(400).json({ error: "Validation fails" });
      }

      const { provider_id, date } = request.body;

      if (provider_id === request.userId) {
        return response
          .status(400)
          .json({ error: "Consumer and provider must be different users." });
      }

      /**
       * Check if provider_id is a provider
       */

      const isProvider = await User.findOne({
        where: { id: provider_id, provider: true },
      });

      if (!isProvider) {
        return response
          .status(401)
          .json({ error: "You can only make appointments with providers." });
      }

      /**
       * Check for past dates
       */
      const hourStart = startOfHour(parseISO(date));

      if (isBefore(hourStart, new Date())) {
        return response
          .status(400)
          .json({ error: "Past dates are forbidden." });
      }

      /**
       * Check date availabitity
       */
      const checkAvailability = await Appointment.findOne({
        where: {
          provider_id,
          cancelled_at: null,
          date: hourStart,
        },
      });

      if (checkAvailability) {
        return response
          .status(400)
          .json({ error: "Appointment date is unavailable." });
      }

      const appointment = await Appointment.create({
        user_id: request.userId,
        provider_id,
        date,
      });

      /**
       * Notify appointment to provider
       */
      const user = await User.findByPk(request.userId);
      const formattedDate = format(
        hourStart,
        "'on' iiii',' MMMM dd 'at' H:mm '('zzzz')'",
        { locale: enUS }
      );

      await Notification.create({
        content: `New appointment from ${user.name} ${formattedDate}.`,
        user: provider_id,
      });

      return response.status(201).json(appointment);
    } catch (error) {
      return response.status(500).json({ error });
    }
  }
}

export default new AppointmentController();
