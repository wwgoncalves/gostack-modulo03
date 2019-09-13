import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from "date-fns";
import { Op } from "sequelize";

import Appointment from "../models/Appointment";

class AvailableTimeController {
  async index(request, response) {
    const { date } = request.query; // "date" comes in an Unix timestamp format

    if (!date) {
      return response.status(400).json({ error: "Invalid date." });
    }

    const searchDate = Number(date);

    try {
      const appointments = await Appointment.findAll({
        where: {
          provider_id: request.params.providerId,
          cancelled_at: null,
          date: {
            [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
          },
        },
      });

      const timeSlots = [
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
      ]; // Temporarily(?) hardcoded

      const available = timeSlots.map(time => {
        const [hour, minute] = time.split(":");
        const value = setSeconds(
          setMinutes(setHours(searchDate, hour), minute),
          0
        );

        return {
          time,
          value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
          available:
            isAfter(value, new Date()) &&
            !appointments.find(a => format(a.date, "HH:mm") === time),
        };
      });

      return response.json(available);
    } catch (error) {
      return response.status(500).json({ error });
    }
  }
}

export default new AvailableTimeController();
