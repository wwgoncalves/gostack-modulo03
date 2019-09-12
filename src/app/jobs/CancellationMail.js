import { format, parseISO } from "date-fns";
import enUS from "date-fns/locale/en-US";

import Mail from "../../lib/Mail";

class CancellationMail {
  get key() {
    return "CancellationMail";
  }

  // Handle the task to be executed
  async handle({ data }) {
    const { appointment } = data;

    return Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: "Cancelled appointment",
      template: "cancellation",
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          "'on' iiii',' MMMM dd 'at' H:mm '('zzzz')'",
          { locale: enUS }
        ),
      },
    });
  }
}

export default new CancellationMail();
