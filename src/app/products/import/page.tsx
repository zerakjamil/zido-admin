'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/contexts/ProductsContext';
import { ScrapingService } from '@/services/scraping';
import { ProductFormData, ScrapedProductData } from '@/types/product';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Download, Plus, Minus, ExternalLink } from 'lucide-react';

const ProductImportPage: React.FC = () => {
  const router = useRouter();
  const { addProduct } = useProducts();
  
  const [url, setUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedProductData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    colors: [],
    sizes: [],
    image_urls: [],
    source_url: ''
  });

  const handleExtractData = async () => {
    if (!url.trim()) {
      setExtractionError('Please enter a valid URL');
      return;
    }

    setIsExtracting(true);
    setExtractionError('');
    
    try {
      const data = await ScrapingService.scrapeProduct(url);
      setScrapedData(data);
      setFormData({
        name: data.name,
        description: data.description,
        price: data.price,
        currency: data.currency,
        colors: data.colors,
        sizes: data.sizes,
        image_urls: data.image_urls,
        source_url: url
      });
    } catch (error) {
      setExtractionError(error instanceof Error ? error.message : 'Failed to extract product data');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }

    setIsSaving(true);
    
    try {
      addProduct(formData);
      router.push('/products');
    } catch {
      alert('Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayItem = (field: 'colors' | 'sizes' | 'image_urls', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'colors' | 'sizes' | 'image_urls', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
          Import Product
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Extract product data from an e-commerce URL and review before saving
        </p>
      </div>

      {/* URL Input Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Step 1: Extract Product Data
        </h3>
        
        <div className="flex space-x-3">
          <div className="flex-1">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Product URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/product"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isExtracting}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExtractData}
              disabled={isExtracting || !url.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExtracting ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Extract Data
            </button>
          </div>
        </div>

        {/* Demo URL Helper */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">Try with a demo URL</p>
              <p className="text-xs text-blue-600">Shein product for testing</p>
            </div>
            <button
              onClick={() => setUrl('https://us.shein.com/Avantive-Metal-Trim-Halter-Neck-And-Off-The-Shoulder-Black-Top-Formal-Back-To-School-Halloween-Wedding-Guest-Vacation-Y2k-Beach-Cute-Teacher-Going-Out-Business-Casual-Elegant-Birthday-Office-Outfits-Country-Concert-Club-Western-Work-Clothes-Streetwear-Vintage-Festival-Cocktail-Rave-Prom-Airport-Funny-Basic-Brunch-Outfits-2000s-Style-Bodycon-Old-Money-Style-Church-Homecoming-Classy-Party-Modest-Fairycore-Coquette-Date-Night-Festival-Resort-Wear-Baddie-Stockholm-Style-Night-Out-p-86164532.html')}
              className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isExtracting}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Use Demo URL
            </button>
          </div>
        </div>

        {extractionError && (
          <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {extractionError}
          </div>
        )}

        {url && (
          <div className="mt-3">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View source page
            </a>
          </div>
        )}
      </div>

      {/* Product Form */}
      {(scrapedData || formData.name) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Step 2: Review and Edit Product Details
          </h3>

          <form className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <div className="flex-1">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="w-24">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <div className="space-y-3">
                {formData.image_urls.map((url, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Image
                      src={url}
                      alt={`Product image ${index + 1}`}
                      width={60}
                      height={60}
                      className="w-15 h-15 object-cover rounded-md"
                    />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...formData.image_urls];
                        newUrls[index] = e.target.value;
                        setFormData(prev => ({ ...prev, image_urls: newUrls }));
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Image URL"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('image_urls', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <div className="flex space-x-3">
                  <input
                    type="url"
                    placeholder="Add image URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        addArrayItem('image_urls', input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      addArrayItem('image_urls', input.value);
                      input.value = '';
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Colors and Sizes */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Colors
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.colors.map((color, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('colors', index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add color"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          addArrayItem('colors', input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        addArrayItem('colors', input.value);
                        input.value = '';
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Sizes
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.sizes.map((size, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeArrayItem('sizes', index)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Add size"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          addArrayItem('sizes', input.value);
                          input.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                        addArrayItem('sizes', input.value);
                        input.value = '';
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={isSaving || !formData.name.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductImportPage;
