import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Card, { ICard } from '../models/card';

// GET /cards — возвращает все карточки
export async function getCards(req: Request, res: Response) {
  try {
    const cards: ICard[] = await Card.find({}).populate('owner likes').exec();
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
}

// POST /cards — создаёт карточку
export async function createCard(req: Request, res: Response) {
  const { name, link } = req.body || {};
  const owner = req.user?._id;
  try {
    const card = await Card.create({ name, link, owner });
    // populate owner для фронта
    await card.populate('owner');
    res.status(201).json(card);
  } catch (err: any) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Переданы некорректные данные при создании карточки' });
    }
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
}

// DELETE /cards/:cardId — удаляет карточку по идентификатору
export async function deleteCard(req: Request, res: Response) {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Передан некорректный _id карточки' });
  }
  try {
    const card = await Card.findById(cardId);
    if (!card) {
  return res.status(404).json({ message: 'Карточка с указанным _id не найдена' });
    }
    // Только владелец может удалить
    if (card.owner.toString() !== req.user?._id) {
      return res.status(403).json({ message: 'Нет прав на удаление этой карточки' });
    }
    await card.deleteOne();
    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
}

// PUT /cards/:cardId/likes — поставить лайк карточке
export async function likeCard(req: Request, res: Response) {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Передан некорректный _id карточки' });
  }
  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user?._id } },
      { new: true }
    ).populate('owner likes');
    if (!card) {
  return res.status(404).json({ message: 'Карточка с указанным _id не найдена' });
    }
    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
}

// DELETE /cards/:cardId/likes — убрать лайк с карточки
export async function dislikeCard(req: Request, res: Response) {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Передан некорректный _id карточки' });
  }
  try {
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user?._id } },
      { new: true }
    ).populate('owner likes');
    if (!card) {
  return res.status(404).json({ message: 'Карточка с указанным _id не найдена' });
    }
    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка по умолчанию' });
  }
}
