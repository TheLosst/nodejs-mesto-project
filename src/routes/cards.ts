import { Router } from 'express';
import { getCards, createCard, deleteCard, likeCard, dislikeCard } from '../controllers/cards';
import { celebrate, Joi, Segments } from 'celebrate';

const router = Router();

router.get('/', getCards);
router.post('/', createCard);
router.delete(
	'/:cardId',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			cardId: Joi.string().hex().length(24).required(),
		}),
	}),
	deleteCard
);
router.put(
	'/:cardId/likes',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			cardId: Joi.string().hex().length(24).required(),
		}),
	}),
	likeCard
);
router.delete(
	'/:cardId/likes',
	celebrate({
		[Segments.PARAMS]: Joi.object().keys({
			cardId: Joi.string().hex().length(24).required(),
		}),
	}),
	dislikeCard
);

export default router;
