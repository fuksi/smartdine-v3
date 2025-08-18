"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Package,
  FolderOpen,
  Settings,
} from "lucide-react";

interface ProductOption {
  id: string;
  name: string;
  description?: string;
  type: string;
  isRequired: boolean;
  sortOrder: number;
  optionValues: ProductOptionValue[];
}

interface ProductOptionValue {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  sortOrder: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  sortOrder: number;
  options: ProductOption[];
}

interface Category {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  products: Product[];
}

interface MenuData {
  id: string;
  name: string;
  locationId: string;
  categories: Category[];
}

export default function MenuManagementPage() {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [editingItem, setEditingItem] = useState<{
    type: string;
    id?: string;
    categoryId?: string;
  } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sortOrder: "",
    isActive: true,
    isAvailable: true,
    isRequired: false,
    type: "RADIO",
  });

  // Option management states
  const [availableOptions, setAvailableOptions] = useState<ProductOption[]>([]);
  const [showOptionManager, setShowOptionManager] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [creatingOption, setCreatingOption] = useState(false);
  const [newOptionData, setNewOptionData] = useState({
    name: "",
    description: "",
    type: "RADIO" as "RADIO" | "MULTISELECT",
    isRequired: false,
  });

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      // For now, we'll get the first location's menu
      const response = await fetch("/api/admin/menu");
      if (response.ok) {
        const data = await response.json();
        setMenuData(data.menu);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const startEditing = (type: string, item?: any, categoryId?: string) => {
    setEditingItem({ type, id: item?.id, categoryId });
    setFormData({
      name: item?.name || "",
      description: item?.description || "",
      price: (item as Product)?.price?.toString() || "",
      sortOrder: item?.sortOrder?.toString() || "0",
      isActive: (item as Category)?.isActive ?? true,
      isAvailable: (item as Product)?.isAvailable ?? true,
      isRequired: (item as ProductOption)?.isRequired ?? false,
      type: (item as ProductOption)?.type || "RADIO",
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      sortOrder: "",
      isActive: true,
      isAvailable: true,
      isRequired: false,
      type: "RADIO",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !menuData) return;

    try {
      const endpoint = editingItem.id
        ? `/api/admin/menu/${editingItem.type}/${editingItem.id}`
        : `/api/admin/menu/${editingItem.type}`;

      const method = editingItem.id ? "PATCH" : "POST";

      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
        sortOrder: parseInt(formData.sortOrder) || 0,
        menuId: menuData.id,
        categoryId: editingItem.categoryId,
      };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchMenuData();
        cancelEditing();
      } else {
        throw new Error("Failed to save item");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item");
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/admin/menu/${type}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchMenuData();
      } else {
        throw new Error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  const toggleItemStatus = async (
    type: string,
    id: string,
    field: string,
    currentValue: boolean
  ) => {
    try {
      const response = await fetch(`/api/admin/menu/${type}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue }),
      });

      if (response.ok) {
        await fetchMenuData();
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  // Option Management Functions
  const fetchAvailableOptions = async () => {
    try {
      const response = await fetch("/api/admin/options/available");
      if (response.ok) {
        const data = await response.json();
        setAvailableOptions(data.options || []);
      }
    } catch (error) {
      console.error("Error fetching available options:", error);
    }
  };

  const openOptionManager = (productId: string) => {
    setSelectedProductId(productId);
    setShowOptionManager(true);
    fetchAvailableOptions();
  };

  const closeOptionManager = () => {
    setShowOptionManager(false);
    setSelectedProductId(null);
    setCreatingOption(false);
    setNewOptionData({
      name: "",
      description: "",
      type: "RADIO",
      isRequired: false,
    });
  };

  const assignOptionToProduct = async (optionId: string) => {
    if (!selectedProductId) return;

    try {
      const response = await fetch(
        `/api/admin/products/${selectedProductId}/options`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionId }),
        }
      );

      if (response.ok) {
        await fetchMenuData();
        await fetchAvailableOptions();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to assign option");
      }
    } catch (error) {
      console.error("Error assigning option:", error);
      alert("Failed to assign option");
    }
  };

  const unassignOptionFromProduct = async (
    productId: string,
    optionId: string
  ) => {
    if (
      !confirm(
        "Are you sure you want to unassign this option from the product?"
      )
    )
      return;

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/options?optionId=${optionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchMenuData();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to unassign option");
      }
    } catch (error) {
      console.error("Error unassigning option:", error);
      alert("Failed to unassign option");
    }
  };

  const createNewOption = async () => {
    if (!newOptionData.name.trim()) return;

    try {
      const response = await fetch("/api/admin/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOptionData),
      });

      if (response.ok) {
        const data = await response.json();
        if (selectedProductId) {
          // Immediately assign to current product if we have one selected
          await assignOptionToProduct(data.option.id);
        }
        await fetchAvailableOptions();
        setCreatingOption(false);
        setNewOptionData({
          name: "",
          description: "",
          type: "RADIO",
          isRequired: false,
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create option");
      }
    } catch (error) {
      console.error("Error creating option:", error);
      alert("Failed to create option");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading menu...</div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Menu not found</h1>
          <p className="text-muted-foreground">
            Please ensure the location has a menu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground">{menuData.name}</p>
        </div>
        <Button onClick={() => startEditing("categories")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Create New Category Form */}
      {editingItem && editingItem.type === "categories" && !editingItem.id && (
        <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Add Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    placeholder="Enter name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sort Order
                  </label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sortOrder: e.target.value,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Optional description"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="isActive" className="text-sm">
                  Active
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" variant="brand">
                  Create
                </Button>
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Option Manager Modal */}
      {showOptionManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Manage Product Options</CardTitle>
                <Button variant="ghost" size="sm" onClick={closeOptionManager}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create New Option Section */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Create New Option</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreatingOption(!creatingOption)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {creatingOption ? "Cancel" : "Create Option"}
                  </Button>
                </div>

                {creatingOption && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Name
                        </label>
                        <Input
                          value={newOptionData.name}
                          onChange={(e) =>
                            setNewOptionData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g., Size, Extras"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Type
                        </label>
                        <select
                          value={newOptionData.type}
                          onChange={(e) =>
                            setNewOptionData((prev) => ({
                              ...prev,
                              type: e.target.value as "RADIO" | "MULTISELECT",
                            }))
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="RADIO">Single Select</option>
                          <option value="MULTISELECT">Multi Select</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <Input
                        value={newOptionData.description}
                        onChange={(e) =>
                          setNewOptionData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="newOptionRequired"
                        checked={newOptionData.isRequired}
                        onChange={(e) =>
                          setNewOptionData((prev) => ({
                            ...prev,
                            isRequired: e.target.checked,
                          }))
                        }
                      />
                      <label htmlFor="newOptionRequired" className="text-sm">
                        Required option
                      </label>
                    </div>
                    <Button
                      onClick={createNewOption}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create & Assign Option
                    </Button>
                  </div>
                )}
              </div>

              {/* Available Options */}
              <div>
                <h4 className="font-medium mb-3">Available Options</h4>
                {availableOptions.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No standalone options available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <span className="font-medium">{option.name}</span>
                          {option.description && (
                            <span className="text-gray-500 ml-2">
                              - {option.description}
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                option.type === "RADIO"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {option.type === "RADIO"
                                ? "Single Select"
                                : "Multi Select"}
                            </Badge>
                            {option.isRequired && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {option.optionValues?.length || 0} values
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => assignOptionToProduct(option.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Assign
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {menuData.categories
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((category) => (
            <Card
              key={category.id}
              className={category.isActive ? "" : "opacity-60"}
            >
              {/* Category Edit Form (inline) */}
              {editingItem &&
              editingItem.type === "categories" &&
              editingItem.id === category.id ? (
                <div className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle>Edit Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Name *
                          </label>
                          <Input
                            value={formData.name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            required
                            placeholder="Enter name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Sort Order
                          </label>
                          <Input
                            type="number"
                            value={formData.sortOrder}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                sortOrder: e.target.value,
                              }))
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Description
                        </label>
                        <Input
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Optional description"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`isActive-${category.id}`}
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                        />
                        <label
                          htmlFor={`isActive-${category.id}`}
                          className="text-sm"
                        >
                          Active
                        </label>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" variant="brand">
                          Update
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </div>
              ) : (
                <>
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 flex items-center justify-center">
                          {expandedCategories.has(category.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <FolderOpen className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">
                            {category.name}
                          </CardTitle>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant={category.isActive ? "default" : "secondary"}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            startEditing("products", undefined, category.id)
                          }
                        >
                          <Plus className="h-4 w-4" />
                          Add Product
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleItemStatus(
                              "categories",
                              category.id,
                              "isActive",
                              category.isActive
                            )
                          }
                        >
                          {category.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing("categories", category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDelete("categories", category.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Products List */}
                  {expandedCategories.has(category.id) && (
                    <CardContent>
                      <div className="space-y-3 ml-8">
                        {/* Product Create Form (inline) */}
                        {editingItem &&
                          editingItem.type === "products" &&
                          !editingItem.id &&
                          editingItem.categoryId === category.id && (
                            <Card className="border-green-200 bg-green-50">
                              <CardHeader>
                                <CardTitle className="text-sm">
                                  Add Product
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <form
                                  onSubmit={handleSubmit}
                                  className="space-y-3"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        Name *
                                      </label>
                                      <Input
                                        value={formData.name}
                                        onChange={(e) =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                          }))
                                        }
                                        required
                                        placeholder="Enter name"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium mb-1">
                                        Price *
                                      </label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            price: e.target.value,
                                          }))
                                        }
                                        required
                                        placeholder="0.00"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-1">
                                      Description
                                    </label>
                                    <Input
                                      value={formData.description}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          description: e.target.value,
                                        }))
                                      }
                                      placeholder="Optional description"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id={`isAvailable-${category.id}-new`}
                                      checked={formData.isAvailable}
                                      onChange={(e) =>
                                        setFormData((prev) => ({
                                          ...prev,
                                          isAvailable: e.target.checked,
                                        }))
                                      }
                                    />
                                    <label
                                      htmlFor={`isAvailable-${category.id}-new`}
                                      className="text-sm"
                                    >
                                      Available
                                    </label>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="submit"
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Create
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={cancelEditing}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              </CardContent>
                            </Card>
                          )}

                        {category.products
                          .sort((a, b) => a.sortOrder - b.sortOrder)
                          .map((product) => (
                            <Card
                              key={product.id}
                              className={`${
                                product.isAvailable ? "" : "opacity-60"
                              } border-l-4 border-l-blue-200`}
                            >
                              {/* Product Edit Form (inline) */}
                              {editingItem &&
                              editingItem.type === "products" &&
                              editingItem.id === product.id ? (
                                <div className="border-green-200 bg-green-50">
                                  <CardHeader>
                                    <CardTitle className="text-sm">
                                      Edit Product
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <form
                                      onSubmit={handleSubmit}
                                      className="space-y-3"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-sm font-medium mb-1">
                                            Name *
                                          </label>
                                          <Input
                                            value={formData.name}
                                            onChange={(e) =>
                                              setFormData((prev) => ({
                                                ...prev,
                                                name: e.target.value,
                                              }))
                                            }
                                            required
                                            placeholder="Enter name"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium mb-1">
                                            Price *
                                          </label>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) =>
                                              setFormData((prev) => ({
                                                ...prev,
                                                price: e.target.value,
                                              }))
                                            }
                                            required
                                            placeholder="0.00"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium mb-1">
                                          Description
                                        </label>
                                        <Input
                                          value={formData.description}
                                          onChange={(e) =>
                                            setFormData((prev) => ({
                                              ...prev,
                                              description: e.target.value,
                                            }))
                                          }
                                          placeholder="Optional description"
                                        />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id={`isAvailable-${product.id}`}
                                          checked={formData.isAvailable}
                                          onChange={(e) =>
                                            setFormData((prev) => ({
                                              ...prev,
                                              isAvailable: e.target.checked,
                                            }))
                                          }
                                        />
                                        <label
                                          htmlFor={`isAvailable-${product.id}`}
                                          className="text-sm"
                                        >
                                          Available
                                        </label>
                                      </div>

                                      {/* Option Management for Product Editing */}
                                      <div className="border-t pt-3">
                                        <div className="flex items-center justify-between mb-3">
                                          <h4 className="text-sm font-semibold text-gray-900">
                                            Product Options
                                          </h4>
                                          <Button
                                            type="button"
                                            onClick={() =>
                                              openOptionManager(editingItem.id!)
                                            }
                                            className="bg-blue-600 hover:bg-blue-700"
                                            size="sm"
                                          >
                                            <Settings className="w-3 h-3 mr-1" />
                                            Manage Options
                                          </Button>
                                        </div>

                                        {/* Current Product Options */}
                                        {product.options.length > 0 ? (
                                          <div className="space-y-2">
                                            {product.options.map((option) => (
                                              <div
                                                key={option.id}
                                                className="flex items-center justify-between p-2 bg-gray-100 rounded-md text-xs"
                                              >
                                                <div>
                                                  <span className="font-medium">
                                                    {option.name}
                                                  </span>
                                                  {option.description && (
                                                    <span className="text-gray-500 ml-1">
                                                      - {option.description}
                                                    </span>
                                                  )}
                                                  <div className="flex items-center gap-1 mt-1">
                                                    <Badge
                                                      variant={
                                                        option.type === "RADIO"
                                                          ? "default"
                                                          : "secondary"
                                                      }
                                                      className="text-xs"
                                                    >
                                                      {option.type === "RADIO"
                                                        ? "Single"
                                                        : "Multi"}
                                                    </Badge>
                                                    {option.isRequired && (
                                                      <Badge
                                                        variant="destructive"
                                                        className="text-xs"
                                                      >
                                                        Req.
                                                      </Badge>
                                                    )}
                                                    <span className="text-xs text-gray-500">
                                                      {option.optionValues
                                                        ?.length || 0}{" "}
                                                      values
                                                    </span>
                                                  </div>
                                                </div>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    unassignOptionFromProduct(
                                                      editingItem.id!,
                                                      option.id
                                                    )
                                                  }
                                                  className="text-red-600 border-red-200 hover:bg-red-50 h-6 w-6 p-0"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-gray-500 text-xs">
                                            No options assigned to this product
                                          </p>
                                        )}
                                      </div>

                                      <div className="flex gap-2 pt-3">
                                        <Button
                                          type="submit"
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          Update
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={cancelEditing}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </form>
                                  </CardContent>
                                </div>
                              ) : (
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Package className="h-4 w-4" />
                                      <div>
                                        <h4 className="font-medium">
                                          {product.name}
                                        </h4>
                                        {product.description && (
                                          <p className="text-sm text-muted-foreground">
                                            {product.description}
                                          </p>
                                        )}
                                        <p className="text-sm font-medium text-green-600">
                                          ${Number(product.price).toFixed(2)}
                                        </p>
                                      </div>
                                      <Badge
                                        variant={
                                          product.isAvailable
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {product.isAvailable
                                          ? "Available"
                                          : "Unavailable"}
                                      </Badge>
                                      {product.options.length > 0 && (
                                        <Badge variant="outline">
                                          {product.options.length} option
                                          {product.options.length !== 1
                                            ? "s"
                                            : ""}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          toggleItemStatus(
                                            "products",
                                            product.id,
                                            "isAvailable",
                                            product.isAvailable
                                          )
                                        }
                                      >
                                        {product.isAvailable ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          startEditing(
                                            "products",
                                            product,
                                            category.id
                                          )
                                        }
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDelete("products", product.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                      {product.options.length > 0 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          title="Manage Options"
                                          onClick={() =>
                                            openOptionManager(product.id)
                                          }
                                        >
                                          <Settings className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              )}
                            </Card>
                          ))}

                        {category.products.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No products in this category.
                            <Button
                              variant="ghost"
                              className="ml-2"
                              onClick={() =>
                                startEditing("products", undefined, category.id)
                              }
                            >
                              Add the first product
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </>
              )}
            </Card>
          ))}

        {menuData.categories.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No categories yet.
              <Button
                variant="ghost"
                className="ml-2"
                onClick={() => startEditing("categories")}
              >
                Create your first category
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
