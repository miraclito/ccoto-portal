import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import newsService from '../../services/newsService';
import categoryService from '../../services/categoryService';
import { toast } from 'react-toastify';

const CreateNews = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      toast.error('Error al cargar categorías');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const formData = {
        title: data.title,
        summary: data.summary,
        content: data.content,
        categoryId: data.categoryId,
        isPublished: data.isPublished,
      };

      if (data.image && data.image[0]) {
        formData.image = data.image[0];
      }

      await newsService.createNews(formData);
      toast.success('Noticia creada exitosamente');
      navigate('/admin/news');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear la noticia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Crear Nueva Noticia</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6">
        {/* Título */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            {...register('title', { required: 'El título es requerido' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Escribe el título de la noticia"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Categoría */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            {...register('categoryId', { required: 'La categoría es requerida' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Resumen */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resumen
          </label>
          <textarea
            {...register('summary')}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Breve resumen de la noticia (opcional)"
          />
        </div>

        {/* Contenido */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido *
          </label>
          <textarea
            {...register('content', { required: 'El contenido es requerido' })}
            rows="10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Escribe el contenido completo de la noticia"
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
          )}
        </div>

        {/* Imagen */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen
          </label>
          <input
            type="file"
            accept="image/*"
            {...register('image')}
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-w-md h-64 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Publicar */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('isPublished')}
              className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Publicar inmediatamente
            </span>
          </label>
        </div>

        {/* Botones */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Creando...' : 'Crear Noticia'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNews;
