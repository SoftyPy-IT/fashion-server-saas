import mongoose, { ObjectId } from 'mongoose';

export async function updateProductStockStatus(productId: ObjectId): Promise<void> {
  const ProductVariant = mongoose.model('ProductVariant');
  const Product = mongoose.model('Product');

  const variants = await ProductVariant.find({ productId });
  const hasStock = variants.some((variant) => variant.stock > 0);
}
