'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/utils/api';
import Image from 'next/image';

// Icons as SVG components
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const AttachIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

interface Tool {
  id: string;
  name: string;
  type: 'TOOL' | 'EQUIPMENT';
  serialNumber: string;
  itemNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  unitOfMeasurement: string;
  amount: number;
  price: number;
  datePurchased: string;
  currency: string;
  store: string;
  project: string;
  department: string;
  category: string;
  manufacturer: string;
  description: string;
  imageUrl?: string;
  warrantyUrl?: string;
  piDocumentUrl?: string;
}

interface ToolFormData {
  type: string;
  name: string;
  serialNumber: string;
  itemNumber: string;
  status: 'ACTIVE' | 'INACTIVE';
  unitOfMeasurement: string;
  amount: string;
  price: string;
  datePurchased: string;
  currency: string;
  store: string;
  project: string;
  department: string;
  category: string;
  manufacturer: string;
  description: string;
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState<ToolFormData>({
    type: '',
    name: '',
    serialNumber: '',
    itemNumber: '',
    status: 'ACTIVE',
    unitOfMeasurement: '',
    amount: '',
    price: '',
    datePurchased: '',
    currency: '',
    store: '',
    project: '',
    department: '',
    category: '',
    manufacturer: '',
    description: '',
  });

  const loadTools = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<{ items: Tool[] }>('/api/tools');
      if (response.success && response.data) {
        setTools(response.data.items || []);
      } else {
        setTools([]);
      }
    } catch {
      setTools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.itemNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedTools = filteredTools.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredTools.length / pageSize);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (toolId: string, checked: boolean) => {
    const newSelected = new Set(selectedTools);
    if (checked) {
      newSelected.add(toolId);
    } else {
      newSelected.delete(toolId);
    }
    setSelectedTools(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTools(new Set(paginatedTools.map(tool => tool.id)));
    } else {
      setSelectedTools(new Set());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert form data to API format
      const toolData = {
        ...formData,
        type: formData.type.toUpperCase(),
        amount: parseFloat(formData.amount),
        price: parseFloat(formData.price),
      };
      
      const response = await api.post('/api/tools', toolData);
      
      if (response.success) {
        setShowForm(false);
        // Refresh tools list
        loadTools();
        console.log('Tool created successfully');
      } else {
        console.error('Failed to create tool:', response.error);
      }
    } catch (error) {
      console.error('Error creating tool:', error);
    }
    
    setFormData({
      type: '',
      name: '',
      serialNumber: '',
      itemNumber: '',
      status: 'ACTIVE',
      unitOfMeasurement: '',
      amount: '',
      price: '',
      datePurchased: '',
      currency: '',
      store: '',
      project: '',
      department: '',
      category: '',
      manufacturer: '',
      description: '',
    });
  };

  useEffect(() => {
    loadTools();
  }, []);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Items Section */}
      <div className="w-1/2 bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">All Tools</h1>
            <p className="text-sm text-gray-500">Tools detail information</p>
          </div>

          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon />
                <span className="ml-2">Add Tool</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">
              <input
                type="checkbox"
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300"
              />
            </div>
            <div className="col-span-6">Tool Name</div>
            <div className="col-span-3">Serial Number</div>
            <div className="col-span-2">Image</div>
          </div>

          {/* Table Body */}
          <div>
            {paginatedTools.map((tool) => (
              <div
                key={tool.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTools.has(tool.id)}
                    onChange={(e) => handleCheckboxChange(tool.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                </div>
                <div className="col-span-6 flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                    <div className="text-xs text-gray-500">{tool.category}</div>
                  </div>
                </div>
                <div className="col-span-3 flex items-center">
                  <span className="text-sm text-gray-600">{tool.serialNumber}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {tool.imageUrl ? (
                      <Image
                        src={tool.imageUrl}
                        alt={tool.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredTools.length)} of {filteredTools.length} entries
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className={`flex-1 bg-white transition-all duration-300 ${showForm ? 'translate-x-0' : 'translate-x-full'}`}>
        {showForm && (
          <div className="h-full flex flex-col">
            <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Add New Tool</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose type</option>
                      <option value="tool">Tool</option>
                      <option value="equipment">Equipment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tool Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter tool name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image
                    </label>
                    <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-500">Choose file</span>
                      <AttachIcon />
                      <input type="file" className="hidden" accept="image/*" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serial Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      placeholder="Enter serial number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="itemNumber"
                      value={formData.itemNumber}
                      onChange={handleInputChange}
                      placeholder="Enter item number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit of Measurement <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="unitOfMeasurement"
                      value={formData.unitOfMeasurement}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose unit of measurement</option>
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilograms</option>
                      <option value="lbs">Pounds</option>
                      <option value="ft">Feet</option>
                      <option value="m">Meters</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Purchase <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="datePurchased"
                      value={formData.datePurchased}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose Currency</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="NGN">NGN</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PI Document
                    </label>
                    <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-500">Choose file</span>
                      <AttachIcon />
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Store <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="store"
                      value={formData.store}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose Store</option>
                      <option value="main-warehouse">Main Warehouse</option>
                      <option value="branch-1">Branch 1</option>
                      <option value="branch-2">Branch 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose project</option>
                      <option value="project-alpha">Project Alpha</option>
                      <option value="project-beta">Project Beta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose department</option>
                      <option value="operations">Operations</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="engineering">Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose category</option>
                      <option value="hand-tools">Hand Tools</option>
                      <option value="power-tools">Power Tools</option>
                      <option value="measuring-tools">Measuring Tools</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty
                    </label>
                    <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <span className="text-gray-500">Choose file</span>
                      <AttachIcon />
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manufacturer <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose manufacturer</option>
                      <option value="toolcorp">ToolCorp</option>
                      <option value="industrial-tools">Industrial Tools Ltd</option>
                      <option value="precision-instruments">Precision Instruments</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Tool
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
