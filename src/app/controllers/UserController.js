import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  /* Store para cadastrar usuário */
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const { id, name, email, provider } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  /* alteraçao dos dados cadastrais dos usuários */
  async update(req, res) {
    /* validação dos dados digitados */
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        /* when serve para condicionar algo
        neste caso, se o oldPassword estiver preenchido, o campo password
        devera ser preenchido tbm */
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      /* confirm password é mesma coisa: tem que digitar igual nos campos */
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    /* Verifica se os campos foram validados */
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    /* faz a alteração propriamente dita */
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);
    /* verifica se o novo email escolhido pelo usuário ja existe na base */
    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }
    /* verifica o password cadastrado na base */
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }
    const { id, name, provider } = await user.update(req.body);
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}
export default new UserController();
