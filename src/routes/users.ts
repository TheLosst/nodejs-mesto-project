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
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);

export default router;
