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
  Settings,
  Package,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";

interface ProductOptionValue {
  id: string;
  name: string;
  priceModifier: number;
  isDefault: boolean;
  sortOrder: number;
}

interface ProductOption {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  type: "RADIO" | "MULTISELECT";
  isRequired: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  optionValues: ProductOptionValue[];
  product?: {
    id: string;
    name: string;
    category: {
      name: string;
    };
  };
}

interface EditingOption {
  type: "option" | "value";
  optionId?: string;
  valueId?: string;
  data: {
    name: string;
    description?: string;
    type?: "RADIO" | "MULTISELECT";
    isRequired?: boolean;
    priceModifier?: number;
    isDefault?: boolean;
  };
}

export default function OptionsPage() {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingOption | null>(null);
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(
    new Set()
  );

  // Fetch all options
  const fetchOptions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/options");
      const data = await response.json();
      if (data.success) {
        setOptions(data.options);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  // Toggle option expansion
  const toggleExpanded = (optionId: string) => {
    const newExpanded = new Set(expandedOptions);
    if (newExpanded.has(optionId)) {
      newExpanded.delete(optionId);
    } else {
      newExpanded.add(optionId);
    }
    setExpandedOptions(newExpanded);
  };

  // Start editing
  const startEditing = (
    type: "option" | "value",
    optionId?: string,
    valueId?: string
  ) => {
    if (type === "option" && optionId) {
      const option = options.find((o) => o.id === optionId);
      setEditing({
        type: "option",
        optionId,
        data: {
          name: option?.name || "",
          description: option?.description || "",
          type: option?.type || "RADIO",
          isRequired: option?.isRequired || false,
        },
      });
    } else if (type === "option") {
      setEditing({
        type: "option",
        data: {
          name: "",
          description: "",
          type: "RADIO",
          isRequired: false,
        },
      });
    } else if (type === "value" && optionId && valueId) {
      const option = options.find((o) => o.id === optionId);
      const value = option?.optionValues.find((v) => v.id === valueId);
      setEditing({
        type: "value",
        optionId,
        valueId,
        data: {
          name: value?.name || "",
          priceModifier: value?.priceModifier || 0,
          isDefault: value?.isDefault || false,
        },
      });
    } else if (type === "value" && optionId) {
      setEditing({
        type: "value",
        optionId,
        data: {
          name: "",
          priceModifier: 0,
          isDefault: false,
        },
      });
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditing(null);
  };

  // Handle option save
  const handleOptionSave = async () => {
    if (!editing || editing.type !== "option") return;

    try {
      const url = editing.optionId
        ? `/api/admin/options/${editing.optionId}`
        : "/api/admin/options";

      const method = editing.optionId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing.data),
      });

      if (response.ok) {
        await fetchOptions();
        setEditing(null);
      } else {
        console.error("Failed to save option");
      }
    } catch (error) {
      console.error("Error saving option:", error);
    }
  };

  // Handle option value save
  const handleValueSave = async () => {
    if (!editing || editing.type !== "value" || !editing.optionId) return;

    try {
      const url = editing.valueId
        ? `/api/admin/options/${editing.optionId}/values/${editing.valueId}`
        : `/api/admin/options/${editing.optionId}/values`;

      const method = editing.valueId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing.data),
      });

      if (response.ok) {
        await fetchOptions();
        setEditing(null);
      } else {
        console.error("Failed to save option value");
      }
    } catch (error) {
      console.error("Error saving option value:", error);
    }
  };

  // Delete option
  const deleteOption = async (optionId: string) => {
    if (!confirm("Are you sure you want to delete this option?")) return;

    try {
      const response = await fetch(`/api/admin/options/${optionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchOptions();
      } else {
        console.error("Failed to delete option");
      }
    } catch (error) {
      console.error("Error deleting option:", error);
    }
  };

  // Delete option value
  const deleteValue = async (optionId: string, valueId: string) => {
    if (!confirm("Are you sure you want to delete this option value?")) return;

    try {
      const response = await fetch(
        `/api/admin/options/${optionId}/values/${valueId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchOptions();
      } else {
        console.error("Failed to delete option value");
      }
    } catch (error) {
      console.error("Error deleting option value:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading options...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            Option Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage product options that can be assigned to products
          </p>
        </div>
        <Button
          onClick={() => startEditing("option")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Option
        </Button>
      </div>

      {/* Create New Option Form */}
      {editing && editing.type === "option" && !editing.optionId && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Create New Option</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                value={editing.data.name}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    data: { ...editing.data, name: e.target.value },
                  })
                }
                placeholder="e.g., Size, Toppings"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Input
                value={editing.data.description}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    data: { ...editing.data, description: e.target.value },
                  })
                }
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={editing.data.type}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    data: {
                      ...editing.data,
                      type: e.target.value as "RADIO" | "MULTISELECT",
                    },
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="RADIO">Single Select (Radio)</option>
                <option value="MULTISELECT">Multi Select (Checkbox)</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={editing.data.isRequired}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    data: { ...editing.data, isRequired: e.target.checked },
                  })
                }
                className="mr-2"
              />
              <label
                htmlFor="isRequired"
                className="text-sm font-medium text-gray-700"
              >
                Required option
              </label>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleOptionSave}
                className="bg-green-600 hover:bg-green-700"
              >
                Save Option
              </Button>
              <Button onClick={cancelEditing} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Options List */}
      <div className="space-y-4">
        {options.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No options yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first product option to get started
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => startEditing("option")}
              >
                Create Option
              </Button>
            </CardContent>
          </Card>
        ) : (
          options.map((option) => (
            <Card key={option.id} className="border">
              {/* Option Edit Form (inline) */}
              {editing &&
              editing.type === "option" &&
              editing.optionId === option.id ? (
                <div className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Edit Option</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <Input
                        value={editing.data.name}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: { ...editing.data, name: e.target.value },
                          })
                        }
                        placeholder="e.g., Size, Toppings"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <Input
                        value={editing.data.description}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: {
                              ...editing.data,
                              description: e.target.value,
                            },
                          })
                        }
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={editing.data.type}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: {
                              ...editing.data,
                              type: e.target.value as "RADIO" | "MULTISELECT",
                            },
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="RADIO">Single Select (Radio)</option>
                        <option value="MULTISELECT">
                          Multi Select (Checkbox)
                        </option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`isRequired-${option.id}`}
                        checked={editing.data.isRequired}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            data: {
                              ...editing.data,
                              isRequired: e.target.checked,
                            },
                          })
                        }
                        className="mr-2"
                      />
                      <label
                        htmlFor={`isRequired-${option.id}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Required option
                      </label>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleOptionSave}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Save Option
                      </Button>
                      <Button onClick={cancelEditing} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </div>
              ) : (
                <>
                  <CardHeader
                    className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpanded(option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 flex items-center justify-center">
                          {expandedOptions.has(option.id) ? (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            {option.name}
                          </h3>
                          {option.description && (
                            <p className="text-gray-600 text-sm">
                              {option.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                option.type === "RADIO"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {option.type === "RADIO"
                                ? "Single Select"
                                : "Multi Select"}
                            </Badge>
                            {option.isRequired && (
                              <Badge variant="destructive">Required</Badge>
                            )}
                            {option.product && (
                              <Badge variant="outline">
                                {option.product.category.name} →{" "}
                                {option.product.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing("option", option.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteOption(option.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedOptions.has(option.id) && (
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            Option Values
                          </h4>
                          <Button
                            size="sm"
                            onClick={() => startEditing("value", option.id)}
                            className="bg-green-600 hover:bg-green-700 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Value
                          </Button>
                        </div>

                        {/* Option Value Add/Edit Form (inline) */}
                        {editing &&
                          editing.type === "value" &&
                          editing.optionId === option.id && (
                            <Card className="mb-4 border-green-200 bg-green-50">
                              <CardHeader>
                                <CardTitle className="text-sm">
                                  {editing.valueId
                                    ? "Edit Option Value"
                                    : "Add Option Value"}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                  </label>
                                  <Input
                                    value={editing.data.name}
                                    onChange={(e) =>
                                      setEditing({
                                        ...editing,
                                        data: {
                                          ...editing.data,
                                          name: e.target.value,
                                        },
                                      })
                                    }
                                    placeholder="e.g., Large, Extra Cheese"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price Modifier ($)
                                  </label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editing.data.priceModifier}
                                    onChange={(e) =>
                                      setEditing({
                                        ...editing,
                                        data: {
                                          ...editing.data,
                                          priceModifier:
                                            parseFloat(e.target.value) || 0,
                                        },
                                      })
                                    }
                                    placeholder="0.00"
                                  />
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`isDefault-${option.id}-${
                                      editing.valueId || "new"
                                    }`}
                                    checked={editing.data.isDefault}
                                    onChange={(e) =>
                                      setEditing({
                                        ...editing,
                                        data: {
                                          ...editing.data,
                                          isDefault: e.target.checked,
                                        },
                                      })
                                    }
                                    className="mr-2"
                                  />
                                  <label
                                    htmlFor={`isDefault-${option.id}-${
                                      editing.valueId || "new"
                                    }`}
                                    className="text-sm font-medium text-gray-700"
                                  >
                                    Default selection
                                  </label>
                                </div>
                                <div className="flex gap-3">
                                  <Button
                                    onClick={handleValueSave}
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                  >
                                    Save Value
                                  </Button>
                                  <Button
                                    onClick={cancelEditing}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                        {option.optionValues.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No values defined
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {option.optionValues
                              .sort((a, b) => a.sortOrder - b.sortOrder)
                              .map((value) => (
                                <div
                                  key={value.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="font-medium">
                                      {value.name}
                                    </span>
                                    {Number(value.priceModifier) !== 0 && (
                                      <Badge
                                        variant="outline"
                                        className="flex items-center gap-1"
                                      >
                                        <DollarSign className="h-3 w-3" />
                                        {Number(value.priceModifier) > 0
                                          ? "+"
                                          : ""}
                                        {Number(value.priceModifier).toFixed(2)}
                                      </Badge>
                                    )}
                                    {value.isDefault && (
                                      <Badge
                                        variant="default"
                                        className="text-xs"
                                      >
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        startEditing(
                                          "value",
                                          option.id,
                                          value.id
                                        )
                                      }
                                      className="h-7 w-7 p-0"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        deleteValue(option.id, value.id)
                                      }
                                      className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
