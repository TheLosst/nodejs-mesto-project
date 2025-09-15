import { Router } from 'express';
import { getUsers, getUserById, createUser, updateProfile, updateAvatar } from '../controllers/users';
import { celebrate, Joi, Segments } from 'celebrate';

const router = Router();

router.get('/', getUsers);
router.get(
	'/:userId',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			userId: Joi.string().hex().length(24).required(),
		}),
	}),
	getUserById
);
router.post('/', createUser);
router.patch('/me', 
	celebrate({
		[Segments.BODY]: Joi.object().keys({
			name: Joi.string().min(2).max(30).required(),
			about: Joi.string().min(2).max(200).required(),
		}),
	}),
	updateProfile
);
router.patch('/me/avatar', 
	celebrate({
		[Segments.BODY]: Joi.object().keys({
			avatar: Joi.string().pattern(/^(https?:\/\/)(www\.)?([\w-]+\.)+[a-zA-Z]{2,}(\/[\-\w._~:/?#[\]@!$&'()*+,;=]*)?#?$/).required(),
		}),
	}),
	updateAvatar
);

export default router;
