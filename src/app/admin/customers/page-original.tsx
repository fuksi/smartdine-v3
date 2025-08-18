"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Plus,
  Search,
  Clock,
  Edit2,
  Trash2,
  Gift,
  RotateCcw,
  X,
} from "lucide-react";

interface Stamp {
  id: string;
  isClaimed: boolean;
  claimedAt: string | null;
  createdAt: string;
}

interface StampCard {
  id: string;
  phoneNumber: string;
  firstName: string;
  stampsRequired: number;
  createdAt: string;
  updatedAt: string;
  stamps: Stamp[];
  totalStamps: number;
  claimedStamps: number;
  unclaimedStamps: number;
  canClaim: boolean;
}

export default function CustomersPage() {
  const [stampCards, setStampCards] = useState<StampCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [searchBy, setSearchBy] = useState("contact"); // "contact" or "cardNumber"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<StampCard | null>(null);
  const [claimAmount, setClaimAmount] = useState(9);

  // Create form state
  const [createFormData, setCreateFormData] = useState({
    phoneNumber: "",
    firstName: "",
  });

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    firstName: "",
  });

  const [phoneNumberValid, setPhoneNumberValid] = useState(false);

  // Mock location ID - in real app, this would come from context/auth
  const locationId = "loc1";

  const searchStampCards = async () => {
    if (!searchPhone.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/stampcards?phone=${encodeURIComponent(
          searchPhone
        )}&locationId=${locationId}`
      );
      const data = await response.json();
      setStampCards(data);
    } catch (error) {
      console.error("Error searching stampcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRecentStampCards = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/stampcards?recent=true&locationId=${locationId}`
      );
      const data = await response.json();
      setStampCards(data);
    } catch (error) {
      console.error("Error fetching recent stampcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const createStampCard = async () => {
    if (
      !createFormData.phoneNumber ||
      !createFormData.firstName ||
      !phoneNumberValid
    ) {
      alert("Please fill in all required fields with valid data");
      return;
    }

    try {
      const response = await fetch("/api/admin/stampcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createFormData,
          locationId,
        }),
      });

      if (response.ok) {
        const newCard = await response.json();
        setStampCards([newCard, ...stampCards]);
        setShowCreateForm(false);
        setCreateFormData({
          phoneNumber: "",
          firstName: "",
          stampsRequired: 10,
        });
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create stampcard");
      }
    } catch (error) {
      console.error("Error creating stampcard:", error);
      alert("Failed to create stampcard");
    }
  };

  const addStamp = async (stampCardId: string) => {
    try {
      const response = await fetch("/api/admin/stamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stampCardId }),
      });

      if (response.ok) {
        // Refresh the stampcard data
        if (searchPhone) {
          searchStampCards();
        } else {
          getRecentStampCards();
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add stamp");
      }
    } catch (error) {
      console.error("Error adding stamp:", error);
      alert("Failed to add stamp");
    }
  };

  const claimStamps = async (stampCardId: string, stampsRequired: number) => {
    try {
      const response = await fetch("/api/admin/stamps/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stampCardId,
          claimCount: stampsRequired,
        }),
      });

      if (response.ok) {
        // Refresh the stampcard data
        if (searchPhone) {
          searchStampCards();
        } else {
          getRecentStampCards();
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to claim stamps");
      }
    } catch (error) {
      console.error("Error claiming stamps:", error);
      alert("Failed to claim stamps");
    }
  };

  const undoLastStamp = async (stampCardId: string) => {
    try {
      const response = await fetch("/api/admin/stamps/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stampCardId }),
      });

      if (response.ok) {
        // Refresh the stampcard data
        if (searchPhone) {
          searchStampCards();
        } else {
          getRecentStampCards();
        }
      } else {
        const error = await response.json();
        alert(error.error || "Failed to undo stamp");
      }
    } catch (error) {
      console.error("Error undoing stamp:", error);
      alert("Failed to undo stamp");
    }
  };

  const startEditing = (card: StampCard) => {
    setEditingCard(card);
    setEditFormData({
      firstName: card.firstName,
    });
  };

  const updateStampCard = async () => {
    if (!editingCard || !editFormData.firstName) return;

    try {
      const response = await fetch(`/api/admin/stampcards/${editingCard.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedCard = await response.json();
        setStampCards(
          stampCards.map((card) =>
            card.id === editingCard.id ? updatedCard : card
          )
        );
        setEditingCard(null);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update stampcard");
      }
    } catch (error) {
      console.error("Error updating stampcard:", error);
      alert("Failed to update stampcard");
    }
  };

  const deleteStampCard = async (stampCardId: string) => {
    if (!confirm("Are you sure you want to delete this stampcard?")) return;

    try {
      const response = await fetch(`/api/admin/stampcards/${stampCardId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStampCards(stampCards.filter((card) => card.id !== stampCardId));
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete stampcard");
      }
    } catch (error) {
      console.error("Error deleting stampcard:", error);
      alert("Failed to delete stampcard");
    }
  };

  const renderStamps = (card: StampCard) => {
    const totalSlots = Math.max(card.stampsRequired, card.totalStamps);
    const stamps = [];

    for (let i = 0; i < totalSlots; i++) {
      const stamp = card.stamps[i];
      let stampClass =
        "w-8 h-8 rounded-full border-2 flex items-center justify-center";

      if (stamp && !stamp.isClaimed) {
        stampClass += " bg-blue-100 border-blue-500 text-blue-700";
      } else if (stamp && stamp.isClaimed) {
        stampClass += " bg-green-100 border-green-500 text-green-700";
      } else {
        stampClass += " bg-gray-100 border-gray-300 text-gray-400";
      }

      stamps.push(
        <div key={i} className={stampClass}>
          {stamp ? (
            stamp.isClaimed ? (
              <Gift className="w-4 h-4" />
            ) : (
              <CircleDot className="w-4 h-4" />
            )
          ) : (
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          )}
        </div>
      );
    }

    return stamps;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customers & Loyalty</h1>
        <p className="text-muted-foreground">
          Manage customer stampcards and loyalty rewards
        </p>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Stampcard Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Search by Phone Number
              </label>
              <Input
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Enter part of phone number..."
                onKeyDown={(e) => e.key === "Enter" && searchStampCards()}
              />
            </div>
            <Button onClick={searchStampCards} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={getRecentStampCards}
              disabled={loading}
            >
              <Clock className="w-4 h-4 mr-2" />
              Last 30 Created
            </Button>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Stampcard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Stampcard Form */}
      {showCreateForm && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle>Create New Stampcard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number *
                </label>
                <PhoneInput
                  value={createFormData.phoneNumber}
                  onChange={(phone, isValid) => {
                    setCreateFormData((prev) => ({
                      ...prev,
                      phoneNumber: phone,
                    }));
                    setPhoneNumberValid(isValid);
                  }}
                  defaultCountry="FI"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name *
                </label>
                <Input
                  value={createFormData.firstName}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="Customer's first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stamps Required for Reward
                </label>
                <Input
                  type="number"
                  value={createFormData.stampsRequired}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      stampsRequired: parseInt(e.target.value) || 10,
                    }))
                  }
                  min="1"
                  max="50"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={createStampCard}
                className="bg-green-600 hover:bg-green-700"
                disabled={!phoneNumberValid || !createFormData.firstName}
              >
                Create Stampcard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateFormData({
                    phoneNumber: "",
                    firstName: "",
                    stampsRequired: 10,
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stampcard Results */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">Loading...</div>
          </CardContent>
        </Card>
      )}

      {!loading &&
        stampCards.length === 0 &&
        (searchPhone || stampCards.length === 0) && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500">
                {searchPhone
                  ? "No stampcards found for this phone number"
                  : "No stampcards found"}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Stampcard List */}
      <div className="space-y-4">
        {stampCards.map((card) => (
          <Card key={card.id} className="relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Customer Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      {editingCard?.id === card.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editFormData.firstName}
                            onChange={(e) =>
                              setEditFormData((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                            className="w-40"
                          />
                          <Button size="sm" onClick={updateStampCard}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCard(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <h3 className="text-lg font-semibold">
                          {card.firstName}
                        </h3>
                      )}
                    </div>
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {card.phoneNumber}
                    </span>
                  </div>

                  {/* Stamps Display */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium">Progress:</span>
                      <Badge variant="outline">
                        {card.unclaimedStamps}/{card.stampsRequired} stamps
                      </Badge>
                      {card.canClaim && (
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          Reward Available!
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {renderStamps(card)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Total: {card.totalStamps}</span>
                    <span>Claimed: {card.claimedStamps}</span>
                    <span>Available: {card.unclaimedStamps}</span>
                    <span>
                      Created: {new Date(card.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    onClick={() => addStamp(card.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Stamp
                  </Button>

                  {card.canClaim && (
                    <Button
                      size="sm"
                      onClick={() => claimStamps(card.id, card.stampsRequired)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Claim
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => undoLastStamp(card.id)}
                    disabled={card.totalStamps === 0}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Undo
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing(card)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Details
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteStampCard(card.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
