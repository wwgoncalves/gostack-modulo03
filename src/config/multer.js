import multer from "multer";
import crypto from "crypto";
import { extname, resolve } from "path";

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, "..", "..", "tmp", "uploads"),
    filename: (request, file, cb) => {
      crypto.randomBytes(16, (error, result) => {
        if (error) return cb(error);

        return cb(
          null,
          `${result.toString("hex")}${extname(file.originalname)}`
        );
      });
    },
  }),
};
