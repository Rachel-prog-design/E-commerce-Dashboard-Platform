import React, { useEffect} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { useProduct, useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import type { ProductFormData } from '../../types/index';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required').trim().refine((v) => v.trim().length > 0, 'Cannot be empty spaces'),
  description: z.string().min(20, 'Description must be at least 20 characters').trim(),
  brand: z.string().min(1, 'Brand is required').trim().refine((v) => v.trim().length > 0, 'Cannot be empty spaces'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stock: z.coerce.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  categoryId: z.coerce.number().min(1, 'Please select a category'),
  images: z.array(z.object({ url: z.string().url('Must be a valid URL') })).min(1, 'At least one image URL is required'),
});
type ProductForm = z.infer<typeof productSchema>;

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const { data: existingProduct } = useProduct(isEdit ? Number(id) : 0);
  const { mutateAsync: createProduct, isPending: creating } = useCreateProduct();
  const { mutateAsync: updateProduct, isPending: updating } = useUpdateProduct();
  const isPending = creating || updating;

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: { images: [{ url: '' }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'images' });

  useEffect(() => {
    if (existingProduct && isEdit) {
      reset({
        title: existingProduct.title,
        description: existingProduct.description,
        brand: existingProduct.brand,
        price: existingProduct.price,
        stock: existingProduct.stock,
        categoryId: existingProduct.category?.id,
        images: existingProduct.images?.map((url) => ({ url })) || [{ url: '' }],
      });
    }
  }, [existingProduct, isEdit, reset]);

  const onSubmit = async (data: ProductForm) => {
    const payload: ProductFormData = {
      ...data,
      images: data.images.map((img) => img.url),
    };
    try {
      if (isEdit) {
        await updateProduct({ id: Number(id), data: payload });
        toast.success('Product updated!');
      } else {
        await createProduct(payload);
        toast.success('Product created!');
      }
      navigate('/admin');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Operation failed';
      toast.error(msg);
    }
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/admin')}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="product-form" noValidate>
        <div className="form-grid">
          <Input label="Product Title" error={errors.title?.message} {...register('title')} placeholder="iPhone 15 Pro" />
          <Input label="Brand" error={errors.brand?.message} {...register('brand')} placeholder="Apple" />
        </div>

        <div className="form-field">
          <label className="form-label">Description (min. 20 characters)</label>
          <textarea
            className={`form-input form-textarea ${errors.description ? 'form-input-error' : ''}`}
            {...register('description')}
            placeholder="Detailed product description..."
            rows={4}
          />
          {errors.description && <p className="form-error">{errors.description.message}</p>}
        </div>

        <div className="form-grid">
          <Input label="Price ($)" type="number" step="0.01" error={errors.price?.message} {...register('price')} placeholder="99.99" />
          <Input label="Stock Quantity" type="number" step="1" error={errors.stock?.message} {...register('stock')} placeholder="50" />
        </div>

        <div className="form-field">
          <label className="form-label">Category</label>
          <select className={`form-input ${errors.categoryId ? 'form-input-error' : ''}`} {...register('categoryId')}>
            <option value="">Select a category...</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="form-error">{errors.categoryId.message}</p>}
        </div>

        <div className="form-field">
          <label className="form-label">Product Images (URLs)</label>
          {fields.map((field, index) => (
            <div key={field.id} className="image-url-row">
              <input
                className={`form-input ${errors.images?.[index]?.url ? 'form-input-error' : ''}`}
                {...register(`images.${index}.url`)}
                placeholder="https://example.com/image.jpg"
              />
              {index > 0 && (
                <button type="button" className="action-btn action-delete" onClick={() => remove(index)}>
                  <Trash2 size={16} />
                </button>
              )}
              {errors.images?.[index]?.url && (
                <p className="form-error">{errors.images[index]?.url?.message}</p>
              )}
            </div>
          ))}
          {errors.images?.root && <p className="form-error">{errors.images.root.message}</p>}
          <button type="button" className="add-image-btn" onClick={() => append({ url: '' })}>
            <Plus size={16} /> Add Image URL
          </button>
        </div>

        <div className="form-actions">
          <Button type="button" variant="outline" onClick={() => navigate('/admin')}>Cancel</Button>
          <Button type="submit" loading={isPending} size="lg">
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;