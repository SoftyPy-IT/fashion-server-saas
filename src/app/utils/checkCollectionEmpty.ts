import mongoose from 'mongoose';

export const checkCollectionEmpty = async (model: mongoose.Model<any>): Promise<boolean> => {
  const collectionName = model.collection.collectionName;
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionExists = collections.some((collection) => collection.name === collectionName);

  if (!collectionExists) {
    return true; // Collection does not exist, so it's considered empty
  }

  const documentCount = await model.countDocuments();
  return documentCount === 0;
};
