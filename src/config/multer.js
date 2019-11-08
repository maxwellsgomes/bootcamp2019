/* Multer: responsável pelo upload
   Crypto: utilizada para gerar caracteres aleatórios
   Extname: Retorna a extensão
   Resolve: Percorrer caminho dentro da aplicação */
import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        // Abaixo, vai renomear o arquivo Ex: 1a972adh3h.jpg
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
