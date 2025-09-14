import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Card, { ICard } from '../models/card';

// GET /cards — возвращает все карточки
export async function getCards(req: Request, res: Response, next: NextFunction) {
  try {
    const cards: ICard[] = await Card.find({}).populate('owner likes').exec();
    res.status(200).json(cards);
  } catch (err) {
    next(err);
  }
}

// POST /cards — создаёт карточку
export async function createCard(req: Request, res: Response, next: NextFunction) {
  const { name, link } = req.body || {};
  const owner = req.user?._id;
  try {
    const card = await Card.create({ name, link, owner });
    await card.populate('owner');
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
}

// DELETE /cards/:cardId — удаляет карточку по идентификатору
export async function deleteCard(req: Request, res: Response, next: NextFunction) {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return next({ statusCode: 400, message: 'Передан некорректный _id карточки' });
  }
  try {
    const card = await Card.findById(cardId);
    if (!card) {
      return next({ statusCode: 404, message: 'Карточка с указанным _id не найдена' });
    }
    if (card.owner.toString() !== req.user?._id) {
      return next({ statusCode: 403, message: 'Нет прав на удаление этой карточки' });
    }
    await card.deleteOne();
    res.status(200).json(card);
  } catch (err) {
    next(err);
  }
}

// PUT /cards/:cardId/likes — поставить лайк карточке
export async function likeCard(req: Request, res: Response, next: NextFunction) {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return next({ statusCode: 400, message: 'Передан некорректный _id карточки' });
  }
  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user?._id } },
      { new: true }
    ).populate('owner likes');
    if (!card) {
      return next({ statusCode: 404, message: 'Карточка с указанным _id не найдена' });
    }
    res.status(200).json(card);
  } catch (err) {
    next(err);
  }
}

// DELETE /cards/:cardId/likes — убрать лайк с карточки
export async function dislikeCard(req: Request, res: Response, next: NextFunction) {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return next({ statusCode: 400, message: 'Передан некорректный _id карточки' });
  }
  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user?._id } },
      { new: true }
    ).populate('owner likes');
    if (!card) {
      return next({ statusCode: 404, message: 'Карточка с указанным _id не найдена' });
    }
    res.status(200).json(card);
  } catch (err) {
    next(err);
  }
}
