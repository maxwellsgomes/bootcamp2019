import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    /* Validação de campo: verifica se os dados digitados estão
    corretos ou se não há campos vazios */
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    /* Verifica se os campos foram validados */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }
    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      /* O metodo sign é para criação do payload(informações adicionais),
      o primeiro parametro passado é o id do usuário que poderá ser utilizado posteriormente.
      O segundo parâmetro é uma string que deverá ser única, seguro e que só voce tem acesso
      Abaixo colocamos a palavra budega, mas pode ser uma palavra criptografada com ferramentas
      online (md5Online.org) */
      token: jwt.sign({ id }, authConfig.secret, {
        /* Tempo que o token expira */
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}
export default new SessionController();
